// FILE: /web/app/api/cart/line/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCart, updateCartLines, removeCartLines } from "@/lib/shopify";

const CART_COOKIE_NAME = "cartId";

type UpdateLineBody = {
  lineId?: string;
  quantity?: number;
};

type DeleteLinesBody = {
  lineIds?: string[];
};

function getCartIdFromRequest(req: NextRequest): string | null {
  const cookie = req.cookies.get(CART_COOKIE_NAME);
  return cookie?.value ?? null;
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function internalError(message = "Internal server error") {
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function PUT(req: NextRequest) {
  let body: UpdateLineBody;

  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const { lineId, quantity } = body;

  if (!lineId || typeof lineId !== "string") {
    return badRequest("Missing or invalid 'lineId'.");
  }

  if (
    typeof quantity !== "number" ||
    !Number.isFinite(quantity) ||
    !Number.isInteger(quantity) ||
    quantity < 1
  ) {
    return badRequest("Missing or invalid 'quantity'. Must be an integer >= 1.");
  }

  const cartId = getCartIdFromRequest(req);
  if (!cartId) {
    return badRequest("Missing cart ID cookie.");
  }

  try {
    await updateCartLines(cartId, [
      {
        id: lineId,
        quantity,
      },
    ]);

    const cart = await getCart(cartId);
    return NextResponse.json(cart ?? null, { status: 200 });
  } catch (err) {
    console.error("Failed to update cart line:", err);
    return internalError();
  }
}

export async function DELETE(req: NextRequest) {
  let body: DeleteLinesBody;

  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const { lineIds } = body;

  if (!Array.isArray(lineIds) || lineIds.length === 0) {
    return badRequest(
      "Missing or invalid 'lineIds'. Must be a non-empty array."
    );
  }

  if (lineIds.some((id) => typeof id !== "string" || !id)) {
    return badRequest("Each 'lineIds' entry must be a non-empty string.");
  }

  const cartId = getCartIdFromRequest(req);
  if (!cartId) {
    return badRequest("Missing cart ID cookie.");
  }

  try {
    await removeCartLines(cartId, lineIds as string[]);

    const cart = await getCart(cartId);
    return NextResponse.json(cart ?? null, { status: 200 });
  } catch (err) {
    console.error("Failed to remove cart lines:", err);
    return internalError();
  }
}

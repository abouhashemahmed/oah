// FILE: /web/app/api/cart/line/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getCart,
  updateCartLines,
  removeCartLines,
} from "@/lib/shopify";

const CART_COOKIE = "cartId";
const IS_PROD = process.env.NODE_ENV === "production";

/* -----------------------------------------
   HELPER: bad request
------------------------------------------ */
function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

/* -----------------------------------------
   HELPER: internal error
------------------------------------------ */
function internalError(message = "Internal server error") {
  return NextResponse.json({ error: message }, { status: 500 });
}

/* -----------------------------------------
   Get cartId from cookies
------------------------------------------ */
function getCartId(req: NextRequest): string | null {
  return req.cookies.get(CART_COOKIE)?.value ?? null;
}

/* =========================================
   PUT  →  Update Line Quantity
========================================= */
export async function PUT(req: NextRequest) {
  let json;
  try {
    json = await req.json();
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const { lineId, quantity } = json ?? {};

  if (!lineId || typeof lineId !== "string") {
    return badRequest("Missing or invalid 'lineId'.");
  }

  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty < 1) {
    return badRequest("'quantity' must be an integer >= 1.");
  }

  const cartId = getCartId(req);
  if (!cartId) {
    return badRequest("Cart ID cookie not found.");
  }

  try {
    await updateCartLines(cartId, [
      {
        id: lineId,
        quantity: qty,
      },
    ]);

    const updatedCart = await getCart(cartId);

    const response = NextResponse.json(updatedCart ?? null, {
      status: 200,
    });

    response.cookies.set(CART_COOKIE, cartId, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: IS_PROD,               // ✅ only secure in production
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (err) {
    console.error("PUT /api/cart/line FAILED:", err);
    return internalError();
  }
}

/* =========================================
   DELETE  →  Remove Line(s)
========================================= */
export async function DELETE(req: NextRequest) {
  let json;
  try {
    json = await req.json();
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const { lineIds } = json ?? {};

  if (!Array.isArray(lineIds) || lineIds.length === 0) {
    return badRequest("'lineIds' must be a non-empty array.");
  }

  if (lineIds.some((id) => typeof id !== "string" || !id)) {
    return badRequest("Each lineId must be a non-empty string.");
  }

  const cartId = getCartId(req);
  if (!cartId) {
    return badRequest("Cart ID cookie not found.");
  }

  try {
    await removeCartLines(cartId, lineIds);

    const updatedCart = await getCart(cartId);

    const response = NextResponse.json(updatedCart ?? null, {
      status: 200,
    });

    response.cookies.set(CART_COOKIE, cartId, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: IS_PROD,               // ✅ only secure in production
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (err) {
    console.error("DELETE /api/cart/line FAILED:", err);
    return internalError();
  }
}

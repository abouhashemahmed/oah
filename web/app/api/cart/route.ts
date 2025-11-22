// FILE: /web/app/api/cart/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getCart,
  createCart,
  addToCart,
} from "@/lib/shopify";

const CART_COOKIE_NAME = "cartId";

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function internalError(message = "Internal server error") {
  return NextResponse.json({ error: message }, { status: 500 });
}

function getCartIdFromRequest(req: NextRequest): string | null {
  const cookie = req.cookies.get(CART_COOKIE_NAME);
  return cookie?.value ?? null;
}

/**
 * GET /api/cart
 * Optional helper if you ever want to fetch the cart via client fetch.
 */
export async function GET(req: NextRequest) {
  const cartId = getCartIdFromRequest(req);
  if (!cartId) {
    // No cart yet
    return NextResponse.json(null, { status: 200 });
  }

  try {
    const cart = await getCart(cartId);
    return NextResponse.json(cart ?? null, { status: 200 });
  } catch (err) {
    console.error("GET /api/cart error:", err);
    return internalError();
  }
}

/**
 * POST /api/cart
 * Body: { merchandiseId: string; quantity?: number }
 * - If no cart exists, creates one and sets the cartId cookie.
 * - If a cart exists, adds the line to that cart.
 */
export async function POST(req: NextRequest) {
  let body: { merchandiseId?: string; quantity?: number };

  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const merchandiseId = body.merchandiseId;
  const quantity =
    typeof body.quantity === "number" && Number.isFinite(body.quantity)
      ? Math.max(1, Math.floor(body.quantity))
      : 1;

  if (!merchandiseId || typeof merchandiseId !== "string") {
    return badRequest("Missing or invalid 'merchandiseId'.");
  }

  const existingCartId = getCartIdFromRequest(req);

  try {
    let cartId = existingCartId;

    // If we don't have a cart yet, create one
    if (!cartId) {
      const result = await createCart([
        {
          merchandiseId,
          quantity,
        },
      ]);

      const userErrors = result?.cartCreate?.userErrors ?? [];
      if (userErrors.length > 0) {
        console.error("cartCreate userErrors:", userErrors);
        return badRequest(userErrors[0]?.message || "Failed to create cart.");
      }

      const cart = result?.cartCreate?.cart;
      if (!cart?.id) {
        return internalError("Cart creation did not return a valid cart.");
      }

      cartId = cart.id;

      const response = NextResponse.json(cart, { status: 200 });
      response.cookies.set(CART_COOKIE_NAME, cartId, {
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      return response;
    }

    // If we DO have a cart, just add to it
    const result = await addToCart(cartId, [
      {
        merchandiseId,
        quantity,
      },
    ]);

    const userErrors = result?.cartLinesAdd?.userErrors ?? [];
    if (userErrors.length > 0) {
      console.error("cartLinesAdd userErrors:", userErrors);
      return badRequest(userErrors[0]?.message || "Failed to add to cart.");
    }

    const updatedCart = await getCart(cartId);
    return NextResponse.json(updatedCart ?? null, { status: 200 });
  } catch (err) {
    console.error("POST /api/cart error:", err);
    return internalError();
  }
}


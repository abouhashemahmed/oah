// FILE: /web/app/api/cart/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCart, createCart, addToCart } from "@/lib/shopify";

const CART_COOKIE = "cartId";
const IS_PROD = process.env.NODE_ENV === "production";

/* Helper to parse and validate add-to-cart body */
function parseAddToCart(body: any) {
  if (!body || typeof body !== "object") {
    return { error: "Invalid request body." };
  }
  const { merchandiseId, quantity } = body;
  if (!merchandiseId || typeof merchandiseId !== "string") {
    return { error: "Missing or invalid merchandiseId." };
  }
  const qty = Number(quantity ?? 1);
  if (!Number.isInteger(qty) || qty < 1) {
    return { error: "Quantity must be an integer >= 1." };
  }
  return { merchandiseId, quantity: qty };
}

/* GET: return current cart */
export async function GET(req: NextRequest) {
  const cartId = req.cookies.get(CART_COOKIE)?.value ?? null;
  if (!cartId) {
    return NextResponse.json({ cart: null }, { status: 200 });
  }
  try {
    const cart = await getCart(cartId);
    return NextResponse.json(cart ?? null, { status: 200 });
  } catch (err) {
    console.error("GET /api/cart FAILED:", err);
    return NextResponse.json({ error: "Failed to load cart." }, { status: 500 });
  }
}

/* POST: create or add to cart */
export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const parsed = parseAddToCart(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { merchandiseId, quantity } = parsed;

  let cartId = req.cookies.get(CART_COOKIE)?.value ?? null;

  try {
    // No cart yet: create a new one
    if (!cartId) {
      const created = await createCart([{ merchandiseId, quantity }]);
      const newCart = created?.cartCreate?.cart;
      const newId = newCart?.id;
      if (!newId || !newCart) {
        return NextResponse.json({ error: "Failed to create cart." }, { status: 500 });
      }
      const res = NextResponse.json(newCart, { status: 200 });
      res.cookies.set(CART_COOKIE, newId, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: IS_PROD,               // ✅ only secure in production
        maxAge: 60 * 60 * 24 * 30,
      });
      return res;
    }

    // Existing cart: add item
    await addToCart(cartId, [{ merchandiseId, quantity }]);
    const updatedCart = await getCart(cartId);
    const res = NextResponse.json(updatedCart ?? null, { status: 200 });
    res.cookies.set(CART_COOKIE, cartId, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: IS_PROD,                 // ✅ only secure in production
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (err) {
    console.error("POST /api/cart FAILED:", err);
    return NextResponse.json({ error: "Failed to update cart." }, { status: 500 });
  }
}

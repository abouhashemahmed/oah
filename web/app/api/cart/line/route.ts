// app/api/cart/line/route.ts
import { NextRequest, NextResponse } from "next/server";

const SHOP = process.env.SHOPIFY_STORE_DOMAIN!;
const TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!;
const API_URL = `https://${SHOP}/api/2024-10/graphql.json`;

const CART_QUERY = /* GraphQL */ `
  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      id
      checkoutUrl
      totalQuantity
      cost {
        subtotalAmount { amount currencyCode }
        totalAmount { amount currencyCode }
      }
      lines(first: 100) {
        edges {
          node {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                title
                price { amount currencyCode }
                product { title featuredImage { url altText } }
              }
            }
            cost { totalAmount { amount currencyCode } }
          }
        }
      }
    }
  }
`;

const CART_LINES_UPDATE = /* GraphQL */ `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { id totalQuantity }
      userErrors { field message }
    }
  }
`;

const CART_LINES_REMOVE = /* GraphQL */ `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { id totalQuantity }
      userErrors { field message }
    }
  }
`;

async function shopifyFetch<T>(query: string, variables: Record<string, any>) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[cart/line] HTTP error:", res.status, text);
    throw new Error(`Storefront ${res.status}`);
  }

  const json = await res.json();
  if (json.errors) {
    console.error("[cart/line] GraphQL errors:", JSON.stringify(json.errors, null, 2));
    throw new Error(json.errors?.[0]?.message || "GraphQL error");
  }
  return json.data as T;
}

async function refetchCart(cartId: string) {
  return shopifyFetch<{ cart: any }>(CART_QUERY, { cartId });
}

/** Update a cart line’s quantity (>= 1) */
export async function PUT(req: NextRequest) {
  try {
    const cartId = req.cookies.get("cartId")?.value;
    if (!cartId) return NextResponse.json({ error: "Missing cartId" }, { status: 400 });

    const { lineId, quantity } = (await req.json()) as { lineId?: string; quantity?: number };
    if (!lineId) return NextResponse.json({ error: "lineId is required" }, { status: 400 });
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty < 1) {
      return NextResponse.json({ error: "quantity must be >= 1" }, { status: 400 });
    }

    const data = await shopifyFetch<{
      cartLinesUpdate: { cart: { id: string } | null; userErrors: { field: string[]; message: string }[] };
    }>(CART_LINES_UPDATE, { cartId, lines: [{ id: lineId, quantity: qty }] });

    if (data.cartLinesUpdate.userErrors?.length) {
      return NextResponse.json(
        { error: "cartLinesUpdate failed", userErrors: data.cartLinesUpdate.userErrors },
        { status: 400 }
      );
    }

    const fresh = await refetchCart(cartId);
    return NextResponse.json({ ok: true, cart: fresh.cart });
  } catch (err: any) {
    console.error("[cart/line] PUT error:", err?.message || err);
    return NextResponse.json({ error: "Internal error", detail: String(err?.message || err) }, { status: 500 });
  }
}

/** Remove a cart line entirely */
export async function DELETE(req: NextRequest) {
  try {
    const cartId = req.cookies.get("cartId")?.value;
    if (!cartId) return NextResponse.json({ error: "Missing cartId" }, { status: 400 });

    const { lineId } = (await req.json()) as { lineId?: string };
    if (!lineId) return NextResponse.json({ error: "lineId is required" }, { status: 400 });

    const data = await shopifyFetch<{
      cartLinesRemove: { cart: { id: string } | null; userErrors: { field: string[]; message: string }[] };
    }>(CART_LINES_REMOVE, { cartId, lineIds: [lineId] });

    if (data.cartLinesRemove.userErrors?.length) {
      return NextResponse.json(
        { error: "cartLinesRemove failed", userErrors: data.cartLinesRemove.userErrors },
        { status: 400 }
      );
    }

    const fresh = await refetchCart(cartId);
    return NextResponse.json({ ok: true, cart: fresh.cart });
  } catch (err: any) {
    console.error("[cart/line] DELETE error:", err?.message || err);
    return NextResponse.json({ error: "Internal error", detail: String(err?.message || err) }, { status: 500 });
  }
}

/** Optional CORS preflight */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}


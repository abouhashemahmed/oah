// app/api/cart/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!;
const STOREFRONT_API_URL = `https://${STORE_DOMAIN}/api/2024-10/graphql.json`;
const STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

/** ---------- GraphQL ---------- */

const CART_QUERY = /* GraphQL */ `
  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      id
      checkoutUrl
      totalQuantity
      cost { totalAmount { amount currencyCode } subtotalAmount { amount currencyCode } }
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

const CART_CREATE_MUTATION = /* GraphQL */ `
  mutation CartCreate($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) {
      cart { id checkoutUrl totalQuantity }
      userErrors { field message }
    }
  }
`;

const CART_LINES_ADD_MUTATION = /* GraphQL */ `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { id checkoutUrl totalQuantity }
      userErrors { field message }
    }
  }
`;

const CART_LINES_UPDATE_MUTATION = /* GraphQL */ `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { id checkoutUrl totalQuantity }
      userErrors { field message }
    }
  }
`;

const CART_LINES_REMOVE_MUTATION = /* GraphQL */ `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { id checkoutUrl totalQuantity }
      userErrors { field message }
    }
  }
`;

/** ---------- Helpers ---------- */

function forceInt(n: unknown, fallback = 1) {
  const x = Number(n);
  if (!Number.isFinite(x) || x < 1) return fallback;
  return Math.floor(x);
}

function toVariantGID(id: string) {
  if (id.startsWith("gid://")) {
    if (!id.startsWith("gid://shopify/ProductVariant/")) {
      throw new Error(
        `Invalid GID type: expected ProductVariant GID, got ${id.split("/")[3] || "unknown"}`
      );
    }
    return id;
  }
  if (/^\d+$/.test(id)) return `gid://shopify/ProductVariant/${id}`;
  throw new Error(`Invalid variant ID format: ${id}`);
}

async function shopifyFetch<T>(query: string, variables?: Record<string, any>) {
  const res = await fetch(STOREFRONT_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": STOREFRONT_ACCESS_TOKEN,
      "Cache-Control": "no-store",
      "Pragma": "no-cache",
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Storefront HTTP error:", res.status, text);
    throw new Error(`Storefront ${res.status}`);
  }

  const json = await res.json();
  if (json.errors) {
    console.error("Storefront GraphQL errors:", JSON.stringify(json.errors, null, 2));
    throw new Error(json.errors?.[0]?.message || "GraphQL error");
  }
  return json.data as T;
}

async function refetchCart(cartId: string) {
  return shopifyFetch<{ cart: any }>(CART_QUERY, { cartId });
}

/** ---------- Routes ---------- */

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const existingCartId = cookieStore.get("cartId")?.value ?? null;

    const payload = await req.json().catch(() => ({}));
    const action = String(payload.action || "").toLowerCase();

    let cartId = existingCartId;

    // 1) UPDATE line quantity
    if (action === "update") {
      if (!cartId) return NextResponse.json({ error: "No cart" }, { status: 400 });
      const lineId = String(payload.lineId || "");
      const quantity = forceInt(payload.quantity, 1);
      if (!lineId) return NextResponse.json({ error: "lineId is required" }, { status: 400 });

      const data = await shopifyFetch<{
        cartLinesUpdate: { cart: { id: string } | null; userErrors: { field: string[]; message: string }[] };
      }>(CART_LINES_UPDATE_MUTATION, { cartId, lines: [{ id: lineId, quantity }] });

      if (data.cartLinesUpdate.userErrors?.length) {
        console.error("[Cart] cartLinesUpdate userErrors:", data.cartLinesUpdate.userErrors);
        return NextResponse.json(
          { error: "cartLinesUpdate failed", userErrors: data.cartLinesUpdate.userErrors },
          { status: 400 }
        );
      }

      const fresh = await refetchCart(cartId);
      return NextResponse.json({ ok: true, cartId, cart: fresh.cart, checkoutUrl: fresh.cart?.checkoutUrl ?? null });
    }

    // 2) REMOVE line
    if (action === "remove") {
      if (!cartId) return NextResponse.json({ error: "No cart" }, { status: 400 });
      const lineId = String(payload.lineId || "");
      if (!lineId) return NextResponse.json({ error: "lineId is required" }, { status: 400 });

      const data = await shopifyFetch<{
        cartLinesRemove: { cart: { id: string } | null; userErrors: { field: string[]; message: string }[] };
      }>(CART_LINES_REMOVE_MUTATION, { cartId, lineIds: [lineId] });

      if (data.cartLinesRemove.userErrors?.length) {
        console.error("[Cart] cartLinesRemove userErrors:", data.cartLinesRemove.userErrors);
        return NextResponse.json(
          { error: "cartLinesRemove failed", userErrors: data.cartLinesRemove.userErrors },
          { status: 400 }
        );
      }

      const fresh = await refetchCart(cartId);
      return NextResponse.json({ ok: true, cartId, cart: fresh.cart, checkoutUrl: fresh.cart?.checkoutUrl ?? null });
    }

    // 3) ADD line (default behavior)
    const rawVariantId = String(payload.variantId ?? "");
    const quantity = forceInt(payload.quantity, 1);
    if (!rawVariantId) return NextResponse.json({ error: "variantId is required" }, { status: 400 });

    let merchandiseId: string;
    try {
      merchandiseId = toVariantGID(rawVariantId);
    } catch (e: any) {
      return NextResponse.json({ error: e.message || "Invalid variant id" }, { status: 400 });
    }

    if (!cartId) {
      const create = await shopifyFetch<{
        cartCreate: { cart: { id: string; checkoutUrl: string } | null; userErrors: { field: string[]; message: string }[] };
      }>(CART_CREATE_MUTATION, { lines: [{ merchandiseId, quantity }] });

      if (create.cartCreate.userErrors?.length) {
        console.error("[Cart] cartCreate userErrors:", create.cartCreate.userErrors);
        return NextResponse.json(
          { error: "cartCreate failed", userErrors: create.cartCreate.userErrors },
          { status: 400 }
        );
      }

      cartId = create.cartCreate.cart?.id ?? null;
      if (!cartId) return NextResponse.json({ error: "cartCreate returned no cart" }, { status: 500 });
    } else {
      const add = await shopifyFetch<{
        cartLinesAdd: { cart: { id: string; checkoutUrl: string } | null; userErrors: { field: string[]; message: string }[] };
      }>(CART_LINES_ADD_MUTATION, { cartId, lines: [{ merchandiseId, quantity }] });

      if (add.cartLinesAdd.userErrors?.length) {
        console.error("[Cart] cartLinesAdd userErrors:", add.cartLinesAdd.userErrors);
        return NextResponse.json(
          { error: "cartLinesAdd failed", userErrors: add.cartLinesAdd.userErrors },
          { status: 400 }
        );
      }
    }

    const fresh = await refetchCart(cartId!);
    const resp = NextResponse.json({
      ok: true,
      cartId,
      cart: fresh.cart,
      checkoutUrl: fresh.cart?.checkoutUrl ?? null,
    });

    if (cartId && cartId !== existingCartId) {
      resp.cookies.set("cartId", cartId, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return resp;
  } catch (err: any) {
    console.error("[Cart] Unhandled error:", err?.message || err);
    return NextResponse.json({ error: "Internal server error", detail: String(err?.message || err) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const cartId = cookieStore.get("cartId")?.value;
    if (!cartId) return NextResponse.json({ cart: null }, { headers: { "Cache-Control": "no-store" } });

    const data = await refetchCart(cartId);
    return NextResponse.json({ cart: data.cart }, { headers: { "Cache-Control": "no-store", "Pragma": "no-cache" } });
  } catch (err) {
    console.error("[Cart] GET error:", err);
    return NextResponse.json({ cart: null }, { status: 200 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}


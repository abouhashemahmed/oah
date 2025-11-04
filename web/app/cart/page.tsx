// app/cart/page.tsx
// app/cart/page.tsx
import Link from "next/link";
import { cookies } from "next/headers";
import CartLineControls from "@/components/CartLineControls";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
                product {
                  title
                  featuredImage { url altText }
                }
              }
            }
            cost {
              totalAmount { amount currencyCode }
            }
          }
        }
      }
    }
  }
`;

async function storefrontFetch<T>(query: string, variables?: Record<string, any>) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": TOKEN,
      "Cache-Control": "no-store",
      "Pragma": "no-cache",
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Cart fetch HTTP error:", res.status, text);
    throw new Error(`Storefront ${res.status}`);
  }
  const json = await res.json();
  if (json.errors) {
    console.error("Cart fetch GraphQL errors:", JSON.stringify(json.errors, null, 2));
    throw new Error(json.errors?.[0]?.message || "GraphQL error");
  }
  return json.data as T;
}

function money(amount: string | number | null | undefined, code?: string) {
  const c = code || "USD";
  if (amount == null) return `0.00 ${c}`;
  const n = Number(amount);
  if (!Number.isFinite(n)) return `0.00 ${c}`;
  return `${n.toFixed(2)} ${c}`;
}

export default async function CartPage() {
  const cookieStore = await cookies();
  const cartId = cookieStore.get("cartId")?.value ?? null;

  // No cart cookie yet
  if (!cartId) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-4xl font-bold mb-6">Your Cart</h1>
        <p className="text-zinc-400 mb-6">Your cart is empty.</p>
        <Link
          href="/products"
          className="inline-flex items-center justify-center rounded-xl px-5 py-3 bg-indigo-500 hover:bg-indigo-600 text-white"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  // Load cart
  type CartLine = {
    id: string;
    quantity: number;
    merchandise: {
      id: string;
      title: string;
      price?: { amount: string; currencyCode: string };
      product?: {
        title: string;
        featuredImage?: { url: string; altText: string | null };
      };
    };
    cost?: { totalAmount?: { amount: string; currencyCode: string } };
  };

  let data: { cart: any };
  try {
    data = await storefrontFetch<{ cart: any }>(CART_QUERY, { cartId });
  } catch {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-4xl font-bold mb-6">Your Cart</h1>
        <p className="text-red-400">Couldn’t load your cart. Please refresh.</p>
      </div>
    );
  }

  const cart = data?.cart;
  const lines: CartLine[] = cart?.lines?.edges?.map((e: any) => e.node) ?? [];
  const currency =
    cart?.cost?.totalAmount?.currencyCode ||
    cart?.cost?.subtotalAmount?.currencyCode ||
    "USD";

  // Empty cart
  if (!lines.length || (cart?.totalQuantity ?? 0) <= 0) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-4xl font-bold mb-6">Your Cart</h1>
        <p className="text-zinc-400 mb-6">Your cart is empty.</p>
        <Link
          href="/products"
          className="inline-flex items-center justify-center rounded-xl px-5 py-3 bg-indigo-500 hover:bg-indigo-600 text-white"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  // Fallback line totals if Shopify returns 0.00 line costs
  const computedTotal = lines.reduce((sum: number, line) => {
    const qty = Number(line.quantity || 0);
    const shopifyLineTotal = Number(line.cost?.totalAmount?.amount ?? 0);
    if (shopifyLineTotal > 0) return sum + shopifyLineTotal;
    const unit = Number(line.merchandise?.price?.amount ?? 0);
    return sum + unit * qty;
  }, 0);

  const shopifyTotal = Number(cart?.cost?.totalAmount?.amount ?? 0);
  const total = shopifyTotal > 0 ? shopifyTotal : computedTotal;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-end justify-between mb-6">
        <h1 className="text-4xl font-bold">Your Cart</h1>
        <div className="text-zinc-400">
          {cart?.totalQuantity ?? 0} item{(cart?.totalQuantity ?? 0) === 1 ? "" : "s"}
        </div>
      </div>

      <div className="space-y-5">
        {lines.map((line) => {
          const p = line.merchandise?.product;
          const img = p?.featuredImage;
          const qty = Number(line.quantity || 0);
          const unit = Number(line.merchandise?.price?.amount ?? 0);
          const lineTotal =
            Number(line.cost?.totalAmount?.amount ?? 0) || unit * qty;

          return (
            <div
              key={line.id}
              className="flex items-center gap-4 rounded-2xl border border-zinc-800 p-4"
            >
              <div className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-black/20">
                {img?.url ? (
                  <img
                    src={img.url}
                    alt={img.altText || p?.title || "Product"}
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-xl font-semibold truncate">
                  {p?.title || line.merchandise?.title}
                </div>
                <div className="text-zinc-400">
                  Variant: {line.merchandise?.title}
                </div>

                {/* Interactive controls */}
                <CartLineControls lineId={line.id} quantity={qty} className="mt-3" />
              </div>

              <div className="text-right">
                <div className="text-sm text-zinc-400">Unit</div>
                <div className="font-semibold">{money(unit, currency)}</div>
                <div className="text-sm text-zinc-400 mt-2">Line total</div>
                <div className="font-semibold">
                  {money(lineTotal, currency)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t border-zinc-800 pt-6 mt-6">
        <div className="text-2xl">Total</div>
        <div className="text-2xl font-semibold">{money(total, currency)}</div>
      </div>

      <div className="mt-6 flex gap-4">
        <a
          href={cart?.checkoutUrl ?? "#"}
          aria-disabled={(cart?.totalQuantity ?? 0) <= 0}
          className="inline-flex items-center justify-center rounded-xl px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
        >
          Proceed to checkout
        </a>
        <Link
          href="/products"
          className="inline-flex items-center justify-center rounded-xl px-6 py-3 border border-zinc-700 hover:bg-zinc-800"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}


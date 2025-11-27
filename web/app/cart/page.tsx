// FILE: /web/app/cart/page.tsx
import Link from "next/link";
import { cookies } from "next/headers";
import { getCart } from "@/lib/shopify";
import CartLineControls from "@/components/CartLineControls";

const CART_COOKIE = "cartId";

/** Format money with fallback */
function formatMoney(
  amount: string | number | null | undefined,
  currency: string | null | undefined
) {
  if (!amount || !currency) return "-";
  const num = Number(amount);
  if (!Number.isFinite(num)) return `${amount} ${currency}`;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(num);
}

export default async function CartPage() {
  // ✅ In your setup, cookies() is async
  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_COOKIE)?.value ?? null;

  // No cart cookie at all
  if (!cartId) {
    return (
      <main className="max-w-5xl mx-auto px-6 py-12 text-white">
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
        <div className="rounded-xl border border-white/10 bg-black/20 p-8">
          <p className="opacity-80 mb-6">Your cart is empty.</p>
          <Link
            href="/products"
            className="inline-flex px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 transition text-white font-medium"
          >
            Browse Products
          </Link>
        </div>
      </main>
    );
  }

  // Fetch cart from Shopify
  const cart = await getCart(cartId);

  // Normalize lines array
  const lines = Array.isArray(cart?.lines?.edges)
    ? cart.lines.edges.map((edge: any) => edge.node)
    : [];

  // If Shopify cart is empty or not found
  if (!cart || lines.length === 0 || cart.totalQuantity === 0) {
    return (
      <main className="max-w-5xl mx-auto px-6 py-12 text-white">
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
        <div className="rounded-xl border border-white/10 bg-black/20 p-8">
          <p className="opacity-80 mb-6">Your cart is empty.</p>
          <Link
            href="/products"
            className="inline-flex px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 transition text-white font-medium"
          >
            Browse Products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-12 text-white">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

      <div className="grid gap-10 md:grid-cols-[2fr_1fr]">
        {/* Cart Items */}
        <section className="space-y-6">
          {lines.map((line: any) => {
            const merchandise = line.merchandise ?? {};
            const product = merchandise.product ?? {};
            const img = product.featuredImage ?? merchandise.image ?? null;

            const unitPrice =
              merchandise.price?.amount ??
              merchandise.priceV2?.amount ??
              null;

            const lineTotal =
              line.cost?.totalAmount?.amount ??
              line.cost?.subtotalAmount?.amount ??
              null;

            const currency =
              merchandise.price?.currencyCode ??
              merchandise.priceV2?.currencyCode ??
              line.cost?.totalAmount?.currencyCode ??
              "USD";

            return (
              <div
                key={line.id}
                className="flex gap-4 rounded-xl border border-white/10 bg-black/20 p-4"
              >
                <div className="h-24 w-24 overflow-hidden rounded-lg bg-white/10 flex-shrink-0">
                  {img?.url ? (
                    <img
                      src={img.url}
                      alt={img.altText || product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-60">
                      No image
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <p className="font-semibold">{product.title}</p>
                    {merchandise.title &&
                      merchandise.title !== "Default Title" && (
                        <p className="text-sm opacity-70">
                          {merchandise.title}
                        </p>
                      )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm opacity-80">
                      Qty: {line.quantity}
                    </div>

                    <div className="text-right">
                      <p className="text-sm">
                        Unit: {formatMoney(unitPrice, currency)}
                      </p>
                      <p className="font-semibold">
                        Line: {formatMoney(lineTotal, currency)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <CartLineControls
                      lineId={line.id}
                      quantity={line.quantity}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* Order Summary */}
        <aside className="rounded-xl border border-white/10 bg-black/20 p-6 h-fit">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between opacity-80">
              <span>Subtotal</span>
              <span>
                {formatMoney(
                  cart.cost?.subtotalAmount?.amount,
                  cart.cost?.subtotalAmount?.currencyCode
                )}
              </span>
            </div>

            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>
                {formatMoney(
                  cart.cost?.totalAmount?.amount,
                  cart.cost?.totalAmount?.currencyCode
                )}
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            {cart.checkoutUrl && (
              <Link
                href={cart.checkoutUrl}
                className="w-full text-center bg-indigo-600 hover:bg-indigo-500 transition text-white font-semibold py-2 rounded-md"
              >
                Proceed to Checkout
              </Link>
            )}

            <Link
              href="/products"
              className="w-full text-center border border-white/20 py-2 rounded-md hover:bg-white/10 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}

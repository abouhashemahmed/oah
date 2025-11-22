// FILE: /web/app/cart/page.tsx
import Link from "next/link";
import { cookies } from "next/headers";
import { getCart } from "@/lib/shopify";
import CartLineControls from "@/components/CartLineControls";

const CART_COOKIE_NAME = "cartId";

type MoneyLike = {
  amount: string;
  currencyCode: string;
};

function formatMoney(money?: MoneyLike | null) {
  if (!money) return "-";
  const value = Number(money.amount);
  if (!Number.isFinite(value)) {
    return `${money.amount} ${money.currencyCode}`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: money.currencyCode,
  }).format(value);
}

export default async function CartPage() {
  // In Next 16, cookies() returns a Promise, so we must await it
  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_COOKIE_NAME)?.value;

  // No cart cookie at all → empty state
  if (!cartId) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-4">Your Cart</h1>
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <p className="text-gray-600 mb-4">Your cart is empty.</p>
          <Link
            href="/products"
            className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            Browse Products
          </Link>
        </div>
      </main>
    );
  }

  const cart: any = await getCart(cartId);

  // Cart exists but has no items → same empty state
  if (!cart || !cart.totalQuantity || cart.totalQuantity === 0) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-4">Your Cart</h1>
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <p className="text-gray-600 mb-4">Your cart is empty.</p>
          <Link
            href="/products"
            className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            Browse Products
          </Link>
        </div>
      </main>
    );
  }

  const lines = Array.isArray(cart.lines?.edges)
    ? cart.lines.edges.map((edge: any) => edge.node)
    : Array.isArray(cart.lines)
    ? cart.lines
    : [];

  const subtotal = cart.cost?.subtotalAmount as MoneyLike | undefined;
  const total = cart.cost?.totalAmount as MoneyLike | undefined;

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      <div className="grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
        {/* Line items */}
        <section className="space-y-4">
          {lines.map((line: any) => {
            const merchandise = line.merchandise ?? {};
            const product = merchandise.product ?? {};
            const image = product.featuredImage ?? null;

            const productTitle =
              product.title ?? merchandise.title ?? "Untitled product";

            const variantTitle =
              merchandise.title && merchandise.title !== "Default Title"
                ? merchandise.title
                : null;

            const unitPrice = (merchandise.price ??
              (line.cost?.totalAmount as MoneyLike | undefined)) as
              | MoneyLike
              | undefined;

            const lineTotal = line.cost?.totalAmount as MoneyLike | undefined;

            return (
              <article
                key={line.id}
                className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-start"
              >
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {image?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image.url}
                      alt={image.altText ?? productTitle}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                      No image
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">
                        {productTitle}
                      </h2>
                      {variantTitle && (
                        <p className="text-sm text-gray-500">
                          {variantTitle}
                        </p>
                      )}
                    </div>

                    <div className="text-right text-sm text-gray-700">
                      <div>Unit: {formatMoney(unitPrice)}</div>
                      <div className="font-semibold">
                        Line: {formatMoney(lineTotal)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="text-sm text-gray-600">
                      Qty:{" "}
                      <span className="font-medium">{line.quantity}</span>
                    </div>

                    <CartLineControls
                      lineId={line.id}
                      quantity={line.quantity}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        {/* Summary */}
        <aside className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm h-fit">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Order Summary
          </h2>

          <dl className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-gray-600">Subtotal</dt>
              <dd className="font-medium text-gray-900">
                {formatMoney(subtotal)}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-gray-600">Total</dt>
              <dd className="font-semibold text-gray-900">
                {formatMoney(total ?? subtotal)}
              </dd>
            </div>
          </dl>

          <div className="mt-6 space-y-3">
            {cart.checkoutUrl && (
              <Link
                href={cart.checkoutUrl}
                className="flex w-full items-center justify-center rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              >
                Proceed to Checkout
              </Link>
            )}

            <Link
              href="/products"
              className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              Continue Shopping
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}

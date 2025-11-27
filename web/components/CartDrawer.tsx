// FILE: /web/components/CartDrawer.tsx
"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
};

/** Simple money formatter */
function formatMoney(
  amount: string | number | null | undefined,
  currency: string | null | undefined
) {
  if (!amount || !currency) return "—";
  const num = Number(amount);
  if (!Number.isFinite(num)) return `${amount} ${currency}`;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(num);
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { cart, loading, updateLine, removeLine } = useCart();

  if (!open) return null;

  const lines = Array.isArray(cart?.lines?.edges)
    ? cart.lines.edges.map((e: any) => e.node)
    : [];

  const subtotal = cart?.cost?.subtotalAmount;
  const total = cart?.cost?.totalAmount;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close cart"
        className="flex-1 bg-black/50"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="w-full max-w-md h-full bg-black text-white border-l border-white/10 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold">Your Cart</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-white/70 hover:text-white text-xl"
          >
            ×
          </button>
        </div>

        {/* Body: lines */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {loading && !cart && (
            <p className="text-sm text-white/60">Loading cart…</p>
          )}

          {!loading && lines.length === 0 && (
            <p className="text-sm text-white/70">Your cart is empty.</p>
          )}

          {lines.map((line: any) => {
            const merchandise = line.merchandise ?? {};
            const product = merchandise.product ?? {};
            const img =
              product.featuredImage ?? merchandise.image ?? null;

            const lineTotal = line.cost?.totalAmount;
            const currency =
              lineTotal?.currencyCode ??
              merchandise.price?.currencyCode ??
              merchandise.priceV2?.currencyCode ??
              "USD";

            return (
              <div
                key={line.id}
                className="flex gap-3 rounded-lg border border-white/10 bg-white/5 p-3"
              >
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-white/10">
                  {img?.url ? (
                    <img
                      src={img.url}
                      alt={img.altText || product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] opacity-60">
                      No image
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-sm font-semibold line-clamp-2">
                      {product.title}
                    </p>
                    {merchandise.title &&
                      merchandise.title !== "Default Title" && (
                        <p className="text-xs text-white/60">
                          {merchandise.title}
                        </p>
                      )}
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-2">
                    {/* Quantity controls */}
                    <div className="inline-flex items-center border border-white/20 rounded-md overflow-hidden text-sm">
                      <button
                        type="button"
                        onClick={() =>
                          updateLine(line.id, Math.max(1, line.quantity - 1))
                        }
                        disabled={loading || line.quantity <= 1}
                        className="px-2 py-1 hover:bg-white/10 disabled:opacity-40"
                      >
                        −
                      </button>
                      <span className="px-3 py-1 border-x border-white/10 min-w-[2.5rem] text-center">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateLine(line.id, line.quantity + 1)
                        }
                        disabled={loading}
                        className="px-2 py-1 hover:bg-white/10 disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>

                    {/* Line total + remove */}
                    <div className="text-right">
                      <p className="text-xs text-white/60">Line total</p>
                      <p className="text-sm font-semibold">
                        {formatMoney(
                          lineTotal?.amount ?? null,
                          currency
                        )}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeLine(line.id)}
                        disabled={loading}
                        className="mt-1 text-xs text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer: summary + actions */}
        <div className="border-t border-white/10 px-6 py-4 space-y-3">
          <div className="flex justify-between text-sm text-white/70">
            <span>Subtotal</span>
            <span>
              {formatMoney(
                subtotal?.amount ?? null,
                subtotal?.currencyCode ?? "USD"
              )}
            </span>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>
              {formatMoney(
                total?.amount ?? null,
                total?.currencyCode ?? "USD"
              )}
            </span>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            {cart?.checkoutUrl && (
              <Link
                href={cart.checkoutUrl}
                className="w-full text-center bg-indigo-600 hover:bg-indigo-500 transition text-white font-semibold py-2 rounded-md"
              >
                Proceed to Checkout
              </Link>
            )}

            <Link
              href="/cart"
              className="w-full text-center border border-white/20 py-2 rounded-md hover:bg-white/10 transition text-sm"
              onClick={onClose}
            >
              View full cart
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="w-full text-center text-xs text-white/60 hover:text-white mt-1"
            >
              Continue shopping
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

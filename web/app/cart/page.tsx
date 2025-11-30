// FILE: /web/app/cart/page.tsx
"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useMemo } from "react";

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

export default function CartPage() {
  const { cart, loading, updateLine, removeLine } = useCart();

  const lines = cart?.lines?.edges ?? [];
  const totalQuantity = cart?.totalQuantity ?? 0;
  const subtotal = cart?.cost?.subtotalAmount ?? null;
  const total = cart?.cost?.totalAmount ?? subtotal ?? null;
  const checkoutUrl: string | null = cart?.checkoutUrl ?? null;

  const isEmpty = !loading && (!cart || totalQuantity === 0 || lines.length === 0);

  const currency = total?.currencyCode ?? subtotal?.currencyCode ?? "USD";

  const itemCountLabel = useMemo(() => {
    if (!totalQuantity) return "No items";
    if (totalQuantity === 1) return "1 item";
    return `${totalQuantity} items`;
  }, [totalQuantity]);

  // LOADING STATE (first load)
  if (loading && !cart) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-16 text-white">
        <h1 className="text-3xl font-bold mb-4">Your cart</h1>
        <p className="text-sm text-white/70">Loading your cart…</p>
      </main>
    );
  }

  // EMPTY STATE
  if (isEmpty) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-16 text-white">
        <h1 className="text-3xl font-bold mb-4">Your cart</h1>
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-8 flex flex-col items-center text-center gap-4">
          <p className="text-sm text-white/80">
            Your cart is empty — but the gallery is full.
          </p>
          <p className="text-xs text-white/60 max-w-sm">
            Browse handcrafted pieces from across the Arab world and add your
            favorites here. They&apos;ll stay in your cart while you explore.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-md bg-white text-black px-5 py-2.5 text-sm font-semibold hover:bg-white/90 mt-2"
          >
            Browse products
          </Link>
        </div>
      </main>
    );
  }

  // NON-EMPTY CART
  return (
    <main className="max-w-5xl mx-auto px-6 py-16 text-white">
      <h1 className="text-3xl font-bold mb-2">Your cart</h1>
      <p className="text-sm text-white/70 mb-8">{itemCountLabel}</p>

      <div className="grid gap-8 md:grid-cols-[2fr,1fr] items-start">
        {/* LEFT: Line items */}
        <section className="space-y-4">
          {lines.map((edge: any) => {
            const line = edge.node;
            const lineId: string = line.id;
            const quantity: number = line.quantity;
            const merchandise = line.merchandise;
            const variantTitle: string = merchandise?.title ?? "";
            const product = merchandise?.product ?? null;
            const productTitle: string = product?.title ?? "Untitled product";
            const img = product?.featuredImage ?? null;

            const lineTotal = line.cost?.totalAmount ?? null;
            const lineCurrency = lineTotal?.currencyCode ?? currency;

            const handleDecrement = async () => {
              if (quantity <= 1) {
                await removeLine(lineId);
              } else {
                await updateLine(lineId, quantity - 1);
              }
            };

            const handleIncrement = async () => {
              await updateLine(lineId, quantity + 1);
            };

            const handleRemove = async () => {
              await removeLine(lineId);
            };

            return (
              <article
                key={lineId}
                className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-white/10 flex-shrink-0">
                  {img?.url ? (
                    <img
                      src={img.url}
                      alt={img.altText ?? productTitle}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[11px] text-white/50">
                      No image
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold line-clamp-2">
                        {productTitle}
                      </p>
                      {variantTitle && variantTitle !== "Default Title" && (
                        <p className="text-[11px] text-white/60">
                          {variantTitle}
                        </p>
                      )}
                    </div>
                    <p className="text-sm font-semibold whitespace-nowrap">
                      {formatMoney(lineTotal?.amount ?? null, lineCurrency)}
                    </p>
                  </div>

                  {/* Qty controls */}
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <div className="inline-flex items-center rounded-full border border-white/15 bg-black/40 text-xs">
                      <button
                        type="button"
                        onClick={handleDecrement}
                        className="px-3 py-1 hover:bg-white/10"
                      >
                        −
                      </button>
                      <span className="px-3">{quantity}</span>
                      <button
                        type="button"
                        onClick={handleIncrement}
                        className="px-3 py-1 hover:bg-white/10"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleRemove}
                      className="text-[11px] text-red-300 hover:text-red-200 underline underline-offset-4"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        {/* RIGHT: Summary */}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
          <h2 className="text-lg font-semibold">Order summary</h2>

          <div className="flex justify-between text-sm text-white/70">
            <span>Subtotal</span>
            <span>
              {formatMoney(subtotal?.amount ?? null, subtotal?.currencyCode ?? currency)}
            </span>
          </div>

          <div className="flex justify-between text-xs text-white/50">
            <span>Shipping & taxes</span>
            <span>Calculated at checkout</span>
          </div>

          <div className="border-t border-white/10 pt-3 flex justify-between text-sm font-semibold">
            <span>Total</span>
            <span>
              {formatMoney(total?.amount ?? null, total?.currencyCode ?? currency)}
            </span>
          </div>

          {checkoutUrl ? (
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noreferrer"
              className="block w-full text-center rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 mt-4"
            >
              Continue to checkout
            </a>
          ) : (
            <p className="text-[11px] text-white/60 mt-4">
              Once we connect your live Shopify store fully, this button will
              take buyers straight into the secure checkout.
            </p>
          )}

          <Link
            href="/products"
            className="block text-center text-xs text-white/70 hover:text-white underline underline-offset-4 mt-3"
          >
            Continue shopping
          </Link>
        </section>
      </div>
    </main>
  );
}

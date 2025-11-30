// FILE: /web/app/shipping-returns/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Shipping & Returns | Our Arab Heritage",
};

export default function ShippingReturnsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 text-white">
      <h1 className="text-3xl font-bold mb-4">Shipping &amp; Returns</h1>
      <p className="text-sm text-white/60 mb-8">
        Last updated: {new Date().getFullYear()}
      </p>

      <div className="space-y-6 text-sm text-white/80 leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold mb-2">Shipping</h2>
          <p>
            As we grow the marketplace, shipping options may vary by product and
            seller. Typical time frames and rates will be shown at checkout
            before you place an order.
          </p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>
              Orders are usually processed within a few business days, unless a
              made-to-order or pre-order item is clearly marked.
            </li>
            <li>
              Tracking information (when available) will be shared by email once
              your order ships.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Returns &amp; exchanges</h2>
          <p>
            Because many items are handcrafted or made in small batches, return
            eligibility may vary by product and seller. Before we launch fully,
            we will finalize and clearly publish a detailed return policy.
          </p>
          <p className="mt-2">
            For now, if there is an issue with an item you receive (damaged,
            incorrect, or not as described), please contact us as soon as
            possible with your order details and photos, and we will work with
            you and the seller to make it right.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Contact</h2>
          <p>
            For any shipping or return questions, reach out at{" "}
            <span className="font-mono text-xs">
              support@ourarabheritage.com
            </span>{" "}
            (placeholder) and include your order number.
          </p>
        </section>

        <p className="text-xs text-white/50 mt-4">
          This is a beta-phase policy overview. Final shipping and return terms
          will be updated before broad public launch or large-scale marketing.
        </p>

        <div className="mt-6">
          <Link
            href="/"
            className="text-xs underline underline-offset-4 text-white/70 hover:text-white"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}

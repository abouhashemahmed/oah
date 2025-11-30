// FILE: /web/app/terms/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use | Our Arab Heritage",
};

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 text-white">
      <h1 className="text-3xl font-bold mb-4">Terms of Use</h1>
      <p className="text-sm text-white/60 mb-8">
        Last updated: {new Date().getFullYear()}
      </p>

      <div className="space-y-6 text-sm text-white/80 leading-relaxed">
        <p>
          Welcome to <span className="font-semibold">Our Arab Heritage</span>.
          By accessing or using this website, you agree to these Terms of Use.
          If you do not agree, please do not use the site.
        </p>

        <section>
          <h2 className="text-lg font-semibold mb-2">1. Marketplace overview</h2>
          <p>
            Our Arab Heritage is a curated marketplace showcasing products from
            Arab artisans and sellers. Some items may be sold directly by us,
            and others may be sold by independent sellers. Product descriptions,
            pricing, and fulfillment details may vary by seller.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">2. Use of the site</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>You agree not to misuse the site or attempt to disrupt it.</li>
            <li>
              You agree to provide accurate information when placing orders or
              contacting us.
            </li>
            <li>
              You must comply with all applicable laws when using the site or
              purchasing products.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">3. Orders & payments</h2>
          <p>
            All orders are subject to availability and confirmation. Prices,
            shipping costs, and estimated delivery times will be shown before
            checkout. Payment is handled securely by our payment partners.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">4. Third-party sellers</h2>
          <p>
            For products sold by independent sellers, those sellers are
            responsible for fulfilling orders and providing accurate information
            about their products. We aim to work only with reputable partners,
            but we cannot guarantee every aspect of their operations.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">5. Intellectual property</h2>
          <p>
            The Our Arab Heritage name, branding, and content (including text,
            layout, and design) are protected. You agree not to copy or reuse
            substantial parts of the site without permission.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">6. Limitation of liability</h2>
          <p>
            The site is provided on a beta, &quot;as-is&quot; basis. To the
            fullest extent permitted by law, we are not liable for any indirect
            or consequential losses arising from your use of the site.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">7. Changes to these terms</h2>
          <p>
            We may update these Terms of Use as the marketplace evolves.
            Continued use of the site after changes are posted means you accept
            the updated terms.
          </p>
        </section>

        <p className="text-xs text-white/50 mt-4">
          This draft is provided for clarity and user trust but does not replace
          formal legal review. Before launch at scale, you should have a lawyer
          review and tailor these terms.
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

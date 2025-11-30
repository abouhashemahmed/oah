// FILE: /web/app/privacy/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Our Arab Heritage",
};

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 text-white">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-sm text-white/60 mb-8">
        Last updated: {new Date().getFullYear()}
      </p>

      <div className="space-y-6 text-sm text-white/80 leading-relaxed">
        <p>
          At <span className="font-semibold">Our Arab Heritage</span>, we respect your
          privacy and are committed to protecting the personal information you
          share with us. This page explains what we collect, how we use it, and
          the choices you have.
        </p>

        <section>
          <h2 className="text-lg font-semibold mb-2">Information we collect</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <span className="font-semibold">Account details</span> – such as
              your name, email address, and password if you create an account in
              the future.
            </li>
            <li>
              <span className="font-semibold">Order information</span> – such as
              your shipping details, billing details, and items purchased.
            </li>
            <li>
              <span className="font-semibold">Usage data</span> – basic
              analytics about how visitors navigate and interact with the site.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">How we use your information</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>To process and deliver your orders.</li>
            <li>To respond to your messages and support requests.</li>
            <li>
              To improve the marketplace experience and understand which
              products and categories are performing best.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Third-party services</h2>
          <p>
            We may use third-party providers such as payment processors,
            analytics tools, or email services. Those providers only receive the
            information necessary to perform their services, and they are
            expected to handle that data securely.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Your choices</h2>
          <p>
            If you have any questions about your data, or if you would like to
            request that we update or delete information, you can contact us
            directly at{" "}
            <span className="font-mono text-xs">
              info@ourarabheritage.com
            </span>{" "}
            (placeholder).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Changes to this policy</h2>
          <p>
            As the marketplace grows, we may update this Privacy Policy. When we
            do, we&apos;ll update the date at the top and post the new version
            here.
          </p>
        </section>

        <p className="text-xs text-white/50 mt-4">
          This page is provided for informational purposes only and does not
          constitute legal advice. For a final version, you should review this
          with a qualified legal professional.
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

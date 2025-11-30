// FILE: /web/app/for-sellers/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import SellerInterestForm from "@/components/SellerInterestForm";

export const metadata: Metadata = {
  title: "For Sellers | Our Arab Heritage",
  description:
    "Apply to sell your handcrafted products on Our Arab Heritage – a curated marketplace for Arab artisans and brands.",
};

export default function ForSellersPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16 text-white">
      {/* Intro */}
      <section className="mb-10">
        <p className="text-xs uppercase tracking-[0.14em] text-white/50 mb-2">
          For sellers
        </p>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Sell with Our Arab Heritage
        </h1>
        <p className="text-sm md:text-base text-white/70 max-w-2xl">
          We&apos;re building a curated marketplace for Arab artisans, designers,
          and brands – from Gaza to the Gulf, from the Levant to North Africa and
          the diaspora. If you create products that carry our culture, we&apos;d
          love to hear from you.
        </p>
        <p className="text-xs text-amber-300/80 mt-3">
          This is an early interest form. We&apos;re onboarding a small group of
          founding sellers first, then gradually opening more spots.
        </p>
      </section>

      {/* Why sell with us */}
      <section className="mb-10 grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-sm font-semibold mb-1">
            Built for Arab artisans
          </h2>
          <p className="text-xs text-white/70">
            A marketplace intentionally centered on Arab stories, craft
            traditions, and diaspora communities.
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-sm font-semibold mb-1">
            Curated, not overcrowded
          </h2>
          <p className="text-xs text-white/70">
            Fewer, better products. You&apos;re not competing with random
            dropshipped items on a massive platform.
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-sm font-semibold mb-1">
            Fair, transparent fees
          </h2>
          <p className="text-xs text-white/70">
            Our goal is simple: sustainable fees that support the platform
            while putting most of the value back into creators&apos; hands.
          </p>
        </div>
      </section>

      {/* Interest form */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-3">
          Tell us about your products
        </h2>
        <p className="text-sm text-white/70 mb-4">
          Fill out this short form and we&apos;ll reach out as we open new
          seller spots. This doesn&apos;t create an account yet – it just lets
          us understand who you are and what you make.
        </p>

        {/* Client-side form with inline success/error messages */}
        <SellerInterestForm />
      </section>

      {/* FAQ-ish footer text */}
      <section className="text-xs text-white/60 space-y-2">
        <p>
          We&apos;re still in the build phase – polishing the buyer experience,
          testing operations, and shaping fair policies for sellers. If you&apos;re
          excited by the idea of a thoughtful Arab-first marketplace, you&apos;re
          exactly the kind of person we want to hear from.
        </p>
        <p>
          You can also read more about the vision on our{" "}
          <Link
            href="/about"
            className="underline underline-offset-2 hover:text-white"
          >
            About page
          </Link>
          .
        </p>
      </section>
    </main>
  );
}

// FILE: /web/app/about/page.tsx
import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-16 text-white">
      {/* Breadcrumbs */}
      <nav className="mb-6 text-sm text-white/60 flex items-center gap-2">
        <Link href="/" className="hover:text-white">
          Home
        </Link>
        <span>/</span>
        <span className="text-white">About</span>
      </nav>

      {/* Hero */}
      <section className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Our Arab Heritage
        </h1>
        <p className="text-lg md:text-xl text-white/80 max-w-3xl">
          A curated marketplace dedicated to Palestinian and Arab artisans,
          stories, and culture. We exist to make it easier for the world
          to discover meaningful pieces that carry the soul of our homeland.
        </p>
      </section>

      {/* Story + Mission */}
      <section className="grid gap-10 md:grid-cols-2 mb-16">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Why this exists</h2>
          <p className="text-sm md:text-base text-white/80 leading-relaxed">
            Our Arab Heritage was born from a simple idea: our culture is rich,
            layered, and beautiful – but most people only ever see a tiny,
            simplified version of it. Meanwhile, thousands of Arab makers are
            creating incredible work with very little visibility or support.
          </p>
          <p className="text-sm md:text-base text-white/80 leading-relaxed">
            This platform is a small answer to that problem. A place where you
            can find pieces that are rooted in Palestine, the Levant, North
            Africa, and the wider Arab world – and know that every purchase
            supports an independent creator.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">What we care about</h2>
          <ul className="space-y-3 text-sm md:text-base text-white/80">
            <li>
              <span className="font-semibold text-white">Authenticity.</span>{" "}
              Products should feel true to the maker, not mass-produced trends.
            </li>
            <li>
              <span className="font-semibold text-white">Fairness.</span>{" "}
              Clear pricing, fair margins, and as little friction as possible
              between you and the artisan.
            </li>
            <li>
              <span className="font-semibold text-white">Storytelling.</span>{" "}
              Every item carries a story – of a city, a village, a family, a
              memory. We want those stories to be visible, not hidden.
            </li>
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-4">How the marketplace works</h2>
        <div className="grid gap-6 md:grid-cols-3 text-sm md:text-base">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-white/50 mb-1">
              01
            </p>
            <h3 className="font-semibold mb-2">Curated products</h3>
            <p className="text-white/80">
              We source and curate items from Arab artisans and brands, starting
              with Palestine and expanding across the region.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-white/50 mb-1">
              02
            </p>
            <h3 className="font-semibold mb-2">Secure checkout</h3>
            <p className="text-white/80">
              Your order is processed through Shopify&apos;s secure checkout,
              with modern payments and shipping options.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-white/50 mb-1">
              03
            </p>
            <h3 className="font-semibold mb-2">Real impact</h3>
            <p className="text-white/80">
              Every purchase supports independent creators and helps keep Arab
              craft, art, and design alive and visible.
            </p>
          </div>
        </div>
      </section>

      {/* Seller CTA */}
      <section className="mb-16 rounded-2xl border border-indigo-500/40 bg-indigo-600/10 px-6 py-8">
        <h2 className="text-2xl font-semibold mb-2">For artisans & brands</h2>
        <p className="text-sm md:text-base text-white/80 mb-4 max-w-2xl">
          If you&apos;re a Palestinian or Arab maker, artist, or brand and you&apos;d
          like to be part of Our Arab Heritage, we&apos;d love to hear from you.
          We&apos;re gradually onboarding a small group of sellers as we build this
          marketplace the right way.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition"
          >
            Browse the marketplace
          </Link>
          <a
            href="mailto:hello@ourarabheritage.com?subject=Seller%20application"
            className="inline-flex items-center justify-center rounded-md border border-white/30 px-5 py-2 text-sm font-semibold text-white hover:bg-white/10 transition"
          >
            Contact us about selling
          </a>
        </div>
      </section>

      {/* Small footer note on page */}
      <section className="text-xs text-white/50 border-t border-white/10 pt-6 mt-8">
        <p>
          This project is growing step by step. If you have ideas, feedback, or
          would like to collaborate, you&apos;re always welcome to reach out.
        </p>
      </section>
    </main>
  );
}

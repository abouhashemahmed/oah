// FILE: /web/components/HomeHero.tsx

import Link from "next/link";

const heritageChips = [
  { label: "Palestinian", slug: "palestinian" },
  { label: "Egyptian", slug: "egyptian" },
  { label: "Syrian", slug: "syrian" },
  { label: "Lebanese", slug: "lebanese" },
  { label: "Moroccan", slug: "moroccan" },
  { label: "Iraqi", slug: "iraqi" },
];

export default function HomeHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-950 via-black to-zinc-900 px-6 py-10 sm:px-10 sm:py-14 mb-10">
      {/* Subtle glow in the background */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -top-32 right-0 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-32 left-0 h-64 w-64 rounded-full bg-amber-400/15 blur-3xl" />
      </div>

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center">
        {/* Left: text */}
        <div className="flex-1 space-y-5">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Curated Arab makers · Diaspora & homeland
          </p>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white">
            A{" "}
            <span className="italic tracking-normal text-emerald-300">
              living marketplace
            </span>{" "}
            of Arab craft, story, and heritage.
          </h1>

          <p className="max-w-xl text-sm sm:text-base text-white/70 leading-relaxed">
            Discover pieces that feel like home—hand-embroidered textiles,
            ceramics, calligraphy, jewelry, and more from artisans across
            Palestine and the wider Arab world.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-500 transition"
            >
              Browse all products
            </Link>

            <Link
              href="/for-sellers"
              className="inline-flex items-center justify-center rounded-lg border border-white/25 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/90 hover:bg-white/10 transition"
            >
              Become a seller
            </Link>
          </div>

          {/* Heritage chips */}
          <div className="pt-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-2">
              Shop by heritage
            </p>
            <div className="flex flex-wrap gap-2">
              {heritageChips.map((h) => (
                <Link
                  key={h.slug}
                  href={`/products?heritage=${encodeURIComponent(h.slug)}`}
                  className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80 hover:bg-white/10 hover:border-emerald-400/60 transition"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {h.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right: simple “product collage” placeholder */}
        <div className="flex-1">
          <div className="mx-auto grid max-w-md grid-cols-2 gap-3">
            <div className="h-40 sm:h-48 rounded-2xl border border-white/15 bg-[url('/images/placeholder-1.jpg')] bg-cover bg-center bg-no-repeat bg-white/5" />
            <div className="h-32 sm:h-40 translate-y-6 rounded-2xl border border-white/15 bg-[url('/images/placeholder-2.jpg')] bg-cover bg-center bg-no-repeat bg-white/5" />
            <div className="h-32 sm:h-40 -translate-y-4 rounded-2xl border border-white/15 bg-[url('/images/placeholder-3.jpg')] bg-cover bg-center bg-no-repeat bg-white/5" />
            <div className="h-40 sm:h-48 rounded-2xl border border-emerald-400/40 bg-white/5 flex items-center justify-center text-xs text-white/70">
              Curated by{" "}
              <span className="ml-1 font-semibold text-emerald-300">
                Our Arab Heritage
              </span>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-white/40 text-center max-w-md mx-auto">
            Later we can wire these blocks to real featured collections or
            “Editor’s picks” from your Shopify products.
          </p>
        </div>
      </div>
    </section>
  );
}

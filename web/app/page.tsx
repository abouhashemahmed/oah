// FILE: /web/app/page.tsx
import Link from "next/link";
import { getProducts } from "@/lib/shopify";

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

/** Helper: derive heritage label from tags like `heritage:palestinian` */
function getHeritageLabel(tags: string[] | null | undefined): string | null {
  if (!Array.isArray(tags)) return null;
  const tag = tags.find(
    (t) => typeof t === "string" && t.toLowerCase().startsWith("heritage:")
  );
  if (!tag) return null;
  const raw = tag.split(":")[1] ?? "";
  return raw
    .split(/[\s_-]+/)
    .map(
      (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    )
    .join(" ");
}

export default async function HomePage() {
  // Grab a few products to feature on the homepage
  const featured = await getProducts({
    first: 8,
    sort: "CREATED_AT",
    reverse: true, // newest first
  });

  const topFeatured = featured.slice(0, 4);

  const heritageOptions = [
    "palestinian",
    "egyptian",
    "jordanian",
    "syrian",
    "lebanese",
    "iraqi",
    "emirati",
    "saudi",
    "moroccan",
    "tunisian",
    "algerian",
  ];

  return (
    <main className="max-w-7xl mx-auto px-6 py-10 text-white">
      {/* HERO */}
      <section className="grid gap-10 md:grid-cols-2 items-center pt-10">
        <div>
          <p className="text-xs tracking-[0.25em] uppercase text-white/60 mb-3">
            Curated Arab marketplace
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight mb-4">
            Handcrafted pieces from{" "}
            <span className="italic">our</span> Arab heritage.
          </h1>
          <p className="text-sm md:text-base text-white/70 max-w-xl mb-6">
            Discover textiles, ceramics, jewelry, calligraphy and more —
            created by Arab artisans and diaspora makers, and shipped to you
            with care.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-md bg-white text-black px-5 py-2.5 text-sm font-semibold hover:bg-white/90"
            >
              Shop the collection
            </Link>
            <Link
              href="/for-sellers"
              className="inline-flex items-center justify-center rounded-md border border-white/30 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              Become a seller
            </Link>
          </div>

          <p className="mt-4 text-[11px] text-white/50">
            Early access · No listing fees while we’re in beta.
          </p>
        </div>

        {/* Right side: simple “hero” card / collage */}
        <div className="relative">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-6 md:p-8 shadow-xl">
            <p className="text-xs uppercase tracking-[0.2em] text-white/60 mb-3">
              A living gallery
            </p>
            <p className="text-sm text-white/80 mb-4">
              Each piece carries a story — from a Palestinian embroiderer in
              Ramallah to a Moroccan woodworker in Casablanca. Our goal is to
              feel less like a warehouse, more like a gallery.
            </p>
            <p className="text-[11px] text-white/50">
              We’re starting with a small, handpicked selection and will open
              the doors to more makers over time.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="mt-16">
        <div className="flex items-center justify-between gap-3 mb-6">
          <h2 className="text-xl md:text-2xl font-semibold">
            Featured pieces
          </h2>
          <Link
            href="/products"
            className="text-xs text-white/70 hover:text-white underline-offset-4 hover:underline"
          >
            View all products
          </Link>
        </div>

        {topFeatured.length === 0 ? (
          <p className="text-sm text-white/60">
            No products are available yet. As artisans join, we’ll feature
            their work here.
          </p>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
            {topFeatured.map((p: any) => {
              const image = p.featuredImage || p.images?.edges?.[0]?.node;
              const priceAmount =
                p.priceRange?.minVariantPrice?.amount ?? null;
              const priceCurrency =
                p.priceRange?.minVariantPrice?.currencyCode ?? "USD";
              const heritageLabel = getHeritageLabel(p.tags);

              return (
                <Link
                  key={p.id}
                  href={`/products/${p.handle}`}
                  className="group rounded-2xl border border-white/10 bg-white/5 p-3 flex flex-col hover:bg-white/10 transition"
                >
                  <div className="w-full h-44 rounded-xl overflow-hidden bg-white/5 mb-3">
                    {image?.url ? (
                      <img
                        src={image.url}
                        alt={image.altText ?? p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-white/50">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <p className="text-sm font-semibold line-clamp-2">
                      {p.title}
                    </p>
                    <div className="flex items-center justify-between text-xs text-white/70">
                      <span>{formatMoney(priceAmount, priceCurrency)}</span>
                      {heritageLabel && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-600/15 border border-emerald-400/50 text-[11px]">
                          {heritageLabel}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* SHOP BY HERITAGE */}
      <section className="mt-16">
        <h2 className="text-xl md:text-2xl font-semibold mb-4">
          Shop by heritage
        </h2>
        <p className="text-sm text-white/70 mb-4 max-w-2xl">
          Start your search from home — whether that’s Gaza, Cairo, Damascus,
          Beirut, Baghdad, or beyond.
        </p>

        <div className="flex flex-wrap gap-3">
          {heritageOptions.map((h) => {
            const label =
              h.charAt(0).toUpperCase() + h.slice(1).toLowerCase();
            return (
              <Link
                key={h}
                href={`/products?heritage=${encodeURIComponent(h)}`}
                className="px-3 py-1.5 rounded-full border border-white/20 text-xs text-white/80 hover:bg-white/10"
              >
                {label}
              </Link>
            );
          })}
        </div>
      </section>

      {/* TRUST / STORY STRIP */}
      <section className="mt-16 mb-10">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 md:px-6 md:py-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between text-sm">
          <div>
            <p className="font-semibold mb-1">
              Built by and for the Arab community.
            </p>
            <p className="text-white/70 text-xs md:text-sm">
              Our Arab Heritage is starting small and careful: curated vendors,
              transparent policies, and a focus on preserving culture — not
              flooding you with random dropshipping.
            </p>
          </div>
          <div className="flex gap-3 text-[11px] text-white/70">
            <div className="rounded-xl border border-white/15 bg-black/40 px-3 py-2">
              No listing fees (beta)
            </div>
            <div className="rounded-xl border border-white/15 bg-black/40 px-3 py-2">
              Diaspora & region makers welcome
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

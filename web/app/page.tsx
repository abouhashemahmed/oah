// FILE: /web/app/page.tsx
import Link from "next/link";
import { getProducts } from "@/lib/shopify";

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

/** Turn "palestinian" -> "PALESTINIAN" */
function heritageFromTags(tags: string[] | null | undefined): string | null {
  if (!tags || !Array.isArray(tags)) return null;

  const heritageTag = tags.find((t) =>
    t.toLowerCase().startsWith("heritage:")
  );
  if (!heritageTag) return null;

  const raw = heritageTag.split(":")[1] ?? "";
  if (!raw) return null;
  return raw.toUpperCase();
}

export default async function HomePage() {
  // Grab a few latest products to feature
  const products = await getProducts({
    first: 6,
    sort: "CREATED_AT",
    reverse: true,
  });

  return (
    <main className="bg-black text-white">
      {/* Outer container */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        {/* HERO */}
        <section className="pt-8 pb-12 border-b border-white/10">
          <div className="space-y-6 md:space-y-8">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                Our Arab Heritage
              </h1>
              <p className="max-w-2xl text-sm md:text-base text-white/70 leading-relaxed">
                A curated marketplace celebrating Palestinian and Arab artisans,
                stories, and culture. Discover meaningful pieces and support
                independent creators across our heritage.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold transition"
              >
                Browse all products
              </Link>
              <Link
                href="/products?heritage=palestinian"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-white/30 hover:bg-white/10 text-sm font-semibold transition"
              >
                Shop Palestinian pieces
              </Link>
            </div>
          </div>
        </section>

        {/* FEATURED */}
        <section className="pt-10">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-semibold">
              Featured pieces
            </h2>
            <Link
              href="/products"
              className="text-sm text-white/60 hover:text-white underline-offset-4 hover:underline"
            >
              View all
            </Link>
          </div>

          {products.length === 0 ? (
            <p className="text-white/60 text-sm">
              No products yet. Add items in Shopify to see them here.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product: any) => {
                const img =
                  product.featuredImage ??
                  product.images?.edges?.[0]?.node ??
                  null;
                const priceAmount =
                  product.priceRange?.minVariantPrice?.amount ?? null;
                const currency =
                  product.priceRange?.minVariantPrice?.currencyCode ?? "USD";
                const heritageLabel = heritageFromTags(product.tags);

                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.handle}`}
                    className="group rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:bg-white/10 transition flex flex-col"
                  >
                    {/* IMAGE */}
                    <div className="w-full h-64 bg-white/5 overflow-hidden">
                      {img?.url ? (
                        <img
                          src={img.url}
                          alt={img.altText ?? product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-white/60">
                          No image
                        </div>
                      )}
                    </div>

                    {/* TEXT */}
                    <div className="px-4 py-3 flex-1 flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-semibold text-sm md:text-base line-clamp-2">
                          {product.title}
                        </p>
                        <span className="text-sm md:text-base whitespace-nowrap">
                          {formatMoney(priceAmount, currency)}
                        </span>
                      </div>
                    </div>

                    {/* HERITAGE BAR */}
                    <div className="px-4 py-2 bg-black/60 border-t border-white/10 text-xs tracking-wide text-white/70 flex items-center justify-between">
                      <span className="font-medium text-[11px] md:text-xs">
                        {heritageLabel ?? "ARAB HERITAGE"}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

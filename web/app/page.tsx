// FILE: /web/app/page.tsx
import Link from "next/link";
import { getProducts } from "@/lib/shopify";

/* ---------------------------------------------
   UI LABELS (i18n-friendly)
---------------------------------------------- */
const LABELS = {
  heroTitle: "Our Arab Heritage",
  heroSubtitle:
    "Discover authentic Middle Eastern products crafted by artisans from across the Arab world.",
  heroCTA: "Explore Products",
  featuredTitle: "Featured Products",
  noProducts: "No featured products are available.",
};

/* ---------------------------------------------
   Page (Server Component)
---------------------------------------------- */
export default async function HomePage() {
  // Fetch up to 8 newest products
  const products = await getProducts({
    first: 8,
    sort: "CREATED_AT",
    reverse: true,
  });

  return (
    <main className="max-w-6xl mx-auto px-6 py-12 text-white">
      {/* ---------------- HERO SECTION ---------------- */}
      <section className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4">{LABELS.heroTitle}</h1>
        <p className="text-lg opacity-80 max-w-2xl mx-auto mb-6">
          {LABELS.heroSubtitle}
        </p>

        <Link
          href="/products"
          className="inline-block rounded-lg bg-indigo-600 px-6 py-3 text-lg font-medium hover:bg-indigo-500 transition"
        >
          {LABELS.heroCTA}
        </Link>
      </section>

      {/* ---------------- FEATURED PRODUCTS ---------------- */}
      <section>
        <h2 className="text-3xl font-bold mb-6">{LABELS.featuredTitle}</h2>

        {products.length === 0 ? (
          <p className="opacity-70">{LABELS.noProducts}</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((p: any) => {
              const img = p.images?.edges?.[0]?.node;
              const price = Number(
                p.priceRange.minVariantPrice.amount
              ).toFixed(2);

              return (
                <li
                  key={p.id}
                  className="group relative border border-white/10 rounded-xl overflow-hidden bg-black/10 backdrop-blur shadow-md hover:-translate-y-1 hover:shadow-2xl transition"
                >
                  <Link href={`/products/${p.handle}`} className="block">
                    <div className="aspect-square bg-black/10 overflow-hidden">
                      {img ? (
                        <img
                          src={img.url}
                          alt={img.altText ?? p.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center opacity-60">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-indigo-400 transition">
                        {p.title}
                      </h3>

                      <p className="mt-1 text-sm opacity-80">
                        ${price} {p.priceRange.minVariantPrice.currencyCode}
                      </p>

                      <span className="inline-block mt-3 text-sm text-indigo-400 group-hover:underline">
                        View product →
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}

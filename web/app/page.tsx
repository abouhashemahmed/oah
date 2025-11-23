// FILE: /web/app/page.tsx
import Link from "next/link";
import { getProducts } from "@/lib/shopify";

export default async function HomePage() {
  // Ensure Shopify returns a predictable structure
  const productData = await getProducts({ first: 8 });

  const products = Array.isArray(productData?.edges)
    ? productData.edges.map((e: any) => e.node)
    : [];

  return (
    <main className="max-w-7xl mx-auto px-6 py-12 text-white">
      {/* Hero */}
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Our Arab Heritage
        </h1>
        <p className="text-lg opacity-80 max-w-2xl mx-auto mb-8">
          Discover authentic handcrafted products from artisans across the Arab world.
        </p>

        <Link
          href="/products"
          className="inline-block bg-indigo-600 hover:bg-indigo-500 transition text-white font-semibold px-6 py-3 rounded-lg"
        >
          Browse Products
        </Link>
      </section>

      {/* Featured Products */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Featured Products</h2>

        {products.length === 0 && (
          <p className="opacity-70">No products available.</p>
        )}

        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p: any) => {
            const img = p.featuredImage;

            return (
              <Link
                key={p.id}
                href={`/products/${p.handle}`}
                className="group rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:bg-white/10 transition p-4"
              >
                <div className="w-full h-52 mb-3 rounded-lg overflow-hidden bg-white/5">
                  {img?.url ? (
                    <img
                      src={img.url}
                      alt={img.altText ?? p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-60">
                      No image
                    </div>
                  )}
                </div>

                <p className="font-semibold mb-1">{p.title}</p>

                <p className="text-sm opacity-75">
                  {p.priceRange?.minVariantPrice?.amount
                    ? `$${p.priceRange.minVariantPrice.amount} USD`
                    : "—"}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}

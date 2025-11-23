// FILE: /web/app/products/page.tsx
import Link from "next/link";
import { getProducts } from "@/lib/shopify";

export const metadata = {
  title: "Products | Our Arab Heritage",
};

type ProductsPageProps = {
  searchParams: Promise<{
    q?: string;
    min?: string;
    max?: string;
    sort?: string;
    heritage?: string | string[];
    category?: string | string[];
  }>;
};

export default async function ProductsPage(props: ProductsPageProps) {
  const params = await props.searchParams;

  const query = params.q ?? "";
  const minPrice = params.min ? Number(params.min) : null;
  const maxPrice = params.max ? Number(params.max) : null;
  const sort = params.sort ?? "created-desc";

  // Normalize filters (ensure arrays)
  const heritageFilter = Array.isArray(params.heritage)
    ? params.heritage
    : params.heritage
    ? [params.heritage]
    : [];

  const categoryFilter = Array.isArray(params.category)
    ? params.category
    : params.category
    ? [params.category]
    : [];

  // Fetch all Shopify products
  const allProducts = await getProducts({ first: 100 });

  // --------------------------
  // Server-side filtering logic
  // --------------------------

  let filtered = [...allProducts];

  // Text search
  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(
      (p: any) =>
        p.title.toLowerCase().includes(q) ||
        p.handle.toLowerCase().includes(q)
    );
  }

  // Price filtering
  filtered = filtered.filter((p: any) => {
    const price = Number(p.priceRange?.minVariantPrice?.amount ?? 0);
    if (minPrice !== null && price < minPrice) return false;
    if (maxPrice !== null && price > maxPrice) return false;
    return true;
  });

  // Heritage filtering (using product.tags from Shopify)
  if (heritageFilter.length > 0) {
    filtered = filtered.filter((p: any) =>
      heritageFilter.some((h) => p.tags?.includes(h))
    );
  }

  // Category filtering (tags as well)
  if (categoryFilter.length > 0) {
    filtered = filtered.filter((p: any) =>
      categoryFilter.some((c) => p.tags?.includes(c))
    );
  }

  // Sorting
  filtered.sort((a: any, b: any) => {
    const A = Number(a.priceRange?.minVariantPrice?.amount ?? 0);
    const B = Number(b.priceRange?.minVariantPrice?.amount ?? 0);

    switch (sort) {
      case "price-asc":
        return A - B;
      case "price-desc":
        return B - A;
      case "title-asc":
        return a.title.localeCompare(b.title);
      case "title-desc":
        return b.title.localeCompare(a.title);
      case "created-asc":
        return (
          new Date(a.createdAt ?? 0).getTime() -
          new Date(b.createdAt ?? 0).getTime()
        );
      case "created-desc":
      default:
        return (
          new Date(b.createdAt ?? 0).getTime() -
          new Date(a.createdAt ?? 0).getTime()
        );
    }
  });

  return (
    <main className="max-w-7xl mx-auto px-6 py-12 text-white">
      <h1 className="text-3xl font-bold mb-8">Products</h1>

      {/* Filters + Search */}
      <FiltersUI />

      {/* If no products */}
      {filtered.length === 0 && (
        <p className="opacity-70 mt-10">No products found.</p>
      )}

      {/* Product Grid */}
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-10">
        {filtered.map((p: any) => {
          // ✅ Correct image path based on your lib/shopify.ts
          const image = p.images?.edges?.[0]?.node ?? null;

          const priceAmount = p.priceRange?.minVariantPrice?.amount ?? null;
          const priceCurrency =
            p.priceRange?.minVariantPrice?.currencyCode ?? "USD";

          return (
            <Link
              key={p.id}
              href={`/products/${p.handle}`}
              className="group rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:bg-white/10 transition p-4"
            >
              <div className="w-full h-52 mb-3 rounded-lg overflow-hidden bg-white/5">
                {image?.url ? (
                  <img
                    src={image.url}
                    alt={image.altText ?? p.title}
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
                {priceAmount ? `${priceAmount} ${priceCurrency}` : "—"}
              </p>
            </Link>
          );
        })}
      </div>
    </main>
  );
}

/* -------------------------
   FILTER UI COMPONENT
-------------------------- */
function FiltersUI() {
  return (
    <form
      action="/products"
      className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col gap-4"
    >
      {/* Search */}
      <div className="flex gap-4">
        <input
          name="q"
          placeholder="Search products…"
          className="flex-1 px-3 py-2 rounded-md bg-black/40 border border-white/10 text-white"
        />

        <select
          name="sort"
          className="px-3 py-2 rounded-md bg-black/40 border border-white/10"
        >
          <option value="created-desc">Newest</option>
          <option value="created-asc">Oldest</option>
          <option value="price-asc">Price ↑</option>
          <option value="price-desc">Price ↓</option>
          <option value="title-asc">A–Z</option>
          <option value="title-desc">Z–A</option>
        </select>

        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-md text-white font-semibold"
        >
          Apply
        </button>
      </div>

      {/* Price Range */}
      <div className="flex gap-4">
        <input
          type="number"
          name="min"
          placeholder="Min price"
          className="px-3 py-2 rounded-md bg-black/40 border border-white/10"
        />

        <input
          type="number"
          name="max"
          placeholder="Max price"
          className="px-3 py-2 rounded-md bg-black/40 border border-white/10"
        />
      </div>

      {/* Reset */}
      <Link
        href="/products"
        className="text-sm underline opacity-70 hover:opacity-100"
      >
        Reset
      </Link>
    </form>
  );
}

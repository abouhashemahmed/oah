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

export default async function ProductsPage(props: ProductsPageProps) {
  const params = await props.searchParams;

  // Extract and normalize parameters
  const query = params.q ?? "";
  const minPrice = params.min ? Number(params.min) : undefined;
  const maxPrice = params.max ? Number(params.max) : undefined;
  const sort = params.sort ?? "created-desc";

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

  // Map sort to Shopify sort keys
  const sortMap: Record<string, { sort: any; reverse: boolean }> = {
    "created-desc": { sort: "CREATED_AT", reverse: true },
    "created-asc": { sort: "CREATED_AT", reverse: false },
    "price-asc": { sort: "PRICE", reverse: false },
    "price-desc": { sort: "PRICE", reverse: true },
    "title-asc": { sort: "TITLE", reverse: false },
    "title-desc": { sort: "TITLE", reverse: true },
  };

  const sortConfig = sortMap[sort] || sortMap["created-desc"];

  // ✅ Server-side Shopify filtering (heritage / category / query / sort)
  const rawProducts = await getProducts({
    q: query,
    heritage: heritageFilter,
    category: categoryFilter,
    minPrice,            // still passed (no harm)
    maxPrice,
    sort: sortConfig.sort,
    reverse: sortConfig.reverse,
    first: 100,
  });

  // ✅ EXTRA: Enforce price range locally so it *definitely* works
  const products = rawProducts.filter((p: any) => {
    const amountStr = p.priceRange?.minVariantPrice?.amount;
    const price = amountStr != null ? Number(amountStr) : NaN;

    // If product has no numeric price, keep it (or you can choose to drop it)
    if (!Number.isFinite(price)) return true;

    if (minPrice != null && price < minPrice) return false;
    if (maxPrice != null && price > maxPrice) return false;

    return true;
  });

  return (
    <main className="max-w-7xl mx-auto px-6 py-12 text-white">
      <h1 className="text-3xl font-bold mb-8">Products</h1>

      {/* Filters */}
      <FiltersUI
        initialQuery={query}
        initialMinPrice={params.min}
        initialMaxPrice={params.max}
        initialSort={sort}
        initialHeritage={heritageFilter}
        initialCategory={categoryFilter}
      />

      {/* Results */}
      {products.length === 0 ? (
        // 💬 Friendly empty state
        <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-sm text-white/80">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-lg">
            ☾
          </div>
          <p className="font-semibold mb-1">
            No pieces match these filters… yet.
          </p>
          <p className="text-xs text-white/60 mb-5">
            Try clearing some filters, or browse all products while more
            artisans come online.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-md border border-white/25 px-4 py-2 text-xs font-semibold hover:bg-white/10"
            >
              Reset filters
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md bg-white text-black px-4 py-2 text-xs font-semibold hover:bg-white/90"
            >
              Back to home
            </Link>
          </div>
        </div>
      ) : (
        // 🧺 Product grid
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-10">
          {products.map((p: any) => {
            const image = p.featuredImage || p.images?.edges?.[0]?.node || null;
            const priceAmount =
              p.priceRange?.minVariantPrice?.amount ?? null;
            const priceCurrency =
              p.priceRange?.minVariantPrice?.currencyCode ?? "USD";

            // Heritage badge from tags: "heritage:palestinian"
            let heritageLabel: string | null = null;
            if (Array.isArray(p.tags)) {
              const tag = p.tags.find(
                (t: string) =>
                  typeof t === "string" &&
                  t.toLowerCase().startsWith("heritage:")
              );
              if (tag) {
                const raw = tag.split(":")[1] ?? "";
                heritageLabel = raw
                  .split(/[\s_-]+/)
                  .map(
                    (part: string) =>
                      part.charAt(0).toUpperCase() +
                      part.slice(1).toLowerCase()
                  )
                  .join(" ");
              }
            }

            return (
              <Link
                key={p.id}
                href={`/products/${p.handle}`}
                className="group rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:bg-white/10 transition p-4 flex flex-col"
              >
                <div className="w-full h-52 mb-3 rounded-lg overflow-hidden bg-white/5">
                  {image?.url ? (
                    <img
                      src={image.url}
                      alt={image.altText ?? p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-60 text-xs">
                      No image
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col gap-2">
                  <p className="font-semibold text-sm line-clamp-2">
                    {p.title}
                  </p>

                  <div className="flex items-center justify-between text-xs opacity-80">
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
    </main>
  );
}

/* -------------------------
   FILTER UI COMPONENT
-------------------------- */
function FiltersUI({
  initialQuery = "",
  initialMinPrice = "",
  initialMaxPrice = "",
  initialSort = "created-desc",
  initialHeritage = [],
  initialCategory = [],
}: any) {
  const heritageOptions = [
    "palestinian",
    "egyptian",
    "jordanian",
    "syrian",
    "lebanese",
    "iraqi",
    "saudi",
    "emirati",
    "qatari",
    "kuwaiti",
    "bahraini",
    "omani",
    "yemeni",
    "moroccan",
    "algerian",
    "tunisian",
    "libyan",
    "sudanese",
    "somali",
    "mauritanian",
    "djiboutian",
    "comorian",
  ];

  const categoryOptions = [
    "textiles",
    "jewelry",
    "ceramics",
    "woodwork",
    "calligraphy",
    "glass",
    "metalwork",
    "leather",
  ];

  return (
    <form
      action="/products"
      className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col gap-6"
    >
      {/* Search + Sort */}
      <div className="flex flex-col md:flex-row gap-4">
        <input
          name="q"
          placeholder="Search products…"
          defaultValue={initialQuery}
          className="flex-1 px-3 py-2 rounded-md bg-black/40 border border-white/10 text-white"
        />

        <select
          name="sort"
          className="px-3 py-2 rounded-md bg-black/40 border border-white/10 text-white"
          defaultValue={initialSort}
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

        {(initialHeritage.length > 0 ||
          initialCategory.length > 0 ||
          initialMinPrice ||
          initialMaxPrice) && (
          <Link
            href="/products"
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md text-white font-semibold transition"
          >
            Clear
          </Link>
        )}
      </div>

      {/* Price Range */}
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="number"
          name="min"
          placeholder="Min price"
          defaultValue={initialMinPrice}
          className="px-3 py-2 rounded-md bg-black/40 border border-white/10 text-white w-full md:w-40"
        />
        <input
          type="number"
          name="max"
          placeholder="Max price"
          defaultValue={initialMaxPrice}
          className="px-3 py-2 rounded-md bg-black/40 border border-white/10 text-white w-full md:w-40"
        />
      </div>

      {/* Heritage + Category */}
      <div className="grid md:grid-cols-2 gap-6 text-sm">
        {/* Heritage */}
        <div>
          <p className="font-semibold mb-2">Heritage</p>
          <div className="flex flex-wrap gap-3">
            {heritageOptions.map((h) => (
              <label key={h} className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  name="heritage"
                  value={h}
                  defaultChecked={initialHeritage.includes(h)}
                  className="rounded border-white/40 bg-black/60"
                />
                <span className="capitalize">{h}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Category */}
        <div>
          <p className="font-semibold mb-2">Category</p>
          <div className="flex flex-wrap gap-3">
            {categoryOptions.map((c) => (
              <label key={c} className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  name="category"
                  value={c}
                  defaultChecked={initialCategory.includes(c)}
                  className="rounded border-white/40 bg-black/60"
                />
                <span className="capitalize">{c}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Reset link */}
      <div>
        <Link
          href="/products"
          className="text-sm underline opacity-70 hover:opacity-100"
        >
          Reset
        </Link>
      </div>
    </form>
  );
}

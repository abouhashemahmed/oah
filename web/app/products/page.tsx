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

function formatMoney(amount: string | number | null | undefined, currency: string | null | undefined) {
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
  const sortMap: Record<string, { sort: any, reverse: boolean }> = {
    "created-desc": { sort: "CREATED_AT", reverse: true },
    "created-asc": { sort: "CREATED_AT", reverse: false },
    "price-asc": { sort: "PRICE", reverse: false },
    "price-desc": { sort: "PRICE", reverse: true },
    "title-asc": { sort: "TITLE", reverse: false },
    "title-desc": { sort: "TITLE", reverse: true },
  };

  const sortConfig = sortMap[sort] || sortMap["created-desc"];

  // ✅ ACTUAL SERVER-SIDE SHOPIFY FILTERING
  const products = await getProducts({
    q: query,
    heritage: heritageFilter,
    category: categoryFilter,
    minPrice,
    maxPrice,
    sort: sortConfig.sort,
    reverse: sortConfig.reverse,
    first: 100,
  });

  return (
    <main className="max-w-7xl mx-auto px-6 py-12 text-white">
      <h1 className="text-3xl font-bold mb-8">Products</h1>

      {/* Your existing FiltersUI component */}
      <FiltersUI 
        initialQuery={query}
        initialMinPrice={params.min}
        initialMaxPrice={params.max}
        initialSort={sort}
        initialHeritage={heritageFilter}
        initialCategory={categoryFilter}
      />

      {products.length === 0 && (
        <p className="opacity-70 mt-10">No products found.</p>
      )}

      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-10">
        {products.map((p: any) => {
          const image = p.featuredImage || p.images?.edges?.[0]?.node || null;
          const priceAmount = p.priceRange?.minVariantPrice?.amount ?? null;
          const priceCurrency = p.priceRange?.minVariantPrice?.currencyCode ?? "USD";

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
                {formatMoney(priceAmount, priceCurrency)}
              </p>
            </Link>
          );
        })}
      </div>
    </main>
  );
}

/* -------------------------
   FILTER UI COMPONENT (minimal changes)
-------------------------- */
function FiltersUI({ 
  initialQuery = "",
  initialMinPrice = "",
  initialMaxPrice = "",
  initialSort = "created-desc",
  initialHeritage = [],
  initialCategory = []
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
  "comorian"
];


  const categoryOptions = [
    "textiles", "jewelry", "ceramics", "woodwork", "calligraphy", 
    "glass", "metalwork", "leather"
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

        {(initialHeritage.length > 0 || initialCategory.length > 0 || initialMinPrice || initialMaxPrice) && (
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

      {/* Reset */}
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
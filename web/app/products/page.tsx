import Link from "next/link";
import { shopify } from "@/lib/shopify";

// ---------- Types ----------
type GQLImage = { altText: string | null; url: string };
type ProductNode = {
  id: string;
  title: string;
  handle: string;
  productType?: string | null;
  tags?: string[];
  images: { edges: { node: GQLImage }[] };
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
};

type ProductsResult = {
  data: {
    products: { edges: { node: ProductNode }[] };
  };
};

// ---------- GraphQL ----------
const QUERY = /* GraphQL */ `
  query ProductsGrid($first: Int!, $query: String, $sortKey: ProductSortKeys!, $reverse: Boolean!) {
    products(first: $first, query: $query, sortKey: $sortKey, reverse: $reverse) {
      edges {
        node {
          id
          title
          handle
          productType
          tags
          images(first: 1) {
            edges { node { altText url } }
          }
          priceRange {
            minVariantPrice { amount currencyCode }
          }
        }
      }
    }
  }
`;

// In dev/demo, force dynamic so changes reflect instantly.
export const dynamic = "force-dynamic";

// ---------- Helpers ----------
function parseCSVParam(v: string | string[] | undefined): string[] {
  if (!v) return [];
  const s = Array.isArray(v) ? v[0] : v;
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function orGroup(parts: string[]): string | undefined {
  if (!parts.length) return undefined;
  if (parts.length === 1) return parts[0];
  return `(${parts.join(" OR ")})`;
}

// ---------- Page ----------
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  // Free text + price filters (existing)
  const term = (Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? "";
  const min = (Array.isArray(sp.min) ? sp.min[0] : sp.min) ?? "";
  const max = (Array.isArray(sp.max) ? sp.max[0] : sp.max) ?? "";
  const sort = ((Array.isArray(sp.sort) ? sp.sort[0] : sp.sort) ?? "created-desc") as
    | "created-desc"
    | "created-asc"
    | "price-asc"
    | "price-desc"
    | "title-asc"
    | "title-desc";

  // New: heritage + category from URL (comma-separated lists)
  const heritage = parseCSVParam(sp.heritage); // e.g., ['palestinian','egyptian']
  const category = parseCSVParam(sp.category); // e.g., ['Textiles','Jewelry']

  // Build Shopify search query string
  // Docs: https://shopify.dev/docs/api/storefront/latest/queries/products#arguments-products-connection
  const qParts: string[] = [];

  // Title / fulltext (basic)
  if (term) qParts.push(`title:${JSON.stringify(term)}`);

  // Price range
  if (min) qParts.push(`price:>=${Number(min)}`);
  if (max) qParts.push(`price:<=${Number(max)}`);

  // Heritage via tags: heritage:palestinian, heritage:egyptian, etc.
  const heritageClauses = heritage.map((h) => `tag:${JSON.stringify(`heritage:${h.toLowerCase()}`)}`);
  const heritageQuery = orGroup(heritageClauses);
  if (heritageQuery) qParts.push(heritageQuery);

  // Category via product_type (or switch to tags if you prefer)
  const categoryClauses = category.map((c) => `product_type:${JSON.stringify(c)}`);
  const categoryQuery = orGroup(categoryClauses);
  if (categoryQuery) qParts.push(categoryQuery);

  const q = qParts.length ? qParts.join(" AND ") : undefined;

  // Map sort option to Storefront sortKey + reverse
  let sortKey: "CREATED_AT" | "PRICE" | "TITLE" = "CREATED_AT";
  let reverse = true;
  switch (sort) {
    case "created-asc":
      sortKey = "CREATED_AT";
      reverse = false;
      break;
    case "price-asc":
      sortKey = "PRICE";
      reverse = false;
      break;
    case "price-desc":
      sortKey = "PRICE";
      reverse = true;
      break;
    case "title-asc":
      sortKey = "TITLE";
      reverse = false;
      break;
    case "title-desc":
      sortKey = "TITLE";
      reverse = true;
      break;
    default:
      sortKey = "CREATED_AT";
      reverse = true;
  }

  // Fetch
  let items: ProductNode[] = [];
  try {
    const res = await shopify<ProductsResult>(QUERY, {
      first: 24,
      query: q,
      sortKey,
      reverse,
    });
    items = res.data.products.edges.map((e) => e.node);
  } catch (err) {
    console.error("Shopify fetch failed:", err);
  }

  // Static options (you can edit these lists anytime)
  const HERITAGE_OPTIONS = [
    { value: "palestinian", label: "Palestinian" },
    { value: "egyptian", label: "Egyptian" },
    { value: "syrian", label: "Syrian" },
    { value: "lebanese", label: "Lebanese" },
    { value: "moroccan", label: "Moroccan" },
    { value: "iraqi", label: "Iraqi" },
    { value: "saudi", label: "Saudi" },
    { value: "emirati", label: "Emirati" },
    { value: "jordanian", label: "Jordanian" },
    { value: "tunisian", label: "Tunisian" },
    { value: "algerian", label: "Algerian" },
    { value: "yemeni", label: "Yemeni" },
  ];

  const CATEGORY_OPTIONS = [
    "Textiles",
    "Jewelry",
    "Ceramics",
    "Woodwork",
    "Calligraphy",
    "Glass",
    "Metalwork",
    "Leather",
  ];

  // Helper to keep other query params when (un)checking filters
  const currentParams = new URLSearchParams();
  if (term) currentParams.set("q", term);
  if (min) currentParams.set("min", min);
  if (max) currentParams.set("max", max);
  if (sort) currentParams.set("sort", sort);
  // Keep chosen heritage/category as CSV in the form (we’ll generate checkboxes)
  if (heritage.length) currentParams.set("heritage", heritage.join(","));
  if (category.length) currentParams.set("category", category.join(","));

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6 text-white">Products</h1>

      {/* Filters / Sorting */}
      <form className="mb-6 grid gap-4 lg:grid-cols-4" action="/products" method="get">
        {/* Search */}
        <input
          name="q"
          defaultValue={term}
          placeholder="Search title…"
          className="rounded-lg border border-white/15 bg-black/10 px-3 py-2 text-white placeholder-white/60"
        />

        {/* Price range */}
        <div className="flex gap-2">
          <input
            name="min"
            defaultValue={min}
            inputMode="decimal"
            placeholder="Min $"
            className="w-1/2 rounded-lg border border-white/15 bg-black/10 px-3 py-2 text-white placeholder-white/60"
          />
          <input
            name="max"
            defaultValue={max}
            inputMode="decimal"
            placeholder="Max $"
            className="w-1/2 rounded-lg border border-white/15 bg-black/10 px-3 py-2 text-white placeholder-white/60"
          />
        </div>

        {/* Sort */}
        <select
          name="sort"
          defaultValue={sort}
          className="rounded-lg border border-white/15 bg-black/10 px-3 py-2 text-white"
        >
          <option value="created-desc">Newest</option>
          <option value="created-asc">Oldest</option>
          <option value="price-asc">Price ↑</option>
          <option value="price-desc">Price ↓</option>
          <option value="title-asc">Title A–Z</option>
          <option value="title-desc">Title Z–A</option>
        </select>

        {/* Submit + Reset */}
        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500 transition"
          >
            Apply
          </button>
          <a
            href="/products"
            className="rounded-lg border border-white/20 px-4 py-2 hover:bg-white/10 transition"
          >
            Reset
          </a>
        </div>

        {/* Heritage checkboxes */}
        <fieldset className="lg:col-span-2 border border-white/10 rounded-xl p-3">
          <legend className="px-1 text-sm uppercase tracking-wider opacity-70">Heritage</legend>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
            {HERITAGE_OPTIONS.map((h) => {
              const checked = heritage.includes(h.value);
              return (
                <label key={h.value} className="flex items-center gap-2 text-white">
                  <input
                    type="checkbox"
                    name="heritage"
                    value={h.value}
                    defaultChecked={checked}
                    className="accent-indigo-500"
                  />
                  <span>{h.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* Category checkboxes */}
        <fieldset className="lg:col-span-2 border border-white/10 rounded-xl p-3">
          <legend className="px-1 text-sm uppercase tracking-wider opacity-70">Category</legend>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
            {CATEGORY_OPTIONS.map((c) => {
              const checked = category.includes(c);
              return (
                <label key={c} className="flex items-center gap-2 text-white">
                  <input
                    type="checkbox"
                    name="category"
                    value={c}
                    defaultChecked={checked}
                    className="accent-indigo-500"
                  />
                  <span>{c}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </form>

      {/* Results */}
      {items.length === 0 ? (
        <p className="opacity-75">No products match your filters.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {items.map((p) => {
            const img = p.images?.edges?.[0]?.node;
            const price = `${Number(p.priceRange.minVariantPrice.amount).toFixed(2)} ${
              p.priceRange.minVariantPrice.currencyCode
            }`;
            return (
              <li
                key={p.id}
                className="group relative border border-white/10 rounded-2xl overflow-hidden bg-black/10 backdrop-blur-sm shadow-md transition-transform duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/20"
              >
                <Link
                  href={`/products/${p.handle}`}
                  className="block focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <div className="aspect-square bg-black/10 overflow-hidden">
                    {img ? (
                      <img
                        src={img.url}
                        alt={img.altText ?? p.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-sm opacity-60">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-4 text-white">
                    <h2 className="font-semibold text-lg line-clamp-2 group-hover:text-indigo-400 transition-colors">
                      {p.title}
                    </h2>
                    <p className="mt-1 text-sm opacity-80">{price}</p>
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
    </main>
  );
}

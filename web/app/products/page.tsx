// FILE: /web/app/products/page.tsx

import Link from "next/link";
import { getProducts } from "@/lib/shopify";

/* ---------------------------
   UI LABELS (i18n-friendly)
---------------------------- */
const LABELS = {
  title: "Products",
  searchPlaceholder: "Search products…",
  minPrice: "Min $",
  maxPrice: "Max $",
  sort: "Sort",
  apply: "Apply",
  reset: "Reset",
  heritage: "Heritage",
  category: "Category",
  noResults: "No products match your filters.",
};

/* ---------------------------
   Filter option data
---------------------------- */
const HERITAGE_OPTIONS = [
  "Palestinian",
  "Egyptian",
  "Syrian",
  "Lebanese",
  "Moroccan",
  "Iraqi",
  "Saudi",
  "Emirati",
  "Jordanian",
  "Tunisian",
  "Algerian",
  "Yemeni",
].map((h) => ({ value: h.toLowerCase(), label: h }));

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

/* ---------------------------
   Helpers
---------------------------- */
function parseList(v: string | string[] | undefined): string[] {
  if (!v) return [];
  const raw = Array.isArray(v) ? v[0] : v;
  return raw
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function parseOne(v: string | string[] | undefined): string | undefined {
  if (!v) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

function mapSortParam(sort: string | undefined) {
  switch (sort) {
    case "price-asc":
      return { sortKey: "PRICE" as const, reverse: false };
    case "price-desc":
      return { sortKey: "PRICE" as const, reverse: true };
    case "title-asc":
      return { sortKey: "TITLE" as const, reverse: false };
    case "title-desc":
      return { sortKey: "TITLE" as const, reverse: true };
    case "created-asc":
      return { sortKey: "CREATED_AT" as const, reverse: false };
    default:
      return { sortKey: "CREATED_AT" as const, reverse: true };
  }
}

/* ---------------------------
   Page (Server Component)
---------------------------- */
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const term = parseOne(params.q);
  const heritage = parseList(params.heritage);
  const category = parseList(params.category);
  const minPrice = params.min ? Number(parseOne(params.min)) : undefined;
  const maxPrice = params.max ? Number(parseOne(params.max)) : undefined;

  const sortParam = parseOne(params.sort);
  const { sortKey, reverse } = mapSortParam(sortParam);

  /* Fetch products using the new helper */
  const products = await getProducts({
    q: term,
    heritage,
    category,
    minPrice,
    maxPrice,
    sort: sortKey,
    reverse,
    first: 24,
  });

  /* Persist search params in form */
  const current = new URLSearchParams();
  if (term) current.set("q", term);
  if (heritage.length) current.set("heritage", heritage.join(","));
  if (category.length) current.set("category", category.join(","));
  if (minPrice) current.set("min", String(minPrice));
  if (maxPrice) current.set("max", String(maxPrice));
  if (sortParam) current.set("sort", sortParam);

  return (
    <main className="max-w-6xl mx-auto p-6 text-white">
      <h1 className="text-4xl font-bold mb-6">{LABELS.title}</h1>

      {/* ---------------- FILTER FORM ---------------- */}
      <form
        action="/products"
        method="get"
        className="mb-8 grid gap-4 md:grid-cols-4"
      >
        <input
          name="q"
          defaultValue={term}
          placeholder={LABELS.searchPlaceholder}
          className="rounded-lg border border-white/15 bg-black/10 px-3 py-2 text-white placeholder-white/60"
        />

        <div className="flex gap-2">
          <input
            name="min"
            defaultValue={minPrice}
            placeholder={LABELS.minPrice}
            inputMode="decimal"
            className="w-1/2 rounded-lg border border-white/15 bg-black/10 px-3 py-2 text-white placeholder-white/60"
          />
          <input
            name="max"
            defaultValue={maxPrice}
            placeholder={LABELS.maxPrice}
            inputMode="decimal"
            className="w-1/2 rounded-lg border border-white/15 bg-black/10 px-3 py-2 text-white placeholder-white/60"
          />
        </div>

        <select
          name="sort"
          defaultValue={sortParam || "created-desc"}
          className="rounded-lg border border-white/15 bg-black/10 px-3 py-2 text-white"
        >
          <option value="created-desc">Newest</option>
          <option value="created-asc">Oldest</option>
          <option value="price-asc">Price ↑</option>
          <option value="price-desc">Price ↓</option>
          <option value="title-asc">Title A–Z</option>
          <option value="title-desc">Title Z–A</option>
        </select>

        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 hover:bg-indigo-500 transition"
          >
            {LABELS.apply}
          </button>

          <a
            href="/products"
            className="rounded-lg border border-white/20 px-4 py-2 hover:bg-white/10 transition"
          >
            {LABELS.reset}
          </a>
        </div>

        {/* Heritage */}
        <fieldset className="md:col-span-2 border border-white/10 rounded-xl p-3">
          <legend className="text-sm opacity-70 px-1">{LABELS.heritage}</legend>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {HERITAGE_OPTIONS.map((h) => (
              <label key={h.value} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="heritage"
                  value={h.value}
                  defaultChecked={heritage.includes(h.value)}
                  className="accent-indigo-500"
                />
                <span>{h.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Category */}
        <fieldset className="md:col-span-2 border border-white/10 rounded-xl p-3">
          <legend className="text-sm opacity-70 px-1">{LABELS.category}</legend>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CATEGORY_OPTIONS.map((c) => (
              <label key={c} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="category"
                  value={c}
                  defaultChecked={category.includes(c)}
                  className="accent-indigo-500"
                />
                <span>{c}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </form>

      {/* ---------------- PRODUCT GRID ---------------- */}
      {products.length === 0 ? (
        <p className="opacity-75">{LABELS.noResults}</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((p: any) => {
            const img = p.images?.edges?.[0]?.node;
            const price = Number(p.priceRange.minVariantPrice.amount).toFixed(2);

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
                    <h2 className="font-semibold text-lg line-clamp-2 group-hover:text-indigo-400 transition">
                      {p.title}
                    </h2>

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
    </main>
  );
}


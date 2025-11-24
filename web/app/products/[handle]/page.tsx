// FILE: /web/app/products/[handle]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductByHandle, getProducts } from "@/lib/shopify";
import AddToCartButton from "@/components/AddToCartButton";

type ProductPageProps = {
  // In the app router, params is a Promise – we must await it.
  params: Promise<{ handle: string }>;
};

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

/** Basic title-case helper (for heritage from tags) */
function toTitleCase(value: string | null | undefined) {
  if (!value) return null;
  return value
    .split(/[\s_-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export default async function ProductPage(props: ProductPageProps) {
  const { handle } = await props.params;

  if (!handle) {
    notFound();
  }

  const product = await getProductByHandle(handle);

  if (!product) {
    notFound();
  }

  // ---- Images ----
  const images = Array.isArray(product.images?.edges)
    ? product.images.edges.map((e: any) => e.node)
    : [];

  const primaryImage = images[0] ?? null;

  // ---- Pricing ----
  const priceAmount = product.priceRange?.minVariantPrice?.amount ?? null;
  const currency = product.priceRange?.minVariantPrice?.currencyCode ?? "USD";

  // ---- Heritage & Category ----
  const heritageTag: string | undefined = product.tags?.find(
    (t: string) => t.toLowerCase().startsWith("heritage:")
  );
  const heritageRaw = heritageTag ? heritageTag.split(":")[1] ?? null : null;
  const heritageLabel = toTitleCase(heritageRaw ?? undefined);

  const categoryLabel = product.productType || null;
  const vendor = (product as any).vendor ?? null; // Only present if requested in GraphQL

  // ---- Related products (same category, excluding self) ----
  let related: any[] = [];
  try {
    if (categoryLabel) {
      const relatedProducts = await getProducts({
        first: 8,
        category: [categoryLabel],
      });
      related = relatedProducts
        .filter((p: any) => p.handle !== product.handle)
        .slice(0, 4);
    }
  } catch {
    // If this fails, we just skip related products
    related = [];
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-12 text-white">
      {/* Breadcrumbs */}
      <nav className="mb-6 text-sm text-white/60 flex items-center gap-2">
        <Link href="/" className="hover:text-white">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-white">
          Products
        </Link>
        <span>/</span>
        <span className="text-white">{product.title}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        {/* LEFT: Images */}
        <section>
          <div className="rounded-xl overflow-hidden bg-white/5 border border-white/10 mb-4">
            {primaryImage?.url ? (
              <img
                src={primaryImage.url}
                alt={primaryImage.altText ?? product.title}
                className="w-full h-[420px] object-cover"
              />
            ) : (
              <div className="h-[420px] flex items-center justify-center opacity-60">
                No image
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {images.slice(1).map((img: any) => (
                <div
                  key={img.url}
                  className="w-20 h-20 rounded-lg overflow-hidden bg-white/5 border border-white/10 flex-shrink-0"
                >
                  <img
                    src={img.url}
                    alt={img.altText ?? product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* RIGHT: Info */}
        <section className="flex flex-col gap-6">
          {/* Title + vendor */}
          <div>
            <h1 className="text-4xl font-bold mb-2">{product.title}</h1>
            {vendor && (
              <p className="text-sm text-white/70">By {vendor}</p>
            )}
          </div>

          {/* Price */}
          <div className="text-2xl font-semibold">
            {formatMoney(priceAmount, currency)}{" "}
            <span className="text-sm text-white/60 ml-1">{currency}</span>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 text-xs">
            {heritageLabel && (
              <span className="px-3 py-1 rounded-full bg-emerald-600/20 border border-emerald-500/40">
                Heritage: {heritageLabel}
              </span>
            )}
            {categoryLabel && (
              <span className="px-3 py-1 rounded-full bg-indigo-600/20 border border-indigo-500/40">
                Category: {categoryLabel}
              </span>
            )}
          </div>

          {/* Description */}
          {product.descriptionHtml && (
            <div
              className="prose prose-invert prose-sm max-w-none opacity-90 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          )}

          {/* Add to cart */}
          <div className="mt-2">
            {product.variants?.edges?.[0]?.node?.id ? (
              <AddToCartButton
                variantId={product.variants.edges[0].node.id}
                className="w-full py-3"
              >
                Add to Cart
              </AddToCartButton>
            ) : (
              <p className="text-sm text-red-400">
                No purchasable variant found for this product.
              </p>
            )}
          </div>
        </section>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-semibold mb-6">You may also like</h2>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
            {related.map((p: any) => {
              const img = p.images?.edges?.[0]?.node ?? p.featuredImage ?? null;
              const relatedPrice =
                p.priceRange?.minVariantPrice?.amount ?? null;
              const relatedCurrency =
                p.priceRange?.minVariantPrice?.currencyCode ?? "USD";

              return (
                <Link
                  key={p.id}
                  href={`/products/${p.handle}`}
                  className="group rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:bg-white/10 transition p-3 flex flex-col"
                >
                  <div className="w-full h-40 mb-3 rounded-lg overflow-hidden bg-white/5">
                    {img?.url ? (
                      <img
                        src={img.url}
                        alt={img.altText ?? p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-60 text-xs">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between gap-2">
                    <p className="font-semibold text-sm line-clamp-2">
                      {p.title}
                    </p>
                    <p className="text-xs text-white/70">
                      {formatMoney(relatedPrice, relatedCurrency)}{" "}
                      <span className="ml-1">{relatedCurrency}</span>
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}

// FILE: /web/app/products/[handle]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductByHandle, getProducts } from "@/lib/shopify";
import AddToCartButton from "@/components/AddToCartButton";

// ✅ In your setup, params is a Promise and must be awaited
type ProductPageProps = {
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

/** ⭐ Simple star rating display (no interactivity, safe on server) */
function StarRating({ value, count }: { value: number; count: number }) {
  const fullStars = Math.floor(value);
  const hasHalf = value - fullStars >= 0.5;
  const totalStars = 5;

  return (
    <div className="flex items-center gap-2 text-xs text-white/70">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: totalStars }).map((_, i) => {
          const isFull = i < fullStars;
          const isHalf = !isFull && hasHalf && i === fullStars;

          return (
            <svg
              key={i}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              className="w-4 h-4"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id={`star-${i}`} x1="0%" x2="100%">
                  <stop
                    offset={isFull ? "100%" : isHalf ? "50%" : "0%"}
                    stopColor="#facc15"
                  />
                  <stop
                    offset={isFull ? "100%" : isHalf ? "50%" : "0%"}
                    stopColor="#4b5563"
                    stopOpacity={isFull || isHalf ? 0 : 1}
                  />
                </linearGradient>
              </defs>
              <path
                fill={isFull || isHalf ? "url(#star-" + i + ")" : "#4b5563"}
                d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.52L10 14.9l-4.94 2.83.94-5.52-4-3.9 5.53-.8L10 1.5z"
              />
            </svg>
          );
        })}
      </div>
      <span>
        {value.toFixed(1)} · {count} review{count === 1 ? "" : "s"}
      </span>
    </div>
  );
}

/**
 * 🔍 SEO + Social metadata for each product
 * Uses the same `params: Promise` pattern your route has.
 */
export async function generateMetadata(
  props: ProductPageProps
): Promise<Metadata> {
  try {
    const { handle } = await props.params;

    if (!handle) {
      return {
        title: "Product not found – Our Arab Heritage",
        description:
          "Discover handcrafted products from Palestinian and Arab artisans.",
      };
    }

    const product = await getProductByHandle(handle);

    if (!product) {
      return {
        title: "Product not found – Our Arab Heritage",
        description:
          "Discover handcrafted products from Palestinian and Arab artisans.",
      };
    }

    const baseTitle: string = product.title ?? "Product";
    const title = `${baseTitle} – Our Arab Heritage`;

    // Strip HTML for clean description text
    const rawHtml: string = product.descriptionHtml ?? "";
    const plainText = rawHtml
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const description =
      plainText.slice(0, 150) ||
      "Discover handcrafted products from Palestinian and Arab artisans.";

    const imageUrl: string | undefined =
      product?.featuredImage?.url ??
      product?.images?.edges?.[0]?.node?.url ??
      undefined;

    return {
      title,
      description,
      openGraph: {
        // 👇 change: use a valid type (or omit type entirely)
        type: "website",
        title,
        description,
        url: `/products/${handle}`,
        images: imageUrl
          ? [
              {
                url: imageUrl,
                width: 1200,
                height: 630,
                alt: product?.featuredImage?.altText ?? baseTitle,
              },
            ]
          : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: imageUrl ? [imageUrl] : undefined,
      },
    };
  } catch {
    // Fallback if anything blows up (params or Shopify)
    return {
      title: "Our Arab Heritage – Marketplace",
      description:
        "Discover handcrafted products from Palestinian and Arab artisans.",
    };
  }
}

export default async function ProductPage(props: ProductPageProps) {
  // ✅ Unwrap params (this is what Next wants in your setup)
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

  const primaryImage = images[0] ?? product.featuredImage ?? null;

  // ---- Pricing ----
  const priceAmount = product.priceRange?.minVariantPrice?.amount ?? null;
  const currency = product.priceRange?.minVariantPrice?.currencyCode ?? "USD";

  // ---- Heritage & Category ----
  const heritageTag: string | undefined = product.tags?.find(
    (t: string) =>
      typeof t === "string" && t.toLowerCase().startsWith("heritage:")
  );
  const heritageRaw = heritageTag ? heritageTag.split(":")[1] ?? null : null;
  const heritageLabel = toTitleCase(heritageRaw ?? undefined);

  const categoryLabel = product.productType || null;
  const vendor = product.vendor ?? null;

  // ---- Availability (from first variant, if present) ----
  const firstVariant = product.variants?.edges?.[0]?.node ?? null;
  const isAvailable = firstVariant?.availableForSale ?? false;

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
    related = [];
  }

  // ---- Mock reviews (static for now – later we hook a real DB) ----
  const reviews = [
    {
      id: 1,
      author: "Lina A.",
      location: "Ramallah, Palestine",
      rating: 4.9,
      title: "Feels like something from my teta’s home",
      body:
        "The craftsmanship is beautiful and the details feel authentically Levantine. It genuinely feels like something that would be in my grandmother’s living room.",
      date: "2 weeks ago",
    },
    {
      id: 2,
      author: "Omar H.",
      location: "Dearborn, USA",
      rating: 4.8,
      title: "Gorgeous piece, fast delivery",
      body:
        "Packaging was careful and secure, and the piece looks even better in person than in the photos. Will definitely order again.",
      date: "1 month ago",
    },
    {
      id: 3,
      author: "Sarah K.",
      location: "London, UK",
      rating: 4.7,
      title: "Brings the region into my home",
      body:
        "I love having something that actually represents Arab culture properly. The textures and colors are stunning.",
      date: "2 months ago",
    },
  ];

  const averageRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

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
        <span className="text-white line-clamp-1">{product.title}</span>
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
            {vendor && <p className="text-sm text-white/70">By {vendor}</p>}
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
            <span
              className={`px-3 py-1 rounded-full border ${
                isAvailable
                  ? "bg-green-600/15 border-green-400/60 text-green-200"
                  : "bg-red-600/15 border-red-400/60 text-red-200"
              }`}
            >
              {isAvailable ? "In stock" : "Sold out"}
            </span>
          </div>

          {/* Price + Add to Cart row */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-3xl font-semibold">
              {formatMoney(priceAmount, currency)}{" "}
              <span className="text-sm text-white/60 ml-1">{currency}</span>
            </div>

            <div className="w-full sm:w-auto sm:min-w-[200px]">
              {firstVariant?.id ? (
                <AddToCartButton
                  variantId={firstVariant.id}
                  className="w-full py-3"
                  disabled={!isAvailable}
                >
                  {isAvailable ? "Add to Cart" : "Unavailable"}
                </AddToCartButton>
              ) : (
                <p className="text-sm text-red-400">
                  No purchasable variant found for this product.
                </p>
              )}
            </div>
          </div>

          {/* ⭐ Rating summary */}
          <div className="mt-1">
            <StarRating value={averageRating} count={reviews.length} />
          </div>

          {/* Description */}
          {product.descriptionHtml && (
            <div
              className="prose prose-invert prose-sm max-w-none opacity-90 leading-relaxed mt-4"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          )}
        </section>
      </div>

      {/* 💬 Customer Reviews */}
      <section className="mt-16 border-t border-white/10 pt-10">
        <div className="flex items-center justify-between mb-4 gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Customer Reviews</h2>
            <p className="text-xs text-white/60 mt-1">
              Real stories from the diaspora and across the Arab world
              (sample data for now).
            </p>
          </div>
          <div className="hidden sm:block">
            <StarRating value={averageRating} count={reviews.length} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{review.author}</p>
                  <p className="text-[11px] text-white/60">
                    {review.location}
                  </p>
                </div>
                <span className="text-xs text-white/70">
                  {review.date}
                </span>
              </div>

              <div className="mt-1">
                <StarRating value={review.rating} count={1} />
              </div>

              <h3 className="text-sm font-medium mt-1">{review.title}</h3>
              <p className="text-xs text-white/70 leading-relaxed">
                {review.body}
              </p>
            </article>
          ))}
        </div>

        <p className="mt-4 text-[11px] text-white/40">
          In a later phase, we’ll connect this to real customer reviews stored
          in your own database, with moderation tools for you as the owner.
        </p>
      </section>

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

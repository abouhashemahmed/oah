// FILE: /web/app/products/[handle]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductByHandle } from "@/lib/shopify";
import AddToCartButton from "@/components/AddToCartButton";

const LABELS = {
  back: "← Back to products",
  heritage: "Heritage",
  buyOnShopify: "Buy on Shopify",
  noImage: "No image",
  noProduct: "Product not found.",
};

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: { handle: string };
}) {
  const { handle } = params;
  const product = await getProductByHandle(handle);

  if (!product) {
    return (
      <main className="max-w-6xl mx-auto p-6">
        <p className="text-lg">{LABELS.noProduct}</p>
        <Link href="/products" className="text-indigo-500 hover:underline">
          {LABELS.back}
        </Link>
      </main>
    );
  }

  const heritageTags =
    product.tags?.filter((t: string) => t.startsWith("heritage:")) || [];
  const heritageNames = heritageTags.map((t: string) => t.split(":")[1]);

  const price =
    Number(product.priceRange.minVariantPrice.amount).toFixed(2) +
    " " +
    product.priceRange.minVariantPrice.currencyCode;

  const firstImage = product.images?.edges?.[0]?.node;
  const variants = product.variants?.edges?.map((edge: any) => edge.node) || [];
  const defaultVariant = variants[0];

  return (
    <main className="max-w-6xl mx-auto p-6">
      <Link href="/products" className="text-sm text-indigo-500 hover:underline">
        {LABELS.back}
      </Link>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-2xl overflow-hidden bg-black/10">
          {firstImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={firstImage.url}
              alt={firstImage.altText ?? product.title}
              className="w-full h-auto object-cover"
            />
          ) : (
            <div className="aspect-square flex items-center justify-center opacity-60">
              {LABELS.noImage}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold">{product.title}</h1>
          <p className="mt-2 text-lg opacity-80">{price}</p>

          {/* Heritage chips */}
          {heritageNames.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {heritageNames.map((h) => (
                <span
                  key={h}
                  className="rounded-full bg-indigo-100 text-indigo-700 px-3 py-1 text-xs font-medium"
                >
                  {LABELS.heritage}: {h}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          <div
            className="prose prose-invert mt-6 max-w-none"
            dangerouslySetInnerHTML={{
              __html: product.descriptionHtml || "",
            }}
          />

          {/* Variant selector */}
          {variants.length > 1 && (
            <VariantSelector variants={variants} />
          )}

          {/* Add to cart / external link */}
          <div className="mt-8 flex gap-3 items-center">
            {defaultVariant && (
              <AddToCartButton
                variantId={defaultVariant.id}
                quantity={1}
                redirectToCartOnSuccess={false}
              >
                Add to cart
              </AddToCartButton>
            )}
            <a
              href={`https://${process.env.SHOPIFY_STORE_DOMAIN}/products/${product.handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg border border-white/20 px-5 py-2.5 hover:bg-white/10"
            >
              {LABELS.buyOnShopify}
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

/** Client component for variant selection */
function VariantSelector({ variants }: { variants: any[] }) {
  "use client";
  const [selectedId, setSelectedId] = React.useState<string>(variants[0].id);
  return (
    <div className="mt-6 space-y-2">
      <label className="text-sm font-medium">Variant</label>
      <select
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        className="mt-1 rounded-lg border border-gray-300 bg-black/10 px-3 py-2 text-white"
      >
        {variants.map((v) => (
          <option key={v.id} value={v.id}>
            {v.title}
          </option>
        ))}
      </select>
      <AddToCartButton
        variantId={selectedId}
        quantity={1}
        redirectToCartOnSuccess={false}
      >
        Add to cart
      </AddToCartButton>
    </div>
  );
}

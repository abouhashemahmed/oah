// FILE: /web/app/products/[handle]/page.tsx
import { getProductByHandle } from "@/lib/shopify";
import AddToCartButton from "@/components/AddToCartButton";

type ProductPageProps = {
  // ⬅️ params is a Promise in Next.js 15/16
  params: Promise<{ handle: string }>;
};

export default async function ProductPage(props: ProductPageProps) {
  // ⬅️ unwrap the Promise
  const { handle } = await props.params;

  if (!handle || typeof handle !== "string") {
    return (
      <main className="max-w-3xl mx-auto px-6 py-12 text-white">
        <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
        <p className="opacity-70">Invalid product handle.</p>
      </main>
    );
  }

  const product = await getProductByHandle(handle);

  if (!product) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-12 text-white">
        <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
        <p className="opacity-70">This product does not exist in Shopify.</p>
      </main>
    );
  }

  const image = product.images?.edges?.[0]?.node;
  const variant = product.variants?.edges?.[0]?.node;
  const price = product.priceRange?.minVariantPrice?.amount ?? null;
  const currency =
    product.priceRange?.minVariantPrice?.currencyCode ?? "USD";

  return (
    <main className="max-w-5xl mx-auto px-6 py-12 text-white">
      <div className="grid md:grid-cols-2 gap-12">
        {/* IMAGE */}
        <div className="rounded-xl overflow-hidden bg-white/5 border border-white/10">
          {image?.url ? (
            <img
              src={image.url}
              alt={image.altText ?? product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="h-96 flex items-center justify-center opacity-60">
              No image
            </div>
          )}
        </div>

        {/* INFO */}
        <div>
          <h1 className="text-4xl font-bold mb-4">{product.title}</h1>

          <p className="text-2xl font-semibold mb-6">
            {price ? `$${price} ${currency}` : "—"}
          </p>

          {product.descriptionHtml && (
            <div
              className="opacity-80 leading-relaxed mb-8 prose prose-invert"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          )}

          {variant?.id && (
            <AddToCartButton variantId={variant.id} className="w-full py-3">
              Add to Cart
            </AddToCartButton>
          )}
        </div>
      </div>
    </main>
  );
}

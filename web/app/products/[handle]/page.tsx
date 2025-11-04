import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/AddToCartButton";

const SHOP = process.env.SHOPIFY_STORE_DOMAIN!;
const TOKEN =
  process.env.SHOPIFY_STOREFRONT_API_TOKEN ||
  process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

const API_URL = `https://${SHOP}/api/2024-10/graphql.json`;

async function storefrontFetch<T>(query: string, variables?: Record<string, any>) {
  const res = await fetch(API_URL, {
    method: "POST",
  headers: {
  "Content-Type": "application/json",
  "X-Shopify-Storefront-Access-Token": TOKEN as string,
},

    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify Storefront ${res.status}: ${text}`);
  }
  return (await res.json()) as T;
}

type GQLImage = { altText: string | null; url: string };

type ProductT = {
  id: string;
  title: string;
  handle: string;
  descriptionHtml: string;
  images: { edges: { node: GQLImage }[] };
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  variants: { edges: { node: { id: string; title: string } }[] };
};

type Result = { data: { product: ProductT | null } };

const QUERY = /* GraphQL */ `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      descriptionHtml
      images(first: 8) {
        edges { node { altText url } }
      }
      priceRange {
        minVariantPrice { amount currencyCode }
      }
      variants(first: 10) {
        edges { node { id title } }
      }
    }
  }
`;

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;

  let product: ProductT | null = null;
  try {
    const res = await storefrontFetch<Result>(QUERY, { handle });
    product = res.data?.product ?? null;
  } catch (e) {
    console.error("Product fetch error:", e);
  }
  if (!product) return notFound();

  const mainImg = product.images?.edges?.[0]?.node;
  const price = `${Number(product.priceRange.minVariantPrice.amount).toFixed(2)} ${
    product.priceRange.minVariantPrice.currencyCode
  }`;
  const onlineUrl = `https://${SHOP}/products/${product.handle}`;

  const firstVariant = product.variants.edges[0]?.node;
  const variantId = firstVariant?.id;

  return (
    <main className="max-w-6xl mx-auto p-6">
      <Link href="/products" className="text-sm text-indigo-400 hover:underline">
        &larr; Back to products
      </Link>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-2xl overflow-hidden bg-black/10">
          {mainImg ? (
            <img src={mainImg.url} alt={mainImg.altText ?? product.title} className="w-full h-auto object-cover" />
          ) : (
            <div className="aspect-square flex items-center justify-center opacity-60">No image</div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold">{product.title}</h1>
          <p className="mt-2 text-lg opacity-80">{price}</p>

          <div
            className="prose prose-invert mt-6 max-w-none"
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml || "" }}
          />

          <div className="mt-8 flex gap-3 items-center">
            {variantId && <AddToCartButton variantId={variantId} label="Add to cart" />}
            <a
              href={onlineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg border border-white/20 px-5 py-2.5 hover:bg-white/10"
            >
              Buy on Shopify
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

// FILE: /web/app/api/debug/route.ts
import { NextRequest, NextResponse } from "next/server";

const SF_URL = `https://${process.env.SHOPIFY_STORE_DOMAIN}/api/2024-10/graphql.json`;
const SF_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

const VARIANT_BY_ID = /* GraphQL */ `
  query VariantById($id: ID!) {
    node(id: $id) {
      __typename
      ... on ProductVariant {
        id
        title
        availableForSale
        requiresShipping
        selectedOptions { name value }
        product {
          id
          title
          handle
          availableForSale
          vendor
        }
      }
    }
  }
`;

const VARIANTS_BY_HANDLE = /* GraphQL */ `
  query VariantsByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      availableForSale
      variants(first: 20) {
        edges {
          node {
            id
            title
            availableForSale
            requiresShipping
            selectedOptions { name value }
          }
        }
      }
    }
  }
`;

async function sfFetch(query: string, variables: any) {
  const res = await fetch(SF_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SF_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  const json = await res.json();
  return json;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { variantId, handle } = body || {};

    if (variantId) {
      const gid =
        typeof variantId === "string" && variantId.startsWith("gid://")
          ? variantId
          : `gid://shopify/ProductVariant/${variantId}`;

      const data = await sfFetch(VARIANT_BY_ID, { id: gid });
      return NextResponse.json(data);
    }

    if (handle) {
      const data = await sfFetch(VARIANTS_BY_HANDLE, { handle });
      return NextResponse.json(data);
    }

    return NextResponse.json(
      { error: "Provide either { variantId } or { handle }" },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "debug error", detail: String(err?.message || err) },
      { status: 500 }
    );
  }
}

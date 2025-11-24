// FILE: /web/lib/shopify.ts

/**
 * Centralized Shopify Storefront API helpers.
 */

const SHOP_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!;
const TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!;
const API_VERSION = "2024-10"; // adjust as needed

const STOREFRONT_URL = `https://${SHOP_DOMAIN}/api/${API_VERSION}/graphql.json`;

/** Generic fetch wrapper */
async function storefrontFetch<T>(
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  const res = await fetch(STOREFRONT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Storefront ${res.status}: ${text}`);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(JSON.stringify(json.errors));
  }
  return json.data as T;
}

/** Build product search query string */
function buildProductQuery(filters: {
  q?: string;
  heritage?: string[];
  category?: string[];
  minPrice?: number;
  maxPrice?: number;
}) {
  const clauses: string[] = [];

  if (filters.q) {
    clauses.push(`title:${JSON.stringify(filters.q)}`);
  }
  if (filters.minPrice != null) {
    clauses.push(`price:>=${filters.minPrice}`);
  }
  if (filters.maxPrice != null) {
    clauses.push(`price:<=${filters.maxPrice}`);
  }
  if (filters.heritage?.length) {
    const orGroup = filters.heritage
      .map((h) => `tag:${JSON.stringify(`heritage:${h.toLowerCase()}`)}`)
      .join(" OR ");
    clauses.push(`(${orGroup})`);
  }
  if (filters.category?.length) {
    const orGroup = filters.category
      .map((c) => `product_type:${JSON.stringify(c)}`)
      .join(" OR ");
    clauses.push(`(${orGroup})`);
  }

  return clauses.length ? clauses.join(" AND ") : undefined;
}

/** Fetch product list */
export async function getProducts(filters: {
  q?: string;
  heritage?: string[];
  category?: string[];
  minPrice?: number;
  maxPrice?: number;
  sort?: "CREATED_AT" | "PRICE" | "TITLE";
  reverse?: boolean;
  first?: number;
}) {
  const queryString = buildProductQuery(filters);
  const QUERY = /* GraphQL */ `
    query Products(
      $first: Int!
      $query: String
      $sortKey: ProductSortKeys!
      $reverse: Boolean!
    ) {
      products(first: $first, query: $query, sortKey: $sortKey, reverse: $reverse) {
        edges {
          node {
            id
            title
            handle
            productType
            tags
            images(first: 1) {
              edges {
                node {
                  altText
                  url
                }
              }
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  `;
  const data = await storefrontFetch<{
    products: { edges: { node: any }[] };
  }>(QUERY, {
    first: filters.first ?? 24,
    query: queryString,
    sortKey: filters.sort ?? "CREATED_AT",
    reverse: filters.reverse ?? true,
  });
  return data.products.edges.map((e) => e.node);
}
/** Fetch product details by handle */
export async function getProductByHandle(handle: string) {
  const QUERY = /* GraphQL */ `
    query ProductByHandle($handle: String!) {
      product(handle: $handle) {
        id
        title
        descriptionHtml
        handle
        vendor
        tags
        productType
        images(first: 8) {
          edges {
            node {
              altText
              url
            }
          }
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        variants(first: 10) {
          edges {
            node {
              id
              title
            }
          }
        }
      }
    }
  `;
  const data = await storefrontFetch<{ product: any | null }>(QUERY, { handle });
  return data.product;
}


/** Fetch cart */
export async function getCart(cartId: string) {
  const QUERY = /* GraphQL */ `
    query GetCart($cartId: ID!) {
      cart(id: $cartId) {
        id
        checkoutUrl
        totalQuantity
        cost {
          subtotalAmount { amount currencyCode }
          totalAmount { amount currencyCode }
        }
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price { amount currencyCode }
                  product {
                    title
                    featuredImage {
                      url
                      altText
                    }
                  }
                }
              }
              cost {
                totalAmount { amount currencyCode }
              }
            }
          }
        }
      }
    }
  `;
  const data = await storefrontFetch<{ cart: any }>(QUERY, { cartId });
  return data.cart;
}

/** Create cart with lines */
export async function createCart(
  lines: { merchandiseId: string; quantity: number }[]
) {
  const MUTATION = /* GraphQL */ `
    mutation CartCreate($lines: [CartLineInput!]) {
      cartCreate(input: { lines: $lines }) {
        cart {
          id
          checkoutUrl
          totalQuantity
        }
        userErrors {
          message
          field
        }
      }
    }
  `;
  return storefrontFetch<{ cartCreate: any }>(MUTATION, { lines });
}

/** Add lines to existing cart */
export async function addToCart(cartId: string, lines: any[]) {
  const MUTATION = /* GraphQL */ `
    mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          id
          totalQuantity
          checkoutUrl
        }
        userErrors {
          message
          field
        }
      }
    }
  `;
  return storefrontFetch<{ cartLinesAdd: any }>(MUTATION, { cartId, lines });
}

/** Update cart lines */
export async function updateCartLines(cartId: string, lines: any[]) {
  const MUTATION = /* GraphQL */ `
    mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
          id
          totalQuantity
        }
        userErrors {
          message
          field
        }
      }
    }
  `;
  return storefrontFetch<{ cartLinesUpdate: any }>(MUTATION, { cartId, lines });
}

/** Remove cart lines */
export async function removeCartLines(cartId: string, lineIds: string[]) {
  const MUTATION = /* GraphQL */ `
    mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          id
          totalQuantity
        }
        userErrors {
          message
          field
        }
      }
    }
  `;
  return storefrontFetch<{ cartLinesRemove: any }>(MUTATION, { cartId, lineIds });
}

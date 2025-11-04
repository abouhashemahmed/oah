// app/page.tsx
import { shopify } from "@/lib/shopify";

type ProductsResult = {
  data: {
    products: {
      edges: { node: { id: string; title: string; handle: string } }[];
    };
  };
};

const QUERY = /* GraphQL */ `
  query ProductsFirst12 {
    products(first: 12, sortKey: CREATED_AT, reverse: true) {
      edges {
        node {
          id
          title
          handle
        }
      }
    }
  }
`;

export default async function HomePage() {
  let items: { id: string; title: string; handle: string }[] = [];

  try {
    const result = await shopify<ProductsResult>(QUERY);
    items = result.data.products.edges.map((e) => e.node);
  } catch (err) {
    console.error("Shopify fetch failed:", err);
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Our Arab Heritage — Products</h1>
      {items.length === 0 ? (
        <p>No products yet (or connection not configured). Try adding a test product in Shopify → Products.</p>
      ) : (
        <ul className="list-disc pl-6 space-y-2">
          {items.map((p) => (
            <li key={p.id}>
              {p.title} <span className="text-gray-500">({p.handle})</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}


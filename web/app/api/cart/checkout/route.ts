import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const SHOP_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!;
const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

const CART_COOKIE = "cartId";

export async function POST() {
  const cookieStore = cookies();
  const cartId = cookieStore.get(CART_COOKIE)?.value;

  if (!cartId) {
    return NextResponse.json(
      { error: "No cart found" },
      { status: 400 }
    );
  }

  const query = `
    mutation CartCheckoutUrl($cartId: ID!) {
      cart(id: $cartId) {
        checkoutUrl
      }
    }
  `;

  const result = await fetch(
    `https://${SHOP_DOMAIN}/api/2024-01/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
      },
      body: JSON.stringify({
        query,
        variables: { cartId },
      }),
    }
  ).then((res) => res.json());

  const checkoutUrl =
    result?.data?.cart?.checkoutUrl ||
    result?.data?.cartCreate?.cart?.checkoutUrl;

  if (!checkoutUrl) {
    return NextResponse.json(
      { error: "No checkout URL returned" },
      { status: 500 }
    );
  }

  return NextResponse.json({ checkoutUrl });
}

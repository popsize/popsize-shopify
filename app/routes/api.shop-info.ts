import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { admin } = await authenticate.admin(request);

    const shopRes = await admin.graphql(`{ shop { name } }`);
    const shopJson = await shopRes.json();

    if (shopJson.errors) {
      return json({ error: "GraphQL errors", details: shopJson.errors }, { status: 500 });
    }

    const shopName = shopJson.data?.shop?.name;

    if (!shopName) {
      return json({ error: "Failed to fetch shop name", response: shopJson }, { status: 500 });
    }

    return json({ shop: { name: shopName } });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return json({ error: "Authentication or server error", details: errorMessage }, { status: 500 });
  }
};
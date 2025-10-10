// ========================================
// Author: Nicolas Micaux
// Copyright (c) 2025 Popsize. All rights reserved.
// ========================================

// api/set-widget-style.ts
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: { request: Request }) => {
  const { admin } = await authenticate.admin(request);
  const shop = new URL(request.url).searchParams.get("shop");

  if (!shop) {
    return json({ success: false, error: "Missing shop parameter" }, { status: 400 });
  }

  try {
    const shopRes = await admin.graphql(`{ shop { id } }`);
    const shopJson = await shopRes.json();
    const shopId = shopJson.data.shop.id;

    const res = await admin.graphql(`
      mutation {
        metafieldsSet(metafields: [
          {
            namespace: "popsize",
            key: "widget_style",
            type: "single_line_text_field",
            value: "true",
            ownerId: "${shopId}"
          }
        ]) {
          metafields {
            id
            key
            value
          }
          userErrors {
            field
            message
          }
        }
      }
    `);

    const result = await res.json();
    return json({ success: true, data: result });
  } catch (error) {
    console.error("Failed to set widget_style metafield", error);
    return json({ success: false }, { status: 500 });
  }
};

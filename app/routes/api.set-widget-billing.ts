// This code is licensed under the GNU Affero General Public License.
// Author: Nicolas Micaux

import { json, type ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) return json({ error: "Missing shop" }, { status: 400 });

  const { admin } = await authenticate.admin(request);

  const shopRes = await admin.graphql(`{ shop { id } }`);
  const shopJson = await shopRes.json();
  const shopId = shopJson.data.shop.id;

  await admin.graphql(`
    mutation {
      metafieldsSet(metafields: [{
        namespace: "popsize",
        key: "billing",
        type: "single_line_text_field",
        value: "true",
        ownerId: "${shopId}"
      }]) {
        userErrors {
          field
          message
        }
      }
    }
  `);

  return json({ success: true } as const);
};

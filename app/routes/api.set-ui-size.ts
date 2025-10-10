// This code is licensed under the GNU Affero General Public License.
// Author: Nicolas Micaux

import { json } from "@remix-run/node";
import { authenticate } from "app/shopify.server";

export const action = async ({ request }: { request: Request }) => {
    const url = new URL(request.url);
    const shop = url.searchParams.get("shop");
    const ui_size = url.searchParams.get("ui_size");

    if (!shop || !ui_size) {
        return json({ success: false, error: "Missing shop or ui_size" }, { status: 400 });
    }

    const { admin } = await authenticate.admin(request);

    // Fetch shop ID
    const shopIdResp = await admin.graphql(`
        {
            shop {
                id
            }
        }
    `);

    const shopIdJson = await shopIdResp.json();
    const shopId = shopIdJson?.data?.shop?.id;

    if (!shopId) {
        return json({ success: false, error: "Shop ID not found" }, { status: 500 });
    }

    // Set ui_size metafield
    const mutation = `
        mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
            metafieldsSet(metafields: $metafields) {
                metafields {
                    id
                    key
                    namespace
                    value
                }
                userErrors {
                    field
                    message
                }
            }
        }
    `;
    const variables = {
        metafields: [
            {
                namespace: "popsize",
                key: "ui_size",
                type: "single_line_text_field",
                value: ui_size,
                ownerId: shopId,
            },
        ],
    };

    const resp = await admin.graphql(mutation, { variables });
    const result = await resp.json();

    if (result?.data?.metafieldsSet?.userErrors?.length) {
        return json({ success: false, error: result.data.metafieldsSet.userErrors }, { status: 500 });
    }

    return json({ success: true });
};

export const loader = () => {
    return json({ success: false, error: "Use POST" }, { status: 405 });
};

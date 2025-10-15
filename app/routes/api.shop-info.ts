// This code is licensed under the GNU Affero General Public License.
// Author: Nicolas Micaux

import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { debug, log, info } from '../utils/logger';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { admin } = await authenticate.admin(request);

    const shopRes = await admin.graphql(`{
      shop {
        navigationSettings {
          id
          url
        }
      }
    }`);
    const shopJson = await shopRes.json() as any;

    if (shopJson.errors) {
      return json({ error: "GraphQL errors", details: shopJson.errors }, { status: 500 });
    }

    const shopData = shopJson.data?.shop;

    if (!shopData) {
      return json({ error: "Failed to fetch shop data", response: shopJson }, { status: 500 });
    }

    // Extract admin base URL from navigationSettings
    const generalSetting = shopData.navigationSettings?.find((setting: any) => setting.id === "general");
    const adminBaseUrl = generalSetting?.url?.match(/^(https:\/\/[^\/]+\/admin\/)/)?.[1];

    if (!adminBaseUrl) {
      return json({ error: "Failed to extract admin base URL from navigation settings" }, { status: 500 });
    }

    // Log shop information for debugging
    log("Shop Navigation Settings:", JSON.stringify(shopData.navigationSettings, null, 2));
    log("Extracted Admin Base URL:", adminBaseUrl);

    return json({ 
      shop: shopData,
      adminBaseUrl: adminBaseUrl
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return json({ error: "Authentication or server error", details: errorMessage }, { status: 500 });
  }
};
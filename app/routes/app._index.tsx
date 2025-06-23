import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { TitleBar } from "@shopify/app-bridge-react";
import {
  BlockStack,
  Box,
  Card,
  Layout,
  Page,
  Text
} from "@shopify/polaris";
import React from "react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  // Fetch the partner_id metafield and shop id from the shop
  const response = await admin.graphql(`
    {
      shop {
        id
        metafield(namespace: "popsize", key: "partner_id") {
          value
        }
      }
    }
  `);

  const json = await response.json();
  const partnerId = json.data.shop.metafield?.value || "";
  const shopId = json.data.shop.id;

  return { partnerId, shopId };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const partnerId = formData.get("partner_id");
  const shopId = formData.get("shop_id"); // Get shopId from the form

  await admin.graphql(
    `
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
    `,
    {
      variables: {
        metafields: [
          {
            namespace: "popsize",
            key: "partner_id",
            type: "single_line_text_field",
            value: partnerId,
            ownerId: shopId, // Use the correct shop GID here
          },
        ],
      },
    }
  );

  return null;
};


export default function Index() {
  const { partnerId, shopId } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [showSaved, setShowSaved] = React.useState(false);

  // Detect successful submit  (IS THAT WORKING?)
  React.useEffect(() => {
    if (fetcher.formData) {
      setShowSaved(true);
      // Optionally hide the message after a delay:
      const timeout = setTimeout(() => setShowSaved(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [fetcher.state, fetcher.formData]);

  return (
    <Page>
      <TitleBar title="Popsize Sizing Widget" />
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Popsize Sizing Widget – provide smart size recommendations and reduce returns.
              </Text>
              {!partnerId && (
                <Box background="bg-surface-warning" padding="400">
                  Please configure your Popsize account.{" "}
                  <a href="https://partners.popsize.ai" target="_blank" rel="noopener noreferrer">
                    Click here
                  </a>
                </Box>
              )}
              {/* 
              <fetcher.Form method="post">
                <input type="hidden" name="shop_id" value={shopId} />
                <label htmlFor="PARTNER_ID">Partner ID:</label>
                <input
                  type="text"
                  name="partner_id"
                  id="PARTNER_ID"
                  defaultValue={partnerId}
                  required
                  style={{ marginRight: 8 }}
                />
                <Button submit>
                  Save
                </Button>
              </fetcher.Form>
              {showSaved && (
                <Box padding="200">
                  Saved!
                </Box>
              )}
               */}
              <Box padding="400" background="bg-surface-secondary">
                <Text as="h3" variant="headingSm" fontWeight="bold">
                  How to enable the widget on your product pages?
                </Text>
                <ol style={{ marginTop: 12, marginBottom: 12, paddingLeft: 24 }}>
                  <li>Go to your Shopify admin → Online Store → Themes.</li>
                  <li>Click <b>Customize</b> on your live theme.</li>
                  <li>In the theme editor, use the dropdown at the top to select <b>Products</b> &gt; <b>Default product</b>.</li>
                  <li>
                    <b>To inject the widget in every product page:</b>
                    <ul>
                      <li>In the left panel, click <b>Add block</b> in <b>Header / Apps</b>.</li>
                      <li>Select <b>Popsize Widget</b> from the list.</li>
                    </ul>
                  </li>
                  <li>
                    <b>To place the widget at a specific spot on the product page:</b>
                    <ul>
                      <li>In the left panel, click <b>Add block</b> where you want the widget to appear.</li>
                      <li>Select <b>Popsize Placement</b>.</li>
                      <li>You can move it to position as desired.</li>
                    </ul>
                  </li>
                  <li>Click <b>Save</b> to apply changes.</li>
                </ol>
                <Text as="p" variant="bodySm">
                  <b>Tip:</b> Use the app embed for global injection (head/footer), or the placement block for precise placement on your product pages.
                </Text>
              </Box>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
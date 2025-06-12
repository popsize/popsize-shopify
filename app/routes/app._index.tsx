import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { TitleBar } from "@shopify/app-bridge-react";
import {
  BlockStack,
  Box,
  Button,
  Card,
  Layout,
  Page,
  Text
} from "@shopify/polaris";
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

  // Show "Saved!" if the form was just submitted and succeeded
  const showSaved =
    fetcher.state === "idle" &&
    fetcher.formData != null;

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
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
// app/routes/app.billing.tsx
import { Page, Layout, LegacyCard, Text } from "@shopify/polaris";
import { useTranslation } from "react-i18next";
import { useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: any) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(`
    {
      shop {
        myshopifyDomain
      }
    }
  `);

  const json = await response.json();
  const storeHandle = json.data.shop.myshopifyDomain?.split(".")[0];

  // console.log("Billing loader response:", json);

  return {
    redirectUrl: `https://admin.shopify.com/store/${storeHandle}/charges/popsize/pricing_plans`,
  };
};

export default function Billing() {
  const { t } = useTranslation();
  const { redirectUrl } = useLoaderData<typeof loader>();

  useEffect(() => {
    if (redirectUrl) {
      //window.location.href = redirectUrl;
      window.parent.location.href = redirectUrl;
    }
  }, [redirectUrl]);

  return (
    <Page title={t('billing_title') || "Billing"}>
      <Layout>
        <Layout.Section>
          <LegacyCard sectioned>
            <Text variant="bodyMd" as="p">
              {t('billing_redirecting') || "Redirecting you to manage your Popsize subscription..."}
            </Text>
          </LegacyCard>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

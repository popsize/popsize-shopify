// app/routes/app.widget.tsx
import type { ActionFunctionArgs } from "@remix-run/node";
import { Page, Tabs, Text } from "@shopify/polaris";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { authenticate } from "../shopify.server";
import AdvancedSettings from "./app.settings";
import Style from "./app.style";


export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const { admin, session } = await authenticate.admin(request); // ✅ contains shop
  const shop = session.shop;

  if (!shop) throw new Error("Missing shop in session");

  const response = await admin.graphql(`
    {
      shop {
        id
      }
    }
  `);
  const result = await response.json();
  const shopId = result.data.shop.id;

  // Save onboarding_completed
  await admin.graphql(`
    mutation {
      metafieldsSet(metafields: [{
        namespace: "popsize",
        key: "onboarding_completed",
        type: "single_line_text_field",
        value: "true",
        ownerId: "${shopId}"
      }]) {
        metafields { id }
        userErrors { message }
      }
    }
  `);

  // Save widget_size as ui_size metafield
  const widgetSize = formData.get("widget_size") || "medium";
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
            key: "ui_size",
            type: "single_line_text_field",
            value: widgetSize,
            ownerId: shopId,
          },
        ],
      },
    }
  );

  return new Response(null, {
    status: 200,
  });
};
export default function Widget() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(0);

  const tabs = [
    {
      id: "setup-tab",
      content: t("tab_setup") || "Setup",
      panelID: "setup-panel",
    },
    {
      id: "advanced-tab",
      content: t("tab_advanced") || "Advanced",
      panelID: "advanced-panel",
    },
  ];

  return (
    <Page fullWidth>
        <div style={{ padding: '0px 30px 0 30px', marginBottom: '50px', alignItems: 'center', textAlign: 'center' }}>
                <Text variant="heading2xl" as="h1" tone="base">
                  {t('welcome_title')}
                </Text>
                <Text variant="bodyLg" as="p" tone="success">
                  {t('welcome_subtitle')}
                </Text>
              </div>
      <Tabs tabs={tabs} selected={selected} onSelect={setSelected}>
        <div>
          {selected === 0 && <Style />}
          {selected === 1 && <AdvancedSettings />}
        </div>
      </Tabs>
    </Page>
  );
}

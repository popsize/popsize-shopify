import type { ActionFunctionArgs } from "@remix-run/node";
import { Form, redirect, useLocation } from "@remix-run/react";
import { Button, FormLayout, Layout, LegacyCard, Page, Select, Text } from "@shopify/polaris";
import i18n from "app/translations/i18n";
import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { authenticate } from "../shopify.server";
import SlotSLarge from "./SlotEffect/Large/SlotS-large";
import SlotSMedium from "./SlotEffect/Medium/SlotS-medium";
import MonochromeStatic from "./SlotEffect/Monochrome-static/Monochrome-static";
import SlotSSmall from "./SlotEffect/Small/SlotS-small";

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

  return redirect("/app");
};

export default function Style() {
  //const [language, setLanguage] = useState("English");
  const [widgetSize, setWidgetSize] = useState("medium");
  const { t } = useTranslation();
  const [language, setLanguage] = useState(i18n.language === 'fr' ? 'Français' : 'English');
  const location = useLocation();

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    i18n.changeLanguage(value === 'Français' ? 'fr' : 'en');
  };

  const boxStyle = (size: string): React.CSSProperties => ({
    //display: 'inline-block',
    display: 'flex',
    flexGrow: 0,
    border: widgetSize === size ? '1px solid #FFD073' : '1px solid transparent',
    borderRadius: '0px',
    padding: '12px 12px',
    cursor: 'pointer',
    backgroundColor: widgetSize === size ? 'transparent' : 'transparent',
    justifyContent: 'center',
  });

  return (
    <Page fullWidth>
      <Layout>
        <Layout.Section>
          <LegacyCard>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '32px', alignItems: 'center', padding: 20 }}>
              {/* Left: image */}
              <div style={{ flex: 1 }}>
                <img
                  src="https://storage.googleapis.com/popsize-shopify-images/shopping.png"
                  alt="Widget preview"
                  style={{ maxWidth: '100%', borderRadius: '8px' }}
                />
              </div>

              {/* Right: form */}
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: '16px' }}>
                  <Text as="p">
                    {t('setup_description')}
                  </Text>
                </div>
                <Form method="post">
                  {/*<input type="hidden" name="shop" value={new URLSearchParams(location.search).get("shop") ?? ""} />*/}
                  <input type="hidden" name="widget_size" value={widgetSize} />
                  <FormLayout>
                    <div style={{ marginBottom: '0px' }}>
                      <Text variant="bodyMd" fontWeight="bold" as="p">
                        {t('settings_language')}
                      </Text>
                      <Text variant="bodySm" tone="subdued" as="p">
                        {t('settings_language_subtext')}
                      </Text>
                    </div>
                    <Select
                      label=""
                      name="language"
                      options={["English", "Français"]}
                      value={language}
                      onChange={handleLanguageChange}
                    />

                    {/* TO-DO : capture the widget size*/}
                    {/* Widget Size Selection */}
                    <div style={{ marginTop: '24px' }}>
                     <Text variant="bodyMd" fontWeight="bold" as="p">
                      {t('widget_style_label')}
                    </Text>
                    <Text variant="bodySm" tone="subdued" as="p">
                      {t('widget_style_subtext')}
                    </Text>
                    </div>
                    <input type="hidden" name="widget_size" value={widgetSize} />
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                      <div onClick={() => setWidgetSize("monochrome")} style={boxStyle("monochrome")}>
                        <MonochromeStatic />
                      </div>
                      <div onClick={() => setWidgetSize("small")} style={boxStyle("small")}>
                        <SlotSSmall />
                      </div>
                      <div onClick={() => setWidgetSize("medium")} style={boxStyle("medium")}>
                        <SlotSMedium />
                      </div>
                      <div onClick={() => setWidgetSize("large")} style={boxStyle("large")}>
                        <SlotSLarge />
                      </div>
                      {/* Optional: Add a fourth box */}
                    </div>
                    <Button submit variant="primary">
                      {t('save_button')}
                    </Button>
                  </FormLayout>
                </Form>
                <div style={{ marginTop: '1rem' }}>
                  <Text as="p" tone="subdued" variant="bodySm">
                    {t('change_later_note')}
                  </Text>
                </div>
              </div>
            </div>
          </LegacyCard>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
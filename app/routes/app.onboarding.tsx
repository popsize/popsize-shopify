import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect, Form } from "@remix-run/react";
import { Page, Layout, Select, Button, Text, FormLayout, LegacyCard } from "@shopify/polaris";
import { useState } from "react";
import { authenticate } from "../shopify.server";
import SlotSLarge from "./SlotEffect/Large/SlotS-large";
import SlotSMedium from "./SlotEffect/Medium/SlotS-medium";
import SlotSSmall from "./SlotEffect/Small/SlotS-small";
import MonochromeStatic from "./SlotEffect/Monochrome-static/Monochrome-static";
import { useTranslation } from 'react-i18next';
import i18n from "app/translations/i18n";
import { useLocation } from "@remix-run/react";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const { admin, session } = await authenticate.admin(request); // ✅ contains shop
  const shop = session.shop;

  if (!shop) throw new Error("Missing shop in session");

  //const { admin } = await authenticate.admin(request); // ✅ no second argument

  const response = await admin.graphql(`
    {
      shop {
        id
      }
    }
  `);
  const result = await response.json();
  const shopId = result.data.shop.id;

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

  return redirect("/app");
};

export default function Onboarding() {
  //const [language, setLanguage] = useState("English");
  const [widgetSize, setWidgetSize] = useState("Medium");
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
      <div style={{ padding: '54px 30px 0 30px', marginBottom: '50px', alignItems: 'center', textAlign: 'center' }}>
        <Text variant="heading2xl" as="h1" tone="base">
          {t('welcome_title')}
        </Text>
        <Text variant="bodyLg" tone="success">
          The most advanced AI sizing tool
        </Text>
      </div>
      <Layout>
        <Layout.Section>
          <LegacyCard>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '32px', alignItems: 'center', padding: 20 }}>
              {/* Left: image */}
              <div style={{ flex: 1 }}>
                <img
                  src="/images/shopping.png"
                  alt="Widget preview"
                  style={{ maxWidth: '100%', borderRadius: '8px' }}
                />
              </div>

              {/* Right: form */}
              <div style={{ flex: 1 }}>
                {/*<div style={{ marginBottom: '16px' }}>
                  <Text variant="headingLg" as="h1">
                    {t('welcome_title')}
                  </Text>
                </div>*/}
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
                      <div onClick={() => setWidgetSize("Monochrome")} style={boxStyle("Monochrome")}>
                        <MonochromeStatic />
                      </div>
                      <div onClick={() => setWidgetSize("Small")} style={boxStyle("Small")}>
                        <SlotSSmall />
                      </div>
                      <div onClick={() => setWidgetSize("Medium")} style={boxStyle("Medium")}>
                        <SlotSMedium />
                      </div>
                      <div onClick={() => setWidgetSize("Large")} style={boxStyle("Large")}>
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
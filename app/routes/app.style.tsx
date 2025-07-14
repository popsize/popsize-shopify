import { Form, useLocation } from "@remix-run/react";
import { Button, FormLayout, Layout, LegacyCard, Page, Select, Text } from "@shopify/polaris";
import i18n from "app/translations/i18n";
import { useState } from "react";
import { useTranslation } from 'react-i18next';
//import SlotSLarge from "./SlotEffect/Large/SlotS-large";
import SlotSMedium from "./SlotEffect/Medium/SlotS-medium";
import MonochromeStatic from "./SlotEffect/Monochrome-static/Monochrome-static";
import SlotSSmall from "./SlotEffect/Small/SlotS-small";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "app/shopify.server";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(`
    {
      shop {
        widgetStyle: metafield(namespace: "popsize", key: "widget_style") {
          value
        }
      }
    }
  `);

  const result = await response.json();
  const isWidgetStyleSet = !!result?.data?.shop?.widgetStyle?.value;

  return json({ isWidgetStyleSet });
};

export default function Style() {
  //const [language, setLanguage] = useState("English");
  const [widgetSize, setWidgetSize] = useState("medium");
  const { t } = useTranslation();
  const [language, setLanguage] = useState(i18n.language === 'fr' ? 'Français' : 'English');
  const location = useLocation();
  const data = useLoaderData<typeof loader>() || {};
  const [isWidgetStyleSet, setIsWidgetStyleSet] = useState<boolean>(data.isWidgetStyleSet ?? false);


  const handleLanguageChange = (value: string) => {
  setLanguage(value);
  setIsWidgetStyleSet(false); // ⬅️ force "Save" button to appear again
  i18n.changeLanguage(value === 'Français' ? 'fr' : 'en');
};

const handleWidgetSizeChange = (size: string) => {
  setWidgetSize(size);
  setIsWidgetStyleSet(false); // ⬅️ same here
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
                      <div onClick={() => handleWidgetSizeChange("monochrome")} style={boxStyle("monochrome")}>
                        <MonochromeStatic />
                      </div>
                      <div onClick={() => handleWidgetSizeChange("small")} style={boxStyle("small")}>
                        <SlotSSmall />
                      </div>
                      <div onClick={() => handleWidgetSizeChange("medium")} style={boxStyle("medium")}>
                        <SlotSMedium />
                      </div>
                      {/*<div onClick={() => handleWidgetSizeChange("large")} style={boxStyle("large")}>
                        <SlotSLarge />
                      </div>*/}
                      {/* Optional: Add a fourth box */}
                    </div>
                    <Button
                      variant={isWidgetStyleSet ? "secondary" : "primary"}
                      disabled={isWidgetStyleSet}
                      onClick={async () => {
                        const shop = new URLSearchParams(location.search).get("shop");
                        if (!shop) return;

                        const res = await fetch(`/api/set-widget-style?shop=${shop}`, {
                          method: "POST",
                        });

                        const data = await res.json();
                        if (data.success) {
                          setIsWidgetStyleSet(true);
                        }
                      }}
                    >
                      {isWidgetStyleSet ? t('saved_button') : t('save_button')}
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
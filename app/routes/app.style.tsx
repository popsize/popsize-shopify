import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { Button, FormLayout, Layout, LegacyCard, Page, Select, Text } from "@shopify/polaris";
import { authenticate } from "app/shopify.server";
import i18n from "app/translations/i18n";
import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import SlotSLarge from "./SlotEffect/Large/SlotS-large";
import SlotSMedium from "./SlotEffect/Medium/SlotS-medium";
import MonochromeStatic from "./SlotEffect/Monochrome-static/Monochrome-static";
import SlotSSmall from "./SlotEffect/Small/SlotS-small";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(`
    {
      shop {
        currentWidgetSize: metafield(namespace: "popsize", key: "ui_size") {
          value
        }
        domain
      }
    }
  `);

  const result = await response.json();
  const currentWidgetSize = result?.data?.shop?.currentWidgetSize?.value || "medium";
  const shop = result?.data?.shop?.domain;

  return json({ currentWidgetSize, shop });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const widgetSize = formData.get("widget_size") as string;
  const language = formData.get("language") as string;

  // Get shop ID
  const shopResponse = await admin.graphql(`
    {
      shop {
        id
      }
    }
  `);
  
  const shopResult = await shopResponse.json();
  const shopId = shopResult?.data?.shop?.id;

  if (!shopId) {
    return json({ success: false, error: "Shop ID not found" }, { status: 500 });
  }

  // Save widget size
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
        value: widgetSize,
        ownerId: shopId,
      },
    ],
  };

  const response = await admin.graphql(mutation, { variables });
  const result = await response.json();

  if (result?.data?.metafieldsSet?.userErrors?.length) {
    return json({ success: false, error: result.data.metafieldsSet.userErrors[0].message }, { status: 500 });
  }

  return json({ success: true, savedWidgetSize: widgetSize });
};

export default function Style() {
  const loaderData = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const { t } = useTranslation();
  
  // Handle null loader data safely
  const initialWidgetSize = loaderData?.currentWidgetSize || "medium";
  const shop = loaderData?.shop;
  
  // Initialize state with the loaded widget size
  const [selectedWidgetSize, setSelectedWidgetSize] = useState(initialWidgetSize);
  const [currentWidgetSize, setCurrentWidgetSize] = useState(initialWidgetSize);
  const [language, setLanguage] = useState(i18n.language === 'fr' ? 'Français' : 'English');
  
  const isSubmitting = fetcher.state === "submitting";
  const hasUnsavedChanges = selectedWidgetSize !== currentWidgetSize;

  // Update state when fetcher data changes (after save)
  useEffect(() => {
    if (fetcher.data?.success && 'savedWidgetSize' in fetcher.data) {
      setCurrentWidgetSize(fetcher.data.savedWidgetSize);
      setSelectedWidgetSize(fetcher.data.savedWidgetSize);
    }
  }, [fetcher.data]);

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    i18n.changeLanguage(value === 'Français' ? 'fr' : 'en');
  };

  const handleWidgetSizeChange = (size: string) => {
    setSelectedWidgetSize(size);
  };

  const getWidgetStyle = (size: string): React.CSSProperties => ({
    display: 'flex',
    flexGrow: 0,
    border: selectedWidgetSize === size ? '2px solid #FF8800' : '2px solid transparent',
    borderRadius: '8px',
    padding: '12px',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    transition: 'border-color 0.2s ease',
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
                
                <fetcher.Form method="post">
                  <input type="hidden" name="widget_size" value={selectedWidgetSize} />
                  <input type="hidden" name="language" value={language} />
                  
                  <FormLayout>
                    {/* Language Selection */}
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
                      name="language_select"
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
                    
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                      <div 
                        onClick={() => handleWidgetSizeChange("monochrome")} 
                        style={getWidgetStyle("monochrome")}
                      >
                        <MonochromeStatic />
                      </div>
                      <div 
                        onClick={() => handleWidgetSizeChange("small")} 
                        style={getWidgetStyle("small")}
                      >
                        <SlotSSmall />
                      </div>
                      <div 
                        onClick={() => handleWidgetSizeChange("medium")} 
                        style={getWidgetStyle("medium")}
                      >
                        <SlotSMedium />
                      </div>
                      <div 
                        onClick={() => handleWidgetSizeChange("large")} 
                        style={getWidgetStyle("large")}
                      >
                        <SlotSLarge />
                      </div>
                    </div>
                    
                    <Button
                      variant={hasUnsavedChanges ? "primary" : "secondary"}
                      disabled={!hasUnsavedChanges || isSubmitting}
                      submit
                      loading={isSubmitting}
                    >
                      {isSubmitting 
                        ? t('saving_button') || 'Saving...'
                        : hasUnsavedChanges 
                          ? t('save_button') 
                          : t('saved_button')
                      }
                    </Button>
                    
                    {fetcher.data?.success && (
                      <Text as="p" tone="success">
                        Widget style saved successfully!
                      </Text>
                    )}
                    
                    {fetcher.data && !fetcher.data.success && 'error' in fetcher.data && (
                      <Text as="p" tone="critical">
                        Error: {fetcher.data.error}
                      </Text>
                    )}
                  </FormLayout>
                </fetcher.Form>
                
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
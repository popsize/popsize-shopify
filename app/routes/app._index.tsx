import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { TitleBar } from "@shopify/app-bridge-react";
import {
  Box,
  Button,
  Card,
  Page,
  Text,
} from "@shopify/polaris";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { authenticate } from "../shopify.server";
import OnboardingStep1 from "./OnboardingStep1";
import OnboardingStep2 from "./OnboardingStep2";
import OnboardingStep3 from "./OnboardingStep3";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  // Fetch accountCreated metafield and shop info
  const accountResponse = await admin.graphql(`
    {
      shop {
        id
        name
        email
        primaryDomain {
          host
        }
        myshopifyDomain
        metafield(namespace: "popsize", key: "accountCreated") {
          value
        }
      }
    }
  `);

  const accountJson = await accountResponse.json();
  const shop = accountJson.data.shop;
  const accountCreated = shop.metafield?.value === "true";
  const shopId = shop.id;
  const shortShopId = shopId.split("/").pop();
  const shopName = shop.name;
  const shopDomain = shop.primaryDomain?.host || "";
  const myshopifyDomain = shop.myshopifyDomain;
  const shopEmail = shop.email;

  // If account not created, call backend and set metafield
  if (!accountCreated) {
    const apiResponse = await fetch("https://popsize-api-b2b-1049592794130.europe-west9.run.app/partners/create_shopify_account/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        shop_id: shortShopId,
        shop_domains: [ shopDomain, myshopifyDomain ],
        shop_name: shopName,
        shop_email: shopEmail,
      }),
    });

    const apiJson = await apiResponse.json();
    if (apiJson.status_code === 201 && apiJson.message === "Account created successfully.") {
      // Set accountCreated metafield to true
      await admin.graphql(`
        mutation {
          metafieldsSet(metafields: [{
            namespace: "popsize",
            key: "accountCreated",
            type: "single_line_text_field",
            value: "true",
            ownerId: "${shopId}"
          }]) {
            metafields {
              id
              value
            }
            userErrors {
              field
              message
            }
          }
        }
      `);
    }
  }

  const response = await admin.graphql(`
    {
      shop {
        widgetIntegration: metafield(namespace: "popsize", key: "widget_integration") {
          value
        }
        widgetPlacement: metafield(namespace: "popsize", key: "widget_placement") {
          value
        }
        billing: metafield(namespace: "popsize", key: "billing") {
          value
        }
      }
    }
  `);

  const result = await response.json();

  const widgetIntegration = result.data.shop.widgetIntegration?.value === "true";
  const widgetPlacement = result.data.shop.widgetPlacement?.value === "true";
  const billing = result.data.shop.billing?.value === "true";


  let initialStep = 1;
  if (billing) initialStep = 4;
  else if (widgetIntegration && widgetPlacement) initialStep = 3;
  else if (widgetIntegration) initialStep = 2;

  const partnerId = `shopify:${shortShopId}`;
  console.log("✅ Sending shopId to client:", partnerId);

  return json({ initialStep, billing, shopId: partnerId, shopName, myshopifyDomain });
};


export default function OnboardingWizard() {
  const { t } = useTranslation();
  const { initialStep, billing, shopId, shopName, myshopifyDomain } = useLoaderData<typeof loader>();
  const [step, setStep] = useState(initialStep);
  const [billingState, setBillingState] = useState(billing);

  const navigate = useNavigate();

  const isBillingComplete = billingState || billing;

  const [showCompleteStep, setShowCompleteStep] = useState(false);
  const [showFinalScreen, setShowFinalScreen] = useState(false);
  const [isBrandReady, setIsBrandReady] = useState<boolean | null>(null);

  const TOTAL_STEPS = 3;
  const STEP_LABELS = [
    t('onboarding_step1'),
    t('onboarding_step2'),
    t('onboarding_step3')
  ];

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleCompleteAndShowFinal = () => {
    setBillingState(true);         // show "You're all set!"
    setShowCompleteStep(true);

    setTimeout(() => {
      setShowCompleteStep(false);  // hide "You're all set!"
      setShowFinalScreen(true);    // show "test popsize"
    }, 5000);
  };

  console.log("🧠 OnboardingWizard rendered", { step, billingState });

  useEffect(() => {
    const fetchIsReady = async () => {
      console.log("📤 Calling /brands/is_ready with partner_id:", shopId);
      try {
        const response = await fetch("https://popsize-api-1049592794130.europe-west9.run.app/brands/is_ready", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            partner_id: shopId,
          }),
        });

        const text = await response.text();
        console.log("📥 Raw API response:", text);

        const data = JSON.parse(text);
        console.log("✅ Parsed response:", data);

        setIsBrandReady(data.is_ready);
      } catch (error) {
        console.error("❌ Error in fetchIsReady:", error);
        setIsBrandReady(false);
      }
    };

    if (shopId) fetchIsReady();
  }, [shopId]);

  console.log('FetchReady response: ', isBrandReady);

  return (
    <Page fullWidth>
      <TitleBar title="Popsize" />
      <Card>
        <Box padding="400">
          {isBillingComplete ? (
            <div style={{ textAlign: "left", padding: "20px 0" }}>
              {/* INTRO */}
              <Text variant="headingLg" as="h2">{t('welcome_title')}</Text>
              
              <Box paddingBlockEnd="200" paddingBlockStart="200">
              <Text as="h3" tone="base">
                {t('welcome_subtitle2')}
              </Text>
              </Box>

              {/* STATUS */}
              <div style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                marginBottom: "24px",
                gap: "12px",
              }}>
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  marginTop: "12px",
                }}>
                  <span
                    className="material-symbols-outlined"
                    style={{
                      color: isBrandReady === true ? "#00C851" : "#e3e3e3",
                      fontSize: 48,
                    }}
                  >
                    square_dot
                  </span>
                  <span
                    className="material-symbols-outlined"
                    style={{
                      color: isBrandReady === false ? "#FF8800" : "#e3e3e3",
                      fontSize: 48,
                      marginTop: 4,
                    }}
                  >
                    square_dot
                  </span>
                </div>
                <div style={{ marginTop: 24 }}>
                  <Text as="p" tone="subdued">
                    <strong style={{ color: isBrandReady ? "#00C851" : "#FF8800" }}>
                      {isBrandReady === true ? t('brand_ready_message') : isBrandReady === false ? t('brand_not_ready_message') : "..."}
                    </strong>
                  </Text>
                </div>
              </div>

              <hr />
              {/* ISSUES */}
              <Box paddingBlockEnd="200" paddingBlockStart="200">
                <Text as="p">{t('welcome_text_issue_intro')}</Text>
              </Box>

              <ul style={{ paddingLeft: 20, marginBottom: 20 }}>
                <li style={{ marginBottom: 8 }}>
                  {t('welcome_text_issue_step1_1')}<strong>{t('navmenu_integration')}</strong>{t('welcome_text_issue_step1_2')}{" "}
                  <Button onClick={() => navigate("/app/integration")}>
                    {t('welcome_text_issue_step1_button')}
                  </Button>
                </li>
                <li>
                  {t('welcome_text_issue_step2_1')}<strong>{t('navmenu_billing')}</strong>{t('welcome_text_issue_step2_2')}{" "}
                  <Button onClick={() => navigate("/app/billing")}>
                    {t('welcome_text_issue_step2_button')}
                  </Button>
                  <br />
                  <em>{t('welcome_text_issue_note_1_1')}<strong>1000</strong>{t('welcome_text_issue_note_1_2')}</em>
                </li>
              </ul>

              <Text as="p" tone="subdued">
                {t('welcome_text_contact_message_1')}{" "}
                <a href={`mailto:partners@popsize.ai?subject=Support Request&body=Shop Name: ${shopName}%0AMyshopify Domain: ${myshopifyDomain}`} style={{ textDecoration: "underline" }}>
                  partners@popsize.ai
                </a>{t('welcome_text_contact_message_2')}
              </Text>

            </div>
          ) : (
            <>
            <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 40,
              width: "100%",
            }}
          >
            {STEP_LABELS.map((label, index) => {
              const stepNumber = index + 1;
              const isCompleted = step > stepNumber;
              const isActive = step === stepNumber;

              return (
                <div key={index} style={{ display: "flex", alignItems: "center" }}>
                  {/* Group: Circle + Label */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      //minWidth: 150, // Ensures spacing consistency
                      paddingRight: index < STEP_LABELS.length - 1 ? 12 : 0,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        backgroundColor: isCompleted
                          ? "#001234"
                          : isActive
                          ? "#FFFCF7"
                          : "#EBEBF2",
                        border: `1px solid ${
                            isCompleted
                              ? "transparent"
                              : isActive
                              ? "#FFAA00"
                              : "#ADADB2"
                          }`,
                        color: isCompleted
                          ? "#F7FAFF"
                          : isActive
                          ? "#FFAA00"
                          : "#ADADB2",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        flexShrink: 0,
                      }}
                    >
                      {stepNumber}
                    </div>
                    <Text
                      variant="bodySm"
                      tone={
                        isCompleted
                          ? "disabled"
                          : isActive
                          ? "subdued" // valid tone
                          : "base"
                      }
                      as="p"
                      // @ts-ignore
                      style={{ whiteSpace: "nowrap" }}
                    >
                      {label}
                    </Text>
                  </div>

                  {/* Line (after group, not inside) */}
                  {index < STEP_LABELS.length - 1 && (
                      <div
                        style={{
                          height: 2,
                          width: 40,
                          backgroundColor: step > stepNumber ? "#EBEBF2" : "#001234",
                          margin: "0 12px",
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          
        {/* Onboarding steps */}
        {step === 1 && <OnboardingStep1 onNext={handleNext} />}
        {step === 2 && <OnboardingStep2 onNext={handleNext} onBack={handleBack} />}
        {step === 3 && <OnboardingStep3 onNext={handleNext} onBack={handleBack} onComplete={() => setBillingState(true)} />}
        {/* Add your OnboardingStep3 and 4 similarly */}
        </>
        )}
        </Box>
      </Card>
    </Page>
  );
}

import { TitleBar } from "@shopify/app-bridge-react";
import {
  Box,
  Card,
  Page,
  Text,
} from "@shopify/polaris";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import OnboardingStep1 from "./OnboardingStep1";
import OnboardingStep2 from "./OnboardingStep2";
import OnboardingStep3 from "./OnboardingStep3";
import { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

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

  return json({ initialStep, billing });
};

export default function OnboardingWizard() {
  //const [step, setStep] = useState(1);
  //const { widgetIntegration } = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const { initialStep, billing } = useLoaderData<typeof loader>();
  const [step, setStep] = useState(initialStep);

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

  return (
    <Page fullWidth>
      <TitleBar title="Popsize" />
      <Card>
          <Box padding="400">
            {billing ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Text variant="headingLg" as="h2">
              {t("onboarding_complete_title", "You're all set!")}
            </Text>
            <Text tone="subdued" as="p" style={{ marginTop: 12 }}>
              {t("onboarding_complete_subtitle", "Popsize is now fully configured for your store.")}
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
        {step === 3 && <OnboardingStep3 onNext={handleNext} onBack={handleBack} />}
        {/* Add your OnboardingStep3 and 4 similarly */}
        </>
        )}
        </Box>
      </Card>
    </Page>
  );
}

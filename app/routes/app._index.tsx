import { useState } from "react";
import {
  Page,
  Layout,
  Card,
  Box,
  Text,
  Button,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import OnboardingStep1 from "./OnboardingStep1";
import OnboardingStep2 from "./OnboardingStep2";
import { useTranslation } from "react-i18next";
import OnboardingStep3 from "./OnboardingStep3";

export default function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const { t } = useTranslation();

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
      <TitleBar title="Popsize Setup Wizard" />
      <Card>
          <Box padding="400">
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
          </Box>
        {/* Onboarding steps */}
        {step === 1 && <OnboardingStep1 onNext={handleNext} />}
        {step === 2 && <OnboardingStep2 onNext={handleNext} onBack={handleBack} />}
        {step === 3 && <OnboardingStep3 onNext={handleNext} onBack={handleBack} />}
        {/* Add your OnboardingStep3 and 4 similarly */}
      </Card>
    </Page>
  );
}

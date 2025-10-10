/* TO-DO: implement the widget embedding

Continue button: make it inactive until, either: we successfully checked the widget is embedded (not sure it's possible)
or the user has clicked on the "Embed" button

Embed button should head the user to its store to embed <Popsize>*/



import { Box, Button, MediaCard, Text } from "@shopify/polaris";
import type { FC } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { makeOnboardingApiCall } from "../utils/onboardingApi";
import { openAdminPage } from "../utils/themeEditor";

const OnboardingStep3: FC<{ onNext: () => void; onBack?: () => void; onComplete: () => void; }> = ({
  onNext,
  onBack,
  onComplete
}) => {

  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const handleOpenThemeEditor = async () => {
    await openAdminPage('charges/popsize/pricing_plans');
  };

  const handleFinish = async () => {
    setIsSubmitting(true);

    const success = await makeOnboardingApiCall('/api/set-widget-billing');
    if (success) {
      setIsSuccess(true);
    } else {
      // Error already handled by utility function
    }

    setIsSubmitting(false);
  };

  if (isSuccess) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <Text variant="headingLg" as="h2">
          {t("onboarding_complete_title", "You're all set!")}
        </Text>
        <Text tone="subdued" as="p" style={{ marginTop: 12 }}>
          {t("onboarding_complete_subtitle", "Popsize is now fully configured for your store.")}
        </Text>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <MediaCard
        title={t('step3_title')}
        // @ts-ignore
        description={
          <>
            <Text as="p" tone="subdued">
              {t('step3_subtitle')}
            </Text>
            <Box paddingBlockStart="200">
              <ol style={{ paddingLeft: 16 }}>
                <li>{t('step3_step1')}</li>
                <li>{t('step3_step2')}</li>
                <li>{t('step3_step3')}</li>
              </ol>
            <Box marginBlockStart="200">
                <Button onClick={handleOpenThemeEditor} variant="secondary">
                  {t("step_3_button")}
                </Button>
              </Box>
            </Box>
          </>
        }

      >
        <img
          alt="Animated walkthrough of widget activation"
          src="https://storage.googleapis.com/popsize-shopify-images/pricing_table.png"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            borderRadius: 4,
          }}
        />
      </MediaCard>

      {/* Navigation buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 20,
        }}
      >
        <Button onClick={onBack} disabled={!onBack}>
          {t('back')}
        </Button>
        <Button
          variant="primary"
          onClick={handleFinish}
          loading={isSubmitting}
        >
          {t("finish")}
        </Button>
      </div>
    </div>
  );
};

export default OnboardingStep3;
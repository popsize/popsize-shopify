// ========================================
// Author: Nicolas Micaux
// Copyright (c) 2025 Popsize. All rights reserved.
// ========================================

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

const OnboardingStep2: FC<{ onNext: () => void; onBack?: () => void }> = ({
  onNext,
  onBack,
}) => {

  const { t } = useTranslation();
  const [hasClickedEmbed, setHasClickedEmbed] = useState(false);
  
  const handleOpenThemeEditor = async () => {
    const success = await openAdminPage('themes/current/editor?template=product');
    if (success) {
      setHasClickedEmbed(true);
    }
  };

  const handleContinue = async () => {
    const success = await makeOnboardingApiCall('/api/set-widget-placement');
    if (success) {
      onNext();
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <MediaCard
        title={t('step2_title')}
        // @ts-ignore
        description={
          <>
            <Text as="p" tone="subdued">
              {t('step2_subtitle')}
            </Text>
            <Box paddingBlockStart="200">
              <ol style={{ paddingLeft: 16 }}>
                <li>{t('step2_step1')}</li>
                <li>{t('step2_step2')}</li>
                <li>{t('step2_step3_part1')}<b>{t('step2_step3_part2')}</b>{t('step2_step3_part3')}</li>
              </ol>
            <Box marginBlockStart="200">
                <Button onClick={handleOpenThemeEditor} variant="secondary">
                  {t("step_1_button")}
                </Button>
              </Box>
            </Box>
          </>
        }

      >
        <img
          alt="Animated walkthrough of widget activation"
          src="https://storage.googleapis.com/popsize-shopify-images/Recording-PopsizePlacement.gif"
          style={{
            width: "100%",
            //height: "100%",
            height: 'auto',
            //objectFit: "cover",
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
          onClick={handleContinue}
          disabled={false}
        >
          {t("continue")}
        </Button>
      </div>
    </div>
  );
};

export default OnboardingStep2;
// This code is licensed under the GNU Affero General Public License.
// Author: Nicolas Micaux

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

const OnboardingStep1: FC<{ onNext: () => void; onBack?: () => void }> = ({
  onNext,
  onBack,
}) => {

  const { t } = useTranslation();
  const [hasClickedEmbed, setHasClickedEmbed] = useState(false);

  const handleOpenThemeEditor = async () => {
    const success = await openAdminPage('themes/current/editor?template=product&section=header');
    if (success) {
      setHasClickedEmbed(true);
    }
  };

  const handleContinue = async () => {
    const success = await makeOnboardingApiCall('/api/set-widget-integration');
    if (success) {
      onNext();
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <MediaCard
        title={t('step1_title')}
        // @ts-ignore
        description={
          <>
            <Text as="p" tone="subdued">
              {t('step1_subtitle')}
            </Text>
            <Box paddingBlockStart="200">
              <ol style={{ paddingLeft: 16 }}>
                <li>{t('step1_step1')}</li>
                <li>{t('step1_step2')}</li>
                <li>{t('step1_step3_part1')}<b>{t('step1_step3_part2')}</b>{t('step1_step3_part3')}</li>
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
          src="https://storage.googleapis.com/popsize-shopify-images/Recording-PopsizeWidget.gif"
          style={{
            width: "100%",
            //height: "100%",
            //objectFit: "cover",
            height: 'auto',
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

export default OnboardingStep1;
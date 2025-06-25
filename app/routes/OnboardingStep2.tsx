/* TO-DO: implement the widget embedding

Continue button: make it inactive until, either: we successfully checked the widget is embedded (not sure it's possible)
or the user has clicked on the "Embed" button

Embed button should head the user to its store to embed <Popsize>*/



import { MediaCard, Button, Box, Text } from "@shopify/polaris";
import { FC, useState } from "react";
import { useTranslation } from "react-i18next";

const OnboardingStep2: FC<{ onNext: () => void; onBack?: () => void }> = ({
  onNext,
  onBack,
}) => {

  const { t } = useTranslation();
  const [hasClickedEmbed, setHasClickedEmbed] = useState(false);
  
    const handleOpenThemeEditor = () => {
    const shop = new URLSearchParams(window.location.search).get("shop");
  
    if (!shop) {
      console.error("Shop parameter missing in URL.");
      return;
    }
  
    const url = `https://${shop}/admin/themes/current/editor?template=product`;
    window.open(url, "_blank");
    setHasClickedEmbed(true);
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
        {/*<img
          alt="Illustration of Popsize widget activation"
          width="100%"
          height="100%"
          style={{
            objectFit: "cover",
            objectPosition: "center",
          }}
          src="/images/shopping.png"
        />*/}
        <img
          alt="Animated walkthrough of widget activation"
          src="/videos/Recording-PopsizePlacement.gif"
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
          onClick={onNext}
          disabled={!hasClickedEmbed}
        >
          {t("continue")}
        </Button>
      </div>
    </div>
  );
};

export default OnboardingStep2;
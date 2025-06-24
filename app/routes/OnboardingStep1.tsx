/* TO-DO: implement the widget embedding

Continue button: make it inactive until, either: we successfully checked the widget is embedded (not sure it's possible)
or the user has clicked on the "Embed" button

Embed button should head the user to its store to embed <Popsize>*/



import { MediaCard, Button, Box, Text } from "@shopify/polaris";
import { FC } from "react";

const OnboardingStep1: FC<{ onNext: () => void; onBack?: () => void }> = ({
  onNext,
  onBack,
}) => {
  return (
    <div style={{ padding: 20 }}>
      <MediaCard
        title="Enable app embed"
        // @ts-ignore
        description={
          <>
            <Text as="p" tone="subdued">
              App embed is required for Popsize to work correctly in your store.
            </Text>
            <Box paddingBlockStart="200">
              <ol style={{ paddingLeft: 16 }}>
                <li>Click on the button below to open the editor</li>
                <li>Enable “Popsize Widget” under App embeds</li>
                <li>Click <b>Save</b> in the theme editor</li>
              </ol>
            </Box>
          </>
        }
        primaryAction={{
          content: "Open theme editor",
          onAction: () =>
            window.open("/admin/themes/current/editor?context=apps", "_blank"),
        }}
      >
        <img
          alt="Illustration of Popsize widget activation"
          width="100%"
          height="100%"
          style={{
            objectFit: "cover",
            objectPosition: "center",
          }}
          src="/images/shopping.png"
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
          Back
        </Button>
        <Button variant="primary" onClick={onNext}>
          Continue
        </Button>
      </div>
    </div>
  );
};

export default OnboardingStep1;




/*

description={
          <>
            <Text as="p" tone="subdued">
              App embed is required for Popsize to work correctly in your store.
            </Text>
            <Box paddingBlockStart="200">
              <ol style={{ paddingLeft: 16 }}>
                <li>Click on the button below to open the editor</li>
                <li>Enable “Popsize Widget” under App embeds</li>
                <li>Click <b>Save</b> in the theme editor</li>
              </ol>
            </Box>
          </>
        }


        */
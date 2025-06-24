// app/routes/OnboardingStep2.tsx

import { Box, Button, Layout, Text, Image } from "@shopify/polaris";
import { FC } from "react";

const imageUrl = "https://link-to-your-illustration.png";

const OnboardingStep2: FC<{ onNext: () => void }> = ({ onNext }) => (
  <Layout>
    <Layout.Section oneHalf>
      <Image source={imageUrl} alt="Step 1" />
    </Layout.Section>
    <Layout.Section oneHalf>
      <Box padding="400">
        <Text variant="headingMd" as="p">Enable app embed as</Text>
        <Text as="p">
          App embed is required for Popsize to work correctly in your store.
        </Text>
        <ol>
          <li>Click on the button below to open the editor</li>
          <li>Enable “Popsize Widget” under App embeds</li>
          <li>Click <b>Save</b> in the theme editor</li>
        </ol>
        <Button primary onClick={() => window.open('/admin/themes/current/editor?context=apps')}>
          Enable app embed
        </Button>
        <Box paddingBlockStart="400">
          <Button onClick={onNext}>Continue</Button>
        </Box>
      </Box>
    </Layout.Section>
  </Layout>
);

export default OnboardingStep2;

// app/routes/app.widget.tsx
import { useState } from "react";
import { Page, Tabs } from "@shopify/polaris";
import Style from "./app.style";
import AdvancedSettings from "./app.settings";
import { useTranslation } from "react-i18next";
import { Text } from "@shopify/polaris";


export default function Widget() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(0);

  const tabs = [
    {
      id: "setup-tab",
      content: t("tab_setup") || "Setup",
      panelID: "setup-panel",
    },
    {
      id: "advanced-tab",
      content: t("tab_advanced") || "Advanced",
      panelID: "advanced-panel",
    },
  ];

  return (
    <Page fullWidth>
        <div style={{ padding: '0px 30px 0 30px', marginBottom: '50px', alignItems: 'center', textAlign: 'center' }}>
                <Text variant="heading2xl" as="h1" tone="base">
                  {t('welcome_title')}
                </Text>
                <Text variant="bodyLg" as="p" tone="success">
                  {t('welcome_subtitle')}
                </Text>
              </div>
      <Tabs tabs={tabs} selected={selected} onSelect={setSelected}>
        <div>
          {selected === 0 && <Style />}
          {selected === 1 && <AdvancedSettings />}
        </div>
      </Tabs>
    </Page>
  );
}

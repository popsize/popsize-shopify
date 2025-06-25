// app/components/AppAnalytics.tsx
import { Card, Text, Layout, Page, SkeletonBodyText, SkeletonDisplayText } from "@shopify/polaris";

export default function Analytics() {
  return (
    <Page title="Analytics">
      <Layout>
        {/* Card: Impressions */}
        <Layout.Section oneThird>
          <Card>
            <SkeletonDisplayText size="small" />
            <SkeletonBodyText />
          </Card>
        </Layout.Section>

        {/* Card: Click-through Rate */}
        <Layout.Section oneThird>
          <Card>
            <SkeletonDisplayText size="small" />
            <SkeletonBodyText />
          </Card>
        </Layout.Section>

        {/* Card: Conversion Rate */}
        <Layout.Section oneThird>
          <Card>
            <SkeletonDisplayText size="small" />
            <SkeletonBodyText />
          </Card>
        </Layout.Section>

        {/* Card: Size Recommendations Made */}
        <Layout.Section>
          <Card sectioned>
            <Text variant="headingMd" as="h2">
              Size Recommendations
            </Text>
            <p>Data coming soon...</p>
          </Card>
        </Layout.Section>

        {/* Card: User Engagement */}
        <Layout.Section>
          <Card sectioned>
            <Text variant="headingMd" as="h2">
              Engagement & Usage
            </Text>
            <p>Data coming soon...</p>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { authenticate, registerWebhooks } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);

  // Check onboarding status
  const response = await admin.graphql(`
    {
      shop {
        id
        metafield(namespace: "popsize", key: "onboarding_completed") {
          value
        }
      }
    }
  `);
  const result = await response.json();
  const onboardingDone = result.data.shop.metafield?.value === "true";

  if (!onboardingDone) {
    return redirect("/app/onboarding"); // or "/app/onboarding/"
  }

  // Always send user to /app; let /app handle onboarding logic
  return redirect("/app");
};

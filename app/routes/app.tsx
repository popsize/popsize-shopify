// routes/tabs for our app/dashboard

import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, redirect, useLoaderData, useLocation, useRouteError } from "@remix-run/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { boundary } from "@shopify/shopify-app-remix/server";

import { authenticate } from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

/*export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};*/


export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(`
    {
      shop {
        metafield(namespace: "popsize", key: "onboarding_completed") {
          value
        }
      }
    }
  `);

  const json = await response.json();
  const onboardingDone = json.data.shop.metafield?.value === "true";
  
  const url = new URL(request.url);
  const currentPath = url.pathname;

  // ✅ Prevent infinite loop
  if (!onboardingDone && currentPath !== "/app/onboarding") {
    return redirect("/app/onboarding");
  }

  // ✅ Force redirect if onboarding not done
  /*if (!onboardingDone) {
    return redirect("/app/onboarding");
  }*/

  console.log("👉 Onboarding metafield value:", json.data.shop.metafield?.value);

  return {
    apiKey: process.env.SHOPIFY_API_KEY || "",
    onboardingDone,
  };
};

export default function App() {
  const { apiKey, onboardingDone } = useLoaderData<typeof loader>();
  const location = useLocation(); // ✅ get current path
  const isOnboardingPage = location.pathname === "/app/onboarding";

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <NavMenu>
        {onboardingDone ? (
          <>
            <Link to="/app" rel="home">Home</Link>
            <Link to="/app/billing">Billing</Link>
            <Link to="/app/settings">Settings</Link>
            <Link to="/app/help">Help</Link>
          </>
        ) : (
          <Link to="/app/onboarding">Setup</Link>
        )}
      </NavMenu>
      {(onboardingDone || isOnboardingPage) && <Outlet />}
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};

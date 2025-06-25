// routes/app.tsx

import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { boundary } from "@shopify/shopify-app-remix/server";

import { authenticate } from "../shopify.server";
import { t } from "i18next";
import { useTranslation } from "react-i18next";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  return {
    apiKey: process.env.SHOPIFY_API_KEY || "",
  };
};

function NavigationMenu() {
  const { t } = useTranslation();

  return (
    <NavMenu>
      <Link to="/app/widget">{t("navmenu_widget")}</Link>
      <Link to="/app" rel="home">{t("navmenu_home")}</Link>
      <Link to="/app/billing">{t("navmenu_billing")}</Link>
      {/*<Link to="/app/analytics">{t("navmenu_analytics")}</Link>*/}
      {/*<Link to="/app/help">{t("navmenu_help")}</Link>*/}
    </NavMenu>
  );
}

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <NavigationMenu />
      <Outlet />
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

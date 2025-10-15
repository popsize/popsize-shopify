// This code is licensed under the GNU Affero General Public License.
// Author: Nicolas Micaux

// routes/app.tsx

import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useNavigation, useRouteError } from "@remix-run/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { Suspense, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { authenticate } from "../shopify.server";
import { setShopLocale } from "../translations/shopLocaleDetector";
import { debug, log, info } from '../utils/logger';

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  // Fetch shop data from Shopify Admin API
  // Note: The 'locale' field doesn't exist on Shop type in Admin API
  // We'll extract the locale from response headers and shop data
  let shopLocale = null;
  try {
    const response = await admin.graphql(`
      {
        shop {
          name
          primaryDomain {
            host
          }
          currencyCode
        }
      }
    `);
    const result = await response.json();
    log('🌍 Shop data fetched successfully');
    
    // The content-language header contains the shop's locale
    const contentLanguage = response.headers?.get?.('content-language');
    if (contentLanguage) {
      shopLocale = contentLanguage;
      log('🌍 Found shop locale from content-language header:', shopLocale);
    }
    
    // If no content-language header, we could also use currencyCode as a fallback
    // to infer locale (e.g., EUR -> likely "fr" or "de", USD -> likely "en")
    if (!shopLocale && result?.data?.shop?.currencyCode) {
      const currencyCode = result.data.shop.currencyCode;
      // Basic currency to locale mapping (could be expanded)
      const currencyToLocaleMap: Record<string, string> = {
        'USD': 'en',
        'EUR': 'en', // Default to English, could be fr, de, etc.
        'GBP': 'en',
        'CAD': 'en',
        'AUD': 'en',
        'JPY': 'ja',
        'CHF': 'de',
      };
      shopLocale = currencyToLocaleMap[currencyCode] || 'en';
      log('🌍 Inferred shop locale from currency:', shopLocale, 'from', currencyCode);
    }
    
  } catch (error) {
    console.error('❌ Failed to fetch shop data:', error);
  }

  return {
    apiKey: process.env.SHOPIFY_API_KEY || "",
    shopLocale,
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
      <Link to="/app/integration">{t("navmenu_integration", "Integration")}</Link>
    </NavMenu>
  );
}

export default function App() {
  const { apiKey, shopLocale } = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  const isNavigating = navigation.state === "loading";

  // Set shop locale for i18n detection when component mounts or shopLocale changes
  useEffect(() => {
    if (shopLocale) {
      log('🌍 Setting shop locale for i18n:', shopLocale);
      setShopLocale(shopLocale);
      // Change language if it's different from current
      import('../translations/i18n').then(({ default: i18n }) => {
        if (i18n.language !== shopLocale) {
          i18n.changeLanguage(shopLocale);
        }
      });
    }
  }, [shopLocale]);

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <NavigationMenu />
      <Suspense fallback={null}>{/* or a Spinner if desired */}
      {isNavigating ? null : <Outlet />}
      </Suspense>
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

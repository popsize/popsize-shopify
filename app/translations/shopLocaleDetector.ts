// Shop Locale Detector for i18next
// This plugin tries to get the locale from Shopify shop data before falling back to other detection methods

import type { LanguageDetectorModule } from 'i18next';

// Store shop locale globally so it can be accessed by the detector
let shopLocale: string | null = null;

export const setShopLocale = (locale: string | null) => {
  shopLocale = locale;
};

export const getShopLocale = () => shopLocale;

const ShopLocaleDetector: LanguageDetectorModule = {
  type: 'languageDetector',
  
  init() {
    // Initialization if needed
  },
  
  detect() {
    // Return shop locale if available, otherwise return undefined to let other detectors handle it
    if (shopLocale) {
      console.log('🌍 Using shop locale:', shopLocale);
      return shopLocale;
    }
    console.log('🌍 No shop locale found, falling back to browser detection');
    return undefined;
  },
  
  cacheUserLanguage() {
    // We don't need to cache the shop locale as it comes from the server
  }
};

export default ShopLocaleDetector;
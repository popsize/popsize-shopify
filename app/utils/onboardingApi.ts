// This code is licensed under the GNU Affero General Public License.
// Author: Nicolas Micaux

/**
 * Utility function for making onboarding API calls with proper shop name resolution
 */

export const makeOnboardingApiCall = async (apiEndpoint: string) => {
  try {
    // Fetch admin base URL using the shop-info API
    const response = await fetch('/api/shop-info', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    const data = await response.json();

    if (data.error) {
      alert("Error fetching shop info: " + data.error + (data.details ? " - " + data.details : ""));
      return false;
    }

    const adminBaseUrl = data.adminBaseUrl;

    if (!adminBaseUrl) {
      alert("Admin base URL not found in response.");
      return false;
    }

    // Extract shop domain from admin base URL (e.g., popsize-dev-store.myshopify.com)
    const shopDomain = adminBaseUrl.match(/https:\/\/([^\/]+)/)?.[1];
    
    if (!shopDomain) {
      alert("Failed to extract shop domain from admin base URL.");
      return false;
    }

    const apiResponse = await fetch(`${apiEndpoint}?shop=${shopDomain}`, { method: "POST" });

    if (!apiResponse.ok) {
      alert("Failed to save data to Shopify.");
      return false;
    }

    return true;
  } catch (error) {
    alert("Failed to complete onboarding step: " + error);
    return false;
  }
};
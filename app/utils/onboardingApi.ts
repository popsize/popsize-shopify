/**
 * Utility function for making onboarding API calls with proper shop name resolution
 */

export const makeOnboardingApiCall = async (apiEndpoint: string) => {
  try {
    // Fetch shop name using the standard GraphQL shop query
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

    const shop = data.shop?.name?.replace(/\s+/g, '-');

    if (!shop) {
      alert("Shop name not found in response.");
      return false;
    }

    const apiResponse = await fetch(`${apiEndpoint}?shop=${shop}`, { method: "POST" });

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
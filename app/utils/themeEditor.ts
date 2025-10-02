/**
 * Utility function for opening Shopify admin pages with proper shop name resolution
 */

export const openAdminPage = async (path: string) => {
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
      return;
    }

    const adminBaseUrl = data.adminBaseUrl;

    if (!adminBaseUrl) {
      alert("Admin base URL not found in response.");
      return;
    }

    // Construct URL with the provided path
    const urlToOpen = `${adminBaseUrl}${path}`;

    window.open(urlToOpen, "_blank");
    return true; // Success indicator
  } catch (error) {
    alert("Failed to open theme editor: " + error);
    return false;
  }
};
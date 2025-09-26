/**
 * Utility function for opening Shopify admin pages with proper shop name resolution
 */

export const openAdminPage = async (path: string) => {
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
      return;
    }

    const shopName = data.shop?.name?.replace(/\s+/g, '-');

    if (!shopName) {
      alert("Shop name not found in response.");
      return;
    }

    // Construct URL with the provided path
    const urlToOpen = `https://admin.shopify.com/store/${shopName}/${path}`;

    window.open(urlToOpen, "_blank");
    return true; // Success indicator
  } catch (error) {
    alert("Failed to open theme editor: " + error);
    return false;
  }
};
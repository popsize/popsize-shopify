# Popsize Shopify App & Theme Extension

This repository contains a Shopify app (built with Remix) and a Shopify Theme App Extension for integrating the Popsize sizing widget into Shopify stores. The app allows merchants to configure their Popsize Partner ID and injects the Popsize widget into their storefront via theme app blocks or app embeds.

---

## Features

- **Admin UI**: Merchants can set and save their Popsize Partner ID.
- **Theme App Extension**: 
  - **App Embed**: Injects the Popsize widget globally (head/footer) on all product pages.
  - **Blocks**: Merchants can add the Popsize widget or placement block to specific locations on product pages via the theme editor.
- **Tutorial**: Built-in onboarding instructions for merchants.

---

## Quick Start for Contributors

### Prerequisites

- **Node.js** (v18+ recommended): [Download here](https://nodejs.org/en/download/)
- **Shopify Partner Account**: [Sign up](https://partners.shopify.com/signup)
- **Development Store**: [Create one](https://shopify.dev/docs/apps/tools/cli/testing/development-stores)
- **Shopify CLI**: [Install instructions](https://shopify.dev/docs/api/shopify-cli) (beware: install differs for macOS)

---

### Setup

1. **Install dependencies**

   ```sh
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

2. **Start local development**

   ```sh
   npm run dev
   # or
   shopify app dev --config dev
   ```

   - This will start the Remix app and serve the theme extension for your development store.
   - Follow the CLI prompts to open your app in your test store and install it.

---

## How to Test the Popsize Widget in a Store

2. **Enable the widget on product pages**
   - Go to your [Shopify admin → Online Store → Themes](/admin/themes).
   - Click [Customize](/admin/themes/current/editor) on your live theme.
   - In the theme editor, use the dropdown at the top to select **Products > Default product**.

   **To inject the widget (head/footer):**
   - In the left panel, click **Add block** and add **Popsize Widget**.
   - This will inject the Popsize widget globally on all product pages.

   **To place the widget at a specific spot:**
   - In the left panel, click **Add block** where you want the widget to appear.
   - Select **Popsize Placement** from the list.
   - Drag to position as desired and click **Save**.

   > 💡 **Tip:** Use the app embed for global injection (head/footer), or the placement block for precise placement on your product pages.

---

## Project Structure

```
/app                  # Remix app (admin UI, API, etc.)
/extensions/popsize   # Theme app extension
  /assets             # For app embed (global injection)
    main.liquid
  /blocks             # For merchant-placed blocks
    popsize-widget.liquid
    popsize-placement.liquid
  shopify.extension.toml
```

---

## Contributing

We welcome contributions! Please follow these steps:
1. **Fork the repository** on GitHub.
2. **Clone your fork** to your local machine
3. **Create a new branch** for your feature or fix:
   ```sh
   git checkout -b my-feature-branch
   ```
4. **Make your changes** and ensure they follow Shopify coding standards.
6. **Create a pull request** on GitHub against the `dev` branch of this repository.
7. **Follow the PR template** to describe your changes and any relevant context.
8. **Wait for review**: We will review your PR and provide feedback or merge it.

### Common Tasks

- **Deploy extension**:  
  Run `shopify app deploy` to push changes to Shopify.

- **Deploy backend**:
```bash
gcloud config set project popsizeshopify
gcloud builds submit --tag gcr.io/popsizeshopify/app-backend
gcloud run deploy app-backend \
  --image gcr.io/popsizeshopify/app-backend \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated
```

---

## Resources

- [Shopify App Development Docs](https://shopify.dev/docs/apps)
- [Theme App Extensions](https://shopify.dev/docs/apps/online-store/theme-app-extensions)
- [Remix Framework](https://remix.run/docs/en/main)
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli)

---

## License

AGPL 3.0 License. See [LICENSE](LICENSE) for details.

---

**Happy contributing!**
# Copilot Instructions for Popsize Shopify App

## Project Overview

**Popsize Shopify App** is a Shopify app and theme extension for integrating the Popsize widget into Shopify stores.

## Repository Structure

```
popsize_shopify/
├── app/                  # Remix app code
├── extensions/           # Theme extensions
├── package.json          # Dependencies
├── README.md             # Setup and testing guide
└── Other Shopify files
```

## Coding Standards

- Use modern ES6+ syntax
- TypeScript for type safety
- Follow Shopify app best practices
- Use ESLint and Prettier

### Testing
- Test in development store
- Ensure theme extension works correctly

## Main Libraries Used

- Remix for the app framework
- Shopify CLI for development
- React for UI

### Common Commands

```bash
# Install dependencies
npm install

# Start development
npm run dev

# Deploy
shopify app deploy
gcloud config set project popsizeshopify
gcloud builds submit --tag gcr.io/popsizeshopify/app-backend
gcloud run deploy app-backend \
  --image gcr.io/popsizeshopify/app-backend \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated
```

# Vercel Configuration Guide

This repository has been configured to support automatic deployments via Vercel using GitHub Actions.

## Automated Deployment Strategy

Two GitHub Actions workflows have been created to manage the deployments:
1. `.github/workflows/vercel-production.yml` - Triggers on push to `main` branch (Production)
2. `.github/workflows/vercel-preview.yml` - Triggers on push to `develop` branch (Preview)

## Action Required: Setup Secrets

To enable the deployments, you must configure the following secrets in your GitHub repository (**Settings -> Secrets and variables -> Actions**):

- `VERCEL_TOKEN`: A Vercel personal access token (create one at https://vercel.com/account/tokens)
- `VERCEL_ORG_ID`: Your Vercel Organization ID (found in Vercel Project Settings)
- `VERCEL_PROJECT_ID`: Your Vercel Project ID (found in Vercel Project Settings)

## Vercel Native Integration (Alternative)

If you prefer to use the Vercel GitHub App instead of GitHub Actions:
1. Go to the [Vercel Dashboard](https://vercel.com/).
2. Click **Add New** -> **Project**.
3. Import the `BowenMichael/f1-frontend` repository.
4. Vercel will automatically configure `main` for Production deployments.
5. Pushes to `develop` (and all other branches) will automatically generate Preview deployments.
6. (Optional) You can delete the `.github/workflows/vercel-*.yml` files if you use this native integration.

## Visual Verification

Once deployed, you can view your deployments on the Vercel Dashboard. The `README.md` has also been updated with a Vercel deployment badge placeholder.

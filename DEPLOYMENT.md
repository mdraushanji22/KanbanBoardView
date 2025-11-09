# Deploying to Render

This document explains how to deploy the Kanban Board project to Render.

## Prerequisites

1. A Render account (sign up at [render.com](https://render.com))
2. This repository pushed to GitHub, GitLab, or Bitbucket

## Deployment Steps

1. Go to your Render Dashboard
2. Click "New" and select "Static Site"
3. Connect your repository
4. Configure the following settings:
   - **Name**: Choose a name for your site
   - **Branch**: Select the branch you want to deploy (usually `main` or `master`)
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
5. Add the following environment variables (if needed):
   - None required for this project
6. Click "Create Static Site"

## Alternative Method Using render.yaml

If you've added the `render.yaml` file to your repository, Render will automatically detect and use it. The configuration in the file specifies:

- Build command: `npm run build`
- Publish directory: `dist`
- Route handling for SPA (Single Page Application)

## Manual Deployment

If you prefer to build locally and deploy manually:

1. Run `npm run build` to create the production build
2. Upload the contents of the `dist` folder to Render using the "Manual Deploy" option

## Environment Variables

This project doesn't require any environment variables for deployment. All configuration is handled through the build process.

## Troubleshooting

If you encounter issues during deployment:

1. Check the build logs in your Render dashboard
2. Ensure all dependencies are correctly listed in `package.json`
3. Verify the build command works locally by running `npm run build`
4. Make sure the `dist` directory is correctly generated

## Custom Domain

To use a custom domain:

1. In your Render dashboard, go to your site settings
2. Under "Custom Domains", add your domain
3. Follow Render's instructions to configure DNS records with your domain provider

## Redeployment

Render automatically redeploys your site whenever you push changes to the connected branch. You can also trigger manual deployments from the Render dashboard.
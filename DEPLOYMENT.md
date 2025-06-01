# Alwahes Deployment Guide

This guide provides instructions for deploying the Alwahes application and troubleshooting common issues.

## Prerequisites

- Node.js (v14 or higher)
- npm (v7 or higher)
- Vercel CLI (will be installed automatically if not present)

## Deployment Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Build the Application**
   ```bash
   npm run build
   ```

3. **Deploy to Vercel**
   ```bash
   # Run the deployment script
   ./scripts/deploy.sh
   ```
   
   Or manually:
   ```bash
   # Install Vercel CLI if not installed
   npm install -g vercel
   
   # Deploy
   vercel --prod
   ```

## Troubleshooting

### If the application doesn't load properly:

1. **Clear Service Workers and Caches**
   - Visit `/cleanup.html` on your deployed site (e.g., `https://alwahes.vercel.app/cleanup.html`)
   - Click the "Clean Cache" button
   - Refresh the page

2. **Force Update Service Worker**
   - Open browser developer tools (F12)
   - Go to the Application tab
   - Click on "Service Workers" in the left sidebar
   - Check "Update on reload"
   - Click "Unregister" on any registered service workers
   - Refresh the page

3. **Check Console for Errors**
   - Open browser developer tools (F12)
   - Check the Console and Network tabs for any errors

### Common Issues

1. **Blank Page on Load**
   - Clear browser cache and service workers
   - Check for JavaScript errors in the console
   - Ensure all environment variables are properly set in Vercel

2. **Service Worker Not Updating**
   - The service worker might be cached. Use the cleanup page or manually unregister it
   - Check the Network tab to ensure the service worker file is being loaded correctly

3. **Airtable Connection Issues**
   - Verify that the Airtable API key and base ID are correctly set in the environment variables
   - Check the browser console for any API errors

## Environment Variables

Make sure these environment variables are set in your Vercel project:

- `VITE_AIRTABLE_API_KEY`: Your Airtable API key
- `VITE_AIRTABLE_BASE_ID`: Your Airtable base ID
- `VITE_VERIFY_AIRTABLE`: Set to 'true' to verify Airtable connection on startup (optional)

## Manual Deployment

If the automated deployment fails, you can deploy manually:

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy to Vercel:
   ```bash
   # Login to Vercel (if not already logged in)
   vercel login
   
   # Deploy
   vercel --prod
   ```

## Rollback

If a deployment causes issues, you can rollback to a previous version:

1. Go to your Vercel dashboard
2. Select your project
3. Go to the "Deployments" tab
4. Find a previous working deployment
5. Click the three dots (...) and select "Redeploy"

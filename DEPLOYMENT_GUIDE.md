# Alwahes Deployment Guide

## Prerequisites
1. Node.js (v16 or higher)
2. npm (v8 or higher)
3. Git
4. Vercel CLI (optional)

## Fixing npm Cache and Permission Issues

If you encounter permission or cache issues, follow these steps:

### On macOS/Linux:

1. **Fix npm permissions** (run these commands one by one):
   ```bash
   # Remove global node_modules and cache
   sudo rm -rf /usr/local/lib/node_modules
   sudo rm -rf /usr/local/bin/npm
   
   # Remove npm cache directories
   rm -rf ~/.npm
   rm -rf ~/.npm/_logs
   rm -rf ~/.npm/_cacache
   
   # Reinstall Node.js using nvm (recommended) or download from nodejs.org
   # If using nvm:
   nvm install node --reinstall-packages-from=node
   nvm use node
   ```

2. **Set npm permissions correctly**:
   ```bash
   mkdir -p ~/.npm-global
   npm config set prefix '~/.npm-global'
   
   # Add to your shell config (~/.bashrc, ~/.zshrc, etc.)
   echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
   source ~/.zshrc  # or restart your terminal
   ```

### On Windows:

1. Run Command Prompt as Administrator
2. Run these commands:
   ```cmd
   rmdir /s /q %appdata%\npm-cache
   rmdir /s /q %appdata%\npm
   rmdir /s /q %appdata%\roaming\npm
   rmdir /s /q %appdata%\roaming\npm-cache
   ```
3. Reinstall Node.js from https://nodejs.org/

## Local Development Setup

1. **Clone the repository** (if not already cloned):
   ```bash
   git clone https://github.com/alwahis/alwahes.git
   cd alwahes
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory with:
   ```
   VITE_AIRTABLE_API_KEY=your_api_key_here
   VITE_AIRTABLE_BASE_ID=your_base_id_here
   VITE_VERIFY_AIRTABLE=true
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

## Building for Production

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Preview the production build locally**:
   ```bash
   npm run preview
   ```

## Deployment

### Option 1: Deploy to Vercel (Recommended)

1. **Install Vercel CLI** (if not installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy using GitHub

1. Push your code to a GitHub repository
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables:
   - `VITE_AIRTABLE_API_KEY`: Your Airtable API key
   - `VITE_AIRTABLE_BASE_ID`: Your Airtable base ID
   - `VITE_VERIFY_AIRTABLE`: `true` (optional)
6. Click "Deploy"

## Troubleshooting

### Service Worker Issues

If the app doesn't update after deployment:
1. Visit `https://your-vercel-app.vercel.app/cleanup.html`
2. Click "Clean Cache"
3. Refresh the page

### Common Errors

- **Module not found**: Try deleting `node_modules` and `package-lock.json`, then run `npm install`
- **Build errors**: Check the error message in the terminal and fix the reported issues
- **Blank page**: Check browser console for errors and verify all environment variables are set

## Maintenance

### Updating Dependencies

```bash
# Check for outdated packages
npm outdated

# Update a specific package
npm update package-name

# Update all packages (be cautious)
npm update
```

### Monitoring

- Check Vercel deployment logs in the Vercel dashboard
- Monitor Airtable API usage in your Airtable account
- Set up error tracking (e.g., Sentry) for production monitoring

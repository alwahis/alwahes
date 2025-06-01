#!/bin/bash

# Exit on error
set -e

echo "🧹 Cleaning up previous installations..."

# Remove local node_modules and lock files
rm -rf node_modules package-lock.json .npm

# Clear npm cache
echo "🧼 Cleaning npm cache..."
npm cache clean --force

# Install dependencies
echo "📦 Installing dependencies..."
npm install --no-package-lock --no-audit --no-fund

echo "✅ Done! You can now run the application with 'npm run dev'"

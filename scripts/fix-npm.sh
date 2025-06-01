#!/bin/bash

# Exit on error
set -e

echo "🔧 Fixing npm permissions and cleaning cache..."

# Remove global node_modules and cache
sudo rm -rf /usr/local/lib/node_modules
sudo rm -rf /usr/local/bin/npm
sudo rm -rf /usr/local/share/man/man1/node*

# Remove npm cache directories
rm -rf ~/.npm
rm -rf ~/.npm/_logs
rm -rf ~/.npm/_cacache

# Reinstall Node.js and npm using nvm (if available)
if command -v nvm &> /dev/null; then
    echo "🚀 Reinstalling Node.js and npm using nvm..."
    nvm install node --reinstall-packages-from=node
    nvm use node
else
    echo "⚠️  nvm not found. Please install nvm and try again."
    echo "   Visit: https://github.com/nvm-sh/nvm#installing-and-updating"
    exit 1
fi

# Verify installation
echo "✅ Node.js version: $(node -v)"
echo "✅ npm version: $(npm -v)"

# Fix npm permissions
echo "🔒 Fixing npm permissions..."
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'

echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc

echo "🎉 Done! Please restart your terminal or run:"
echo "   source ~/.bashrc  # or source ~/.zshrc"

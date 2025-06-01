#!/bin/bash

# Exit on error
set -e

echo "🚀 Fixing npm cache and permissions..."

# Backup npmrc if it exists
if [ -f ~/.npmrc ]; then
  echo "🔒 Backing up ~/.npmrc to ~/.npmrc.bak"
  cp ~/.npmrc ~/.npmrc.bak
fi

# Create a new npmrc with correct permissions
echo "🔧 Creating new npm configuration..."
cat > ~/.npmrc << 'EOL'
# Fix npm permissions
prefix = ${HOME}/.npm-global
cache = ${HOME}/.npm-cache
EOL

# Create necessary directories
echo "📂 Creating npm directories..."
mkdir -p ~/.npm-global
mkdir -p ~/.npm-cache

# Set npm to use the new directories
echo "⚙️  Updating npm configuration..."
npm config set prefix '~/.npm-global'
npm config set cache '~/.npm-cache'

# Update PATH in shell config
echo "🔄 Updating PATH in shell configuration..."
for rc_file in ~/.zshrc ~/.bashrc; do
  if [ -f "$rc_file" ]; then
    if ! grep -q "npm-global" "$rc_file"; then
      echo 'export PATH=~/.npm-global/bin:$PATH' >> "$rc_file"
      echo "  - Updated $rc_file"
    fi
  fi
done

# Clean up old npm cache
echo "🧹 Cleaning up old cache..."
npm cache clean --force || true

# Fix permissions
echo "🔑 Fixing permissions..."
chown -R $USER:$(id -gn) ~/.npm-global
chown -R $USER:$(id -gn) ~/.npm-cache

# Install npm globally
echo "📦 Reinstalling npm globally..."
npm install -g npm@latest

echo ""
echo "✅ Done! Please run the following command to apply changes:"
echo "   source ~/.zshrc  # or source ~/.bashrc"
echo ""
echo "Then try running your npm commands again."

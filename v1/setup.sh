#!/bin/bash

# Setup script for Streak Forge

set -e

echo "🔥 Streak Forge - Setup"
echo "======================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Installation complete!"
echo ""
echo "📖 Next steps:"
echo ""
echo "1. Create .env.local with GitHub token:"
echo "   echo 'GITHUB_TOKEN=ghp_xxxxxxxxxxxx' > .env.local"
echo ""
echo "2. Start development server:"
echo "   npm run dev"
echo ""
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "📚 For more details, see DEVELOPMENT.md"

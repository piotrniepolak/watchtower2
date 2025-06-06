#!/bin/bash

# Static Site Generation Script for Replit CMS
# This script generates a complete static version of your site

set -e

echo "🚀 Starting static site generation..."

# Check if Node.js script exists
if [ ! -f "scripts/static-generator.js" ]; then
    echo "❌ Static generator script not found!"
    exit 1
fi

# Run the static generator
node scripts/static-generator.js

echo "✅ Static site generation completed!"
echo "📁 Files generated in: static-dist/"
echo ""
echo "Next steps:"
echo "1. Review the generated files in static-dist/"
echo "2. Use ./upload.sh to deploy to your server"
echo "3. Set up ./sync.sh for automated updates"
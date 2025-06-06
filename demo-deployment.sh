#!/bin/bash

# Complete Deployment Demonstration
# This script shows the full workflow from Replit CMS to deployed static site

echo "📋 Geopolitical Intelligence Platform - Complete Deployment Demo"
echo "=============================================================="

# Step 1: Generate fresh static site
echo "Step 1: Generating static site with live data..."
node build-static-site.js

if [ $? -ne 0 ]; then
    echo "❌ Static site generation failed. Ensure Replit app is running."
    exit 1
fi

echo "✅ Static site generated successfully"

# Step 2: Show what was generated
echo ""
echo "Step 2: Generated files:"
echo "├── static-site/"
echo "│   ├── index.html (optimized static page)"
echo "│   ├── .htaccess (Apache configuration)"
echo "│   └── data/"
find static-site/data -name "*.json" | while read file; do
    echo "│       ├── $(basename "$file")"
done

# Step 3: Show data contents
echo ""
echo "Step 3: Sample of live data extracted:"
echo "Conflicts: $(jq length static-site/data/conflicts.json) active conflicts"
echo "Stocks: $(jq length static-site/data/stocks.json) defense stocks tracked"
echo "Latest stock update: $(jq -r '.generatedAt' static-site/data/build-info.json)"

# Step 4: Show deployment options
echo ""
echo "Step 4: Deployment options available:"
echo "✓ ./deploy-interactive.sh - Interactive deployment"
echo "✓ rsync - for VPS/dedicated servers"
echo "✓ S3 - for AWS hosting"
echo "✓ Netlify/Vercel - for serverless hosting"

# Step 5: Show automation setup
echo ""
echo "Step 5: Automation ready:"
echo "✓ auto-sync-configured.sh - for cron jobs"
echo "✓ verify-deployment.sh - for testing"
echo "✓ Server configs in server-configs/"

# Step 6: Show size and performance
echo ""
echo "Step 6: Performance metrics:"
SITE_SIZE=$(du -sh static-site/ | cut -f1)
FILE_COUNT=$(find static-site -type f | wc -l)
echo "Total size: $SITE_SIZE"
echo "File count: $FILE_COUNT files"
echo "Expected load time: < 2 seconds"

echo ""
echo "🎉 Deployment demo complete!"
echo ""
echo "Next steps:"
echo "1. Run: ./deploy-interactive.sh"
echo "2. Choose your deployment method"
echo "3. Set up automated sync with cron"
echo "4. Your geopolitical intelligence platform will be live!"

# Show a preview of the data
echo ""
echo "📊 Preview of live intelligence data:"
echo "Top active conflict: $(jq -r '.[0].name' static-site/data/conflicts.json)"
echo "Top performing stock: $(jq -r 'sort_by(.changePercent) | reverse | .[0].symbol' static-site/data/stocks.json) ($(jq -r 'sort_by(.changePercent) | reverse | .[0].changePercent' static-site/data/stocks.json)%)"
echo "Defense index change: $(jq -r '.defenseIndexChange' static-site/data/metrics.json)%"
#!/bin/bash

# Deployment Verification Script

SITE_URL=""
if [ ! -z "$1" ]; then
    SITE_URL="$1"
else
    read -p "Enter your site URL (https://yourdomain.com): " SITE_URL
fi

echo "🔍 Verifying deployment at: $SITE_URL"

# Check if site is accessible
response=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL")
if [ "$response" = "200" ]; then
    echo "✅ Site is accessible (HTTP 200)"
else
    echo "❌ Site returned HTTP $response"
    exit 1
fi

# Check if data is loading
if curl -s "$SITE_URL/data/conflicts.json" | jq . > /dev/null 2>&1; then
    echo "✅ Data files are accessible"
else
    echo "⚠️  Data files may not be accessible"
fi

# Check if essential files exist
essential_files=("/data/conflicts.json" "/data/stocks.json" "/data/metrics.json")
for file in "${essential_files[@]}"; do
    response=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL$file")
    if [ "$response" = "200" ]; then
        echo "✅ $file accessible"
    else
        echo "❌ $file not accessible (HTTP $response)"
    fi
done

echo "🎉 Verification complete"
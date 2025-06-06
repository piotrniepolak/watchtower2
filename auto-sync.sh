#!/bin/bash
# Automated sync script for periodic updates

echo "Starting sync at $(date)"

# Rebuild static site with latest data
node build-static-site.js

# Deploy (customize the line below for your server)
# ./deploy.sh rsync user@yourserver.com:/var/www/html
# ./deploy.sh s3 your-bucket-name

echo "Sync completed at $(date)"
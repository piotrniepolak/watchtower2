#!/bin/bash

# Automated Sync Script with Configuration
# Reads settings from deployment.json

CONFIG_FILE="deployment.json"
LOG_FILE="sync.log"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "Starting automated sync"

# Check if config file exists
if [ ! -f "$CONFIG_FILE" ]; then
    log "ERROR: Configuration file not found. Run deployment-config.js first."
    exit 1
fi

# Generate fresh static site
log "Generating fresh static site from Replit data"
node build-static-site.js
if [ $? -ne 0 ]; then
    log "ERROR: Static site generation failed"
    exit 1
fi

# Read deployment method from config (you'll need to customize this)
# For now, using rsync as default - modify based on your preferred method

# Example: Deploy using rsync (modify server details)
# rsync -avz --delete ./static-site/ user@yourserver.com:/var/www/html/

log "Sync completed successfully"

# Optional: Send notification (uncomment and configure)
# curl -X POST -H 'Content-type: application/json' \
#   --data '{"text":"Geopolitical Intelligence Platform updated"}' \
#   YOUR_SLACK_WEBHOOK_URL

log "Automated sync finished"
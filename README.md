# Geopolitical Intelligence Platform - Static Deployment

## Quick Start

1. **Generate Static Site**
   ```bash
   node build-static-site.js
   ```

2. **Deploy to Your Server**
   ```bash
   # For rsync deployment
   ./deploy.sh rsync user@yourserver.com:/var/www/html
   
   # For S3 deployment
   ./deploy.sh s3 your-bucket-name
   
   # For SCP deployment
   ./deploy.sh scp user@yourserver.com:/var/www/html
   ```

3. **Set Up Automated Updates**
   Edit auto-sync.sh and add to cron:
   ```bash
   # Sync every 6 hours
   0 */6 * * * cd /path/to/project && ./auto-sync.sh >> sync.log 2>&1
   ```

## Files Generated

- `static-site/` - Complete static website
- `static-site/data/` - Live data from Replit CMS
- `static-site/index.html` - Optimized static HTML
- `deploy.sh` - Upload script
- `auto-sync.sh` - Automated sync script

The static site includes real-time conflict data, defense stock prices, and AI-generated intelligence summaries extracted from your Replit CMS.
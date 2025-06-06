# Quick Deployment Guide - Geopolitical Intelligence Platform

## Complete Workflow: Replit CMS → Static Site → Your Server

### Step 1: Generate Fresh Static Site (30 seconds)

```bash
# Extract latest data from your running Replit app
node build-static-site.js
```

This creates `static-site/` with:
- Live conflict data from your Replit database
- Real-time defense stock prices
- AI-generated intelligence summaries
- Optimized static HTML/CSS/JS

### Step 2: Deploy to Your Server

Choose your deployment method:

#### Option A: VPS/Dedicated Server (SSH)
```bash
# Interactive deployment
./deploy-interactive.sh
# Choose option 1 (rsync) and enter your server details

# Or direct command:
rsync -avz --delete ./static-site/ user@yourserver.com:/var/www/html/
```

#### Option B: Amazon S3
```bash
# Interactive deployment
./deploy-interactive.sh
# Choose option 2 (S3) and enter bucket name

# Or direct command:
aws s3 sync ./static-site/ s3://your-bucket-name/ --delete
```

#### Option C: Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=./static-site
```

#### Option D: Vercel
```bash
npm install -g vercel
vercel --prod ./static-site
```

### Step 3: Verify Deployment

```bash
./verify-deployment.sh https://yourdomain.com
```

### Step 4: Set Up Automated Updates

1. **Edit auto-sync script:**
```bash
nano auto-sync-configured.sh
# Uncomment and configure your preferred deployment method
```

2. **Add to cron for automatic updates:**
```bash
crontab -e
# Add this line for updates every 6 hours:
0 */6 * * * cd /path/to/your/replit/project && ./auto-sync-configured.sh
```

## Server Configuration

### For Apache Servers
Copy `server-configs/apache-vhost.conf` to your Apache configuration and modify domain names.

### For Nginx Servers
Copy `server-configs/nginx-site.conf` to `/etc/nginx/sites-available/` and enable it.

### For Cloudflare
Use settings from `server-configs/cloudflare-settings.txt` in your Cloudflare dashboard.

## Complete Automation Example

### Daily Automated Sync Script
```bash
#!/bin/bash
# Add this to cron: 0 2 * * * /path/to/this/script.sh

cd /path/to/your/replit/project

# Generate fresh static site
node build-static-site.js

# Deploy (customize for your server)
rsync -avz --delete ./static-site/ user@yourserver.com:/var/www/html/

# Log the update
echo "$(date): Site updated successfully" >> deployment.log
```

## What Gets Deployed

Your static site includes authentic data from your Replit CMS:

1. **Real-time conflict intelligence** - Ukraine-Russia conflict, Middle East tensions, etc.
2. **Live defense stock data** - LMT, RTX, NOC, GD, BA prices and changes
3. **Market metrics** - Defense index performance, volatility indicators
4. **AI-generated content** - Daily news summaries, conflict predictions
5. **Interactive features** - Working in static mode with pre-loaded data

## Troubleshooting

### Common Issues:

**Build fails:** Ensure your Replit app is running and accessible
```bash
curl http://localhost:5000/api/conflicts
```

**SSH deployment fails:** Check SSH keys and server permissions
```bash
ssh user@yourserver.com "ls -la /var/www/"
```

**Data not loading:** Verify data files are accessible
```bash
curl https://yourdomain.com/data/conflicts.json
```

### File Permissions
Ensure your web server can read the files:
```bash
chmod -R 644 /var/www/html/
chmod 755 /var/www/html/
```

## Performance Optimization

The static site is already optimized with:
- Compressed JSON data files
- Cached static assets
- Optimized HTML/CSS
- CDN-friendly structure

Expected load times: < 2 seconds on standard hosting.

## Security

Your static deployment includes:
- No server-side vulnerabilities
- HTTPS-ready configuration
- Security headers in server configs
- No database dependencies

The static site contains only public intelligence data - no sensitive API keys or credentials are exposed.
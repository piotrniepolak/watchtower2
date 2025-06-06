#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function configureDeployment() {
  console.log('🚀 Deployment Configuration Setup');
  console.log('=================================\n');

  // Create deployment configuration
  const config = {
    siteName: "Geopolitical Intelligence Platform",
    description: "Real-time conflict analysis and defense market intelligence",
    buildDirectory: "./static-site",
    syncInterval: "*/6 * * * *", // Every 6 hours
    deploymentMethods: {
      rsync: {
        enabled: false,
        server: "user@yourserver.com",
        path: "/var/www/html",
        options: "-avz --delete"
      },
      s3: {
        enabled: false,
        bucket: "your-bucket-name",
        region: "us-east-1",
        profile: "default"
      },
      scp: {
        enabled: false,
        server: "user@yourserver.com",
        path: "/var/www/html"
      },
      netlify: {
        enabled: false,
        siteId: "your-netlify-site-id"
      },
      vercel: {
        enabled: false,
        projectName: "geopolitical-intelligence"
      }
    }
  };

  await fs.writeFile('deployment.json', JSON.stringify(config, null, 2));

  // Create interactive deployment script
  const deployScript = `#!/bin/bash

# Interactive Deployment Script
# Generated for Geopolitical Intelligence Platform

CONFIG_FILE="deployment.json"
SITE_DIR="./static-site"

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
NC='\\033[0m' # No Color

echo -e "\${BLUE}🚀 Geopolitical Intelligence Platform Deployment\${NC}"
echo -e "\${BLUE}================================================\${NC}"

# Check if site is built
if [ ! -d "$SITE_DIR" ]; then
    echo -e "\${RED}❌ Static site not found. Building now...\${NC}"
    node build-static-site.js
    if [ $? -ne 0 ]; then
        echo -e "\${RED}❌ Build failed. Please check your Replit app is running.\${NC}"
        exit 1
    fi
fi

# Show deployment options
echo -e "\${YELLOW}Select deployment method:\${NC}"
echo "1) rsync (SSH deployment to VPS/Dedicated server)"
echo "2) S3 (Amazon S3 bucket)"
echo "3) SCP (Simple copy via SSH)"
echo "4) Netlify (Netlify hosting)"
echo "5) Vercel (Vercel hosting)"
echo "6) Custom command"
echo "7) Test deployment (dry run)"

read -p "Enter choice [1-7]: " choice

case $choice in
    1)
        read -p "Enter server (user@hostname): " server
        read -p "Enter path (/var/www/html): " remote_path
        remote_path=\${remote_path:-/var/www/html}
        
        echo -e "\${BLUE}Deploying to $server:$remote_path via rsync...\${NC}"
        rsync -avz --delete --progress "$SITE_DIR/" "$server:$remote_path/"
        if [ $? -eq 0 ]; then
            echo -e "\${GREEN}✅ Deployment successful!\${NC}"
            echo "Your site is now live at your server."
        else
            echo -e "\${RED}❌ Deployment failed. Check SSH access and permissions.\${NC}"
        fi
        ;;
    2)
        read -p "Enter S3 bucket name: " bucket
        read -p "Enter AWS profile [default]: " profile
        profile=\${profile:-default}
        
        echo -e "\${BLUE}Deploying to S3 bucket: $bucket\${NC}"
        aws s3 sync "$SITE_DIR/" "s3://$bucket/" --delete --profile "$profile"
        if [ $? -eq 0 ]; then
            echo -e "\${GREEN}✅ Deployment successful!\${NC}"
            echo "Your site is available at: https://$bucket.s3-website-us-east-1.amazonaws.com"
        else
            echo -e "\${RED}❌ Deployment failed. Check AWS credentials and bucket permissions.\${NC}"
        fi
        ;;
    3)
        read -p "Enter server (user@hostname): " server
        read -p "Enter path (/var/www/html): " remote_path
        remote_path=\${remote_path:-/var/www/html}
        
        echo -e "\${BLUE}Deploying to $server:$remote_path via SCP...\${NC}"
        scp -r "$SITE_DIR"/* "$server:$remote_path/"
        if [ $? -eq 0 ]; then
            echo -e "\${GREEN}✅ Deployment successful!\${NC}"
        else
            echo -e "\${RED}❌ Deployment failed. Check SSH access.\${NC}"
        fi
        ;;
    4)
        echo -e "\${BLUE}Deploying to Netlify...\${NC}"
        if command -v netlify &> /dev/null; then
            netlify deploy --prod --dir="$SITE_DIR"
            if [ $? -eq 0 ]; then
                echo -e "\${GREEN}✅ Deployment successful!\${NC}"
            fi
        else
            echo -e "\${RED}❌ Netlify CLI not installed. Run: npm install -g netlify-cli\${NC}"
        fi
        ;;
    5)
        echo -e "\${BLUE}Deploying to Vercel...\${NC}"
        if command -v vercel &> /dev/null; then
            vercel --prod "$SITE_DIR"
            if [ $? -eq 0 ]; then
                echo -e "\${GREEN}✅ Deployment successful!\${NC}"
            fi
        else
            echo -e "\${RED}❌ Vercel CLI not installed. Run: npm install -g vercel\${NC}"
        fi
        ;;
    6)
        read -p "Enter custom deployment command: " custom_cmd
        echo -e "\${BLUE}Running: $custom_cmd\${NC}"
        eval "$custom_cmd"
        ;;
    7)
        echo -e "\${YELLOW}🧪 Test deployment (dry run)\${NC}"
        echo "Site directory: $SITE_DIR"
        echo "Files to deploy:"
        find "$SITE_DIR" -type f | head -10
        echo "..."
        echo "Total files: $(find "$SITE_DIR" -type f | wc -l)"
        echo "Total size: $(du -sh "$SITE_DIR" | cut -f1)"
        ;;
    *)
        echo -e "\${RED}Invalid choice. Exiting.\${NC}"
        exit 1
        ;;
esac

echo -e "\${BLUE}Deployment completed at $(date)\${NC}"`;

  await fs.writeFile('deploy-interactive.sh', deployScript);
  await fs.chmod('deploy-interactive.sh', 0o755);

  // Create automated sync configuration
  const autoSyncScript = `#!/bin/bash

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
# curl -X POST -H 'Content-type: application/json' \\
#   --data '{"text":"Geopolitical Intelligence Platform updated"}' \\
#   YOUR_SLACK_WEBHOOK_URL

log "Automated sync finished"`;

  await fs.writeFile('auto-sync-configured.sh', autoSyncScript);
  await fs.chmod('auto-sync-configured.sh', 0o755);

  // Create server-specific configuration files
  await createServerConfigs();

  // Create deployment verification script
  const verifyScript = `#!/bin/bash

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
for file in "\${essential_files[@]}"; do
    response=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL$file")
    if [ "$response" = "200" ]; then
        echo "✅ $file accessible"
    else
        echo "❌ $file not accessible (HTTP $response)"
    fi
done

echo "🎉 Verification complete"`;

  await fs.writeFile('verify-deployment.sh', verifyScript);
  await fs.chmod('verify-deployment.sh', 0o755);

  // Create README with deployment instructions
  const readme = `# Deployment Configuration Complete

Your deployment system is now configured. Here's what was created:

## Generated Files

1. **deploy-interactive.sh** - Interactive deployment script with multiple options
2. **auto-sync-configured.sh** - Automated sync script for cron jobs
3. **verify-deployment.sh** - Script to verify your deployment
4. **deployment.json** - Configuration file (edit as needed)
5. **Server configuration files** in \`server-configs/\` directory

## Quick Start

### 1. Choose Your Deployment Method

Run the interactive deployer:
\`\`\`bash
./deploy-interactive.sh
\`\`\`

### 2. Common Deployment Scenarios

**For VPS/Dedicated Server:**
\`\`\`bash
# Using rsync (recommended)
rsync -avz --delete ./static-site/ user@yourserver.com:/var/www/html/

# Using SCP (alternative)
scp -r ./static-site/* user@yourserver.com:/var/www/html/
\`\`\`

**For AWS S3:**
\`\`\`bash
aws s3 sync ./static-site/ s3://your-bucket-name/ --delete
\`\`\`

**For Netlify:**
\`\`\`bash
npm install -g netlify-cli
netlify deploy --prod --dir=./static-site
\`\`\`

### 3. Set Up Automated Updates

Edit \`auto-sync-configured.sh\` with your deployment details, then add to cron:
\`\`\`bash
# Edit crontab
crontab -e

# Add line for every 6 hours:
0 */6 * * * cd /path/to/your/replit/project && ./auto-sync-configured.sh

# Or daily at 2 AM:
0 2 * * * cd /path/to/your/replit/project && ./auto-sync-configured.sh
\`\`\`

### 4. Verify Deployment

After deploying:
\`\`\`bash
./verify-deployment.sh https://yourdomain.com
\`\`\`

## Server Configuration

Check the \`server-configs/\` directory for:
- Apache .htaccess file
- Nginx configuration
- Cloudflare settings
- SSL/HTTPS setup instructions

## Customization

Edit \`deployment.json\` to configure:
- Deployment methods
- Server details
- Sync intervals
- Site settings

Your static site includes live data from your Replit CMS:
- Real-time conflict intelligence
- Defense stock market data
- AI-generated analysis
- Daily news and quizzes

The system automatically extracts fresh data from your Replit application and creates optimized static files for deployment.`;

  await fs.writeFile('DEPLOYMENT_SETUP.md', readme);

  console.log('✅ Deployment configuration complete!');
  console.log('\nGenerated files:');
  console.log('- deploy-interactive.sh (run this to deploy)');
  console.log('- auto-sync-configured.sh (for automated updates)');
  console.log('- verify-deployment.sh (to test deployment)');
  console.log('- deployment.json (configuration file)');
  console.log('- DEPLOYMENT_SETUP.md (complete instructions)');
  console.log('\nNext step: Run ./deploy-interactive.sh to deploy your site');
}

async function createServerConfigs() {
  const configDir = 'server-configs';
  await fs.mkdir(configDir, { recursive: true });

  // Apache configuration
  const apacheConfig = `# Apache Virtual Host Configuration
# Place this in your Apache sites-available directory

<VirtualHost *:80>
    ServerName yourdomain.com
    ServerAlias www.yourdomain.com
    DocumentRoot /var/www/html
    
    # Redirect all requests to index.html for client-side routing
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
    
    # Cache static assets
    <LocationMatch "\\.(js|css|png|jpg|jpeg|gif|ico|svg)$">
        ExpiresActive On
        ExpiresDefault "access plus 1 year"
        Header append Cache-Control "public, immutable"
    </LocationMatch>
    
    # Cache data files for shorter period
    <LocationMatch "\\.json$">
        ExpiresActive On
        ExpiresDefault "access plus 6 hours"
        Header append Cache-Control "public"
    </LocationMatch>
    
    # Security headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    
    ErrorLog \${APACHE_LOG_DIR}/geopolitical-intel_error.log
    CustomLog \${APACHE_LOG_DIR}/geopolitical-intel_access.log combined
</VirtualHost>

# HTTPS Virtual Host (with SSL)
<VirtualHost *:443>
    ServerName yourdomain.com
    ServerAlias www.yourdomain.com
    DocumentRoot /var/www/html
    
    SSLEngine on
    SSLCertificateFile /path/to/your/certificate.crt
    SSLCertificateKeyFile /path/to/your/private.key
    
    # Same rules as HTTP version
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
    
    # Cache and security headers (same as above)
</VirtualHost>`;

  await fs.writeFile(path.join(configDir, 'apache-vhost.conf'), apacheConfig);

  // Nginx configuration
  const nginxConfig = `# Nginx Server Configuration
# Place this in /etc/nginx/sites-available/

server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    root /var/www/html;
    index index.html;
    
    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Client-side routing support
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # Cache data files
    location ~* \\.json$ {
        expires 6h;
        add_header Cache-Control "public";
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
    
    access_log /var/log/nginx/geopolitical-intel_access.log;
    error_log /var/log/nginx/geopolitical-intel_error.log;
}`;

  await fs.writeFile(path.join(configDir, 'nginx-site.conf'), nginxConfig);

  // Cloudflare configuration
  const cloudflareConfig = `# Cloudflare Page Rules Configuration
# Configure these in your Cloudflare dashboard

1. Cache Everything
   URL Pattern: yourdomain.com/*
   Settings:
   - Cache Level: Cache Everything
   - Edge Cache TTL: 2 hours
   - Browser Cache TTL: 4 hours

2. Cache Static Assets
   URL Pattern: yourdomain.com/*.{js,css,png,jpg,jpeg,gif,ico,svg}
   Settings:
   - Cache Level: Cache Everything
   - Edge Cache TTL: 1 month
   - Browser Cache TTL: 1 month

3. Cache Data Files
   URL Pattern: yourdomain.com/data/*.json
   Settings:
   - Cache Level: Cache Everything
   - Edge Cache TTL: 6 hours
   - Browser Cache TTL: 6 hours

4. Force HTTPS
   URL Pattern: http://yourdomain.com/*
   Settings:
   - Always Use HTTPS: On

# Security Settings (in Cloudflare Security tab):
- Security Level: Medium
- Challenge Passage: 30 minutes
- Browser Integrity Check: On
- Privacy Pass: On

# SSL/TLS Settings:
- SSL/TLS encryption mode: Full (strict)
- Minimum TLS Version: 1.2
- TLS 1.3: Enabled
- Automatic HTTPS Rewrites: On
- Certificate Transparency Monitoring: On`;

  await fs.writeFile(path.join(configDir, 'cloudflare-settings.txt'), cloudflareConfig);

  // SSL/Let's Encrypt setup
  const sslSetup = `# SSL Certificate Setup with Let's Encrypt

## For Apache:
sudo apt update
sudo apt install certbot python3-certbot-apache
sudo certbot --apache -d yourdomain.com -d www.yourdomain.com

## For Nginx:
sudo apt update
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

## Manual certificate renewal test:
sudo certbot renew --dry-run

## Automatic renewal (already set up by certbot):
# Cron job in /etc/cron.d/certbot:
# 0 */12 * * * root test -x /usr/bin/certbot -a \\! -d /run/systemd/system && perl -e 'sleep int(rand(43200))' && certbot -q renew

## CloudFlare SSL (if using CloudFlare):
1. Go to SSL/TLS tab in CloudFlare dashboard
2. Set encryption mode to "Full (strict)"
3. Enable "Always Use HTTPS"
4. Enable "HTTP Strict Transport Security (HSTS)"`;

  await fs.writeFile(path.join(configDir, 'ssl-setup.md'), sslSetup);
}

configureDeployment().catch(console.error);
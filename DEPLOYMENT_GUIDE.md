# Static Site Deployment Guide

This guide explains how to use Replit as a CMS while hosting your static site on your own server.

## Overview

Your geopolitical intelligence platform can now operate in two modes:
- **Dynamic Mode**: Full-featured app running on Replit (for editing and content management)
- **Static Mode**: Pre-generated static files hosted on your server (for public access)

## Quick Start

### 1. Generate Static Site

```bash
# Run this command in Replit to generate static files
./generate-static.sh
```

This creates a `static-dist/` directory containing:
- Complete static website files
- Pre-generated data in `/data/` folder
- All assets and configurations

### 2. Deploy to Your Server

Choose your deployment method:

#### Option A: rsync (Recommended for VPS/Dedicated servers)
```bash
./upload.sh rsync user@yourserver.com:/var/www/html
```

#### Option B: SCP (Alternative for SSH access)
```bash
./upload.sh scp user@yourserver.com:/var/www/html
```

#### Option C: Amazon S3
```bash
./upload.sh s3 your-bucket-name
```

#### Option D: Netlify
```bash
./upload.sh netlify
```

#### Option E: Vercel
```bash
./upload.sh vercel
```

### 3. Set Up Automated Sync

Edit `sync.sh` to configure your preferred deployment method:

```bash
# Uncomment and modify the appropriate line:
./upload.sh rsync user@yourserver.com:/var/www/html
```

Then set up automated sync using cron:

```bash
# Edit crontab
crontab -e

# Add one of these lines:
# Sync every hour:
0 * * * * cd /path/to/your/replit/project && ./sync.sh >> sync.log 2>&1

# Sync every 6 hours:
0 */6 * * * cd /path/to/your/replit/project && ./sync.sh >> sync.log 2>&1

# Sync daily at 2 AM:
0 2 * * * cd /path/to/your/replit/project && ./sync.sh >> sync.log 2>&1
```

## How It Works

### CMS Workflow (Replit)

1. **Content Creation**: Use the full dynamic site on Replit to:
   - Manage conflicts and stock data
   - Generate AI analysis and predictions
   - Update configurations and settings
   - Create daily news and quizzes

2. **Static Generation**: When ready to publish changes:
   - Run `./generate-static.sh`
   - The system extracts all dynamic data into JSON files
   - Builds an optimized static version of the site

3. **Deployment**: Upload the static files to your server using the upload scripts

### Static Site Features

The static version includes:
- All current conflict and stock data
- Latest AI analysis and predictions
- Interactive charts and visualizations
- Responsive design and dark mode
- Search and filtering capabilities
- Daily news and quiz content

### Data Updates

The static site automatically detects it's in static mode and:
- Loads data from pre-generated JSON files instead of API calls
- Disables real-time updates and user interactions
- Shows a "last updated" timestamp
- Provides fallback data if files are missing

## File Structure

```
static-dist/
├── index.html                 # Main entry point
├── assets/                    # Compiled CSS/JS and images
├── data/                      # Pre-generated data files
│   ├── metadata.json         # Build information
│   ├── conflicts.json        # Conflict data
│   ├── stocks.json           # Stock market data
│   ├── metrics.json          # Dashboard metrics
│   ├── notifications.json    # System notifications
│   ├── news.json             # Daily news content
│   └── quiz.json             # Daily quiz content
└── [other static assets]
```

## Server Requirements

### Minimum Requirements
- Web server (Apache, Nginx, or similar)
- Static file serving capability
- HTTPS support (recommended)

### Recommended Setup
```nginx
# Nginx configuration example
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/html;
    index index.html;

    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Cache data files for shorter period
    location /data/ {
        expires 6h;
        add_header Cache-Control "public";
    }
}
```

## Customization

### Update Frequency
Modify `static-config.json` to change data extraction endpoints and sync intervals.

### Deployment Targets
Edit the upload scripts to add custom deployment methods or modify existing ones.

### Build Process
The static generator can be customized by modifying `scripts/static-generator.js`.

## Troubleshooting

### Common Issues

1. **Build Fails**: Ensure all dependencies are installed and the server is running
2. **Missing Data**: Check that API endpoints are accessible during generation
3. **Upload Errors**: Verify SSH keys and server permissions
4. **Sync Issues**: Check cron logs and file permissions

### Debug Commands

```bash
# Test the static generator
node scripts/static-generator.js

# Check generated files
ls -la static-dist/

# Test upload without sync
./upload.sh rsync user@server:/tmp/test-upload

# View sync logs
tail -f sync.log
```

## Security Considerations

- Use SSH keys for rsync/scp deployments
- Set appropriate file permissions on your server
- Consider using a CDN for better performance
- Regularly update your server software

## Performance

The static site offers several advantages:
- **Fast Loading**: No server-side processing required
- **High Availability**: Simple static hosting is very reliable
- **Scalability**: Easy to serve from CDNs
- **Low Cost**: Minimal server resources needed

## Support

If you encounter issues:
1. Check the generated logs in your Replit project
2. Verify your server configuration
3. Test the upload process manually
4. Review the static-dist files for completeness
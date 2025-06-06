#!/bin/bash

# Interactive Deployment Script
# Generated for Geopolitical Intelligence Platform

CONFIG_FILE="deployment.json"
SITE_DIR="./static-site"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Geopolitical Intelligence Platform Deployment${NC}"
echo -e "${BLUE}================================================${NC}"

# Check if site is built
if [ ! -d "$SITE_DIR" ]; then
    echo -e "${RED}❌ Static site not found. Building now...${NC}"
    node build-static-site.js
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Build failed. Please check your Replit app is running.${NC}"
        exit 1
    fi
fi

# Show deployment options
echo -e "${YELLOW}Select deployment method:${NC}"
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
        remote_path=${remote_path:-/var/www/html}
        
        echo -e "${BLUE}Deploying to $server:$remote_path via rsync...${NC}"
        rsync -avz --delete --progress "$SITE_DIR/" "$server:$remote_path/"
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Deployment successful!${NC}"
            echo "Your site is now live at your server."
        else
            echo -e "${RED}❌ Deployment failed. Check SSH access and permissions.${NC}"
        fi
        ;;
    2)
        read -p "Enter S3 bucket name: " bucket
        read -p "Enter AWS profile [default]: " profile
        profile=${profile:-default}
        
        echo -e "${BLUE}Deploying to S3 bucket: $bucket${NC}"
        aws s3 sync "$SITE_DIR/" "s3://$bucket/" --delete --profile "$profile"
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Deployment successful!${NC}"
            echo "Your site is available at: https://$bucket.s3-website-us-east-1.amazonaws.com"
        else
            echo -e "${RED}❌ Deployment failed. Check AWS credentials and bucket permissions.${NC}"
        fi
        ;;
    3)
        read -p "Enter server (user@hostname): " server
        read -p "Enter path (/var/www/html): " remote_path
        remote_path=${remote_path:-/var/www/html}
        
        echo -e "${BLUE}Deploying to $server:$remote_path via SCP...${NC}"
        scp -r "$SITE_DIR"/* "$server:$remote_path/"
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Deployment successful!${NC}"
        else
            echo -e "${RED}❌ Deployment failed. Check SSH access.${NC}"
        fi
        ;;
    4)
        echo -e "${BLUE}Deploying to Netlify...${NC}"
        if command -v netlify &> /dev/null; then
            netlify deploy --prod --dir="$SITE_DIR"
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ Deployment successful!${NC}"
            fi
        else
            echo -e "${RED}❌ Netlify CLI not installed. Run: npm install -g netlify-cli${NC}"
        fi
        ;;
    5)
        echo -e "${BLUE}Deploying to Vercel...${NC}"
        if command -v vercel &> /dev/null; then
            vercel --prod "$SITE_DIR"
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ Deployment successful!${NC}"
            fi
        else
            echo -e "${RED}❌ Vercel CLI not installed. Run: npm install -g vercel${NC}"
        fi
        ;;
    6)
        read -p "Enter custom deployment command: " custom_cmd
        echo -e "${BLUE}Running: $custom_cmd${NC}"
        eval "$custom_cmd"
        ;;
    7)
        echo -e "${YELLOW}🧪 Test deployment (dry run)${NC}"
        echo "Site directory: $SITE_DIR"
        echo "Files to deploy:"
        find "$SITE_DIR" -type f | head -10
        echo "..."
        echo "Total files: $(find "$SITE_DIR" -type f | wc -l)"
        echo "Total size: $(du -sh "$SITE_DIR" | cut -f1)"
        ;;
    *)
        echo -e "${RED}Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac

echo -e "${BLUE}Deployment completed at $(date)${NC}"
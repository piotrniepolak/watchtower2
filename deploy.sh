#!/bin/bash
# Upload static site to your server

SITE_DIR="./static-site"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

if [ ! -d "$SITE_DIR" ]; then
    echo "Error: Run node build-static-site.js first"
    exit 1
fi

case "$1" in
    "rsync")
        if [ -z "$2" ]; then
            echo "Usage: $0 rsync user@server:/path/to/webroot"
            exit 1
        fi
        echo "Uploading to $2 via rsync..."
        rsync -avz --delete "$SITE_DIR/" "$2/"
        ;;
    "s3")
        if [ -z "$2" ]; then
            echo "Usage: $0 s3 bucket-name"
            exit 1
        fi
        echo "Uploading to S3 bucket $2..."
        aws s3 sync "$SITE_DIR/" "s3://$2/" --delete
        ;;
    "scp")
        if [ -z "$2" ]; then
            echo "Usage: $0 scp user@server:/path/to/webroot"
            exit 1
        fi
        echo "Uploading to $2 via scp..."
        scp -r "$SITE_DIR"/* "$2/"
        ;;
    *)
        echo "Usage: $0 [rsync|s3|scp] [destination]"
        echo "Examples:"
        echo "  $0 rsync user@myserver.com:/var/www/html"
        echo "  $0 s3 my-website-bucket"
        echo "  $0 scp user@myserver.com:/var/www/html"
        ;;
esac

echo "Deployment completed at $(date)"
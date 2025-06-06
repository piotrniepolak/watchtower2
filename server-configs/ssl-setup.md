# SSL Certificate Setup with Let's Encrypt

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
# 0 */12 * * * root test -x /usr/bin/certbot -a \! -d /run/systemd/system && perl -e 'sleep int(rand(43200))' && certbot -q renew

## CloudFlare SSL (if using CloudFlare):
1. Go to SSL/TLS tab in CloudFlare dashboard
2. Set encryption mode to "Full (strict)"
3. Enable "Always Use HTTPS"
4. Enable "HTTP Strict Transport Security (HSTS)"
# NetAssets v2.0 - SSL & Security Guide

Complete guide for securing NetAssets with SSL certificates, especially for internal networks with external reach.

## Overview

This guide covers SSL certificate installation, security hardening, and ongoing maintenance for NetAssets deployments, with special considerations for internal networks.

## Quick Start

```bash
# Copy script to server
scp secure-netassets.sh user@your-server.com:/tmp/

# SSH to server
ssh user@your-server.com

# Configure and run
sudo nano /tmp/secure-netassets.sh  # Edit configuration
sudo /tmp/secure-netassets.sh       # Install SSL
```

## Prerequisites

### 1. Domain Configuration

Your domain must be properly configured:

**Public Domain:**
```bash
# A record pointing to public IP
netassets.example.com -> 203.0.113.10
```

**Internal Domain with External Reach:**
```bash
# DNS managed externally, routes to internal network
# Firewall allows ports 80/443 from internet
# Use DNS challenge for Let's Encrypt
```

### 2. Install Dependencies

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-apache python3-certbot-nginx openssl curl
```

For DNS challenge (internal networks):
```bash
# Example: Cloudflare
sudo apt install -y python3-certbot-dns-cloudflare

# Example: Route53
sudo apt install -y python3-certbot-dns-route53

# Example: DigitalOcean
sudo apt install -y python3-certbot-dns-digitalocean
```

## Configuration

Edit `secure-netassets.sh` before running:

```bash
# Your actual domain
DOMAIN="netassets.example.com"

# Additional domains (optional)
ALT_NAMES="www.netassets.example.com"

# Admin email for Let's Encrypt
ADMIN_EMAIL="admin@example.com"

# Web server type (apache or nginx)
WEB_SERVER="apache"

# Web root directory
WEB_ROOT="/var/www/netassets/html"

# Challenge type: "http" (standard) or "dns" (internal networks)
CHALLENGE_TYPE="http"

# DNS provider (if using dns challenge)
DNS_PROVIDER="cloudflare"
```

## Challenge Types

### HTTP Challenge (Standard)

**Best for:**
- Public servers with open ports 80/443
- Standard hosting environments
- Simple configurations

**Requirements:**
- Port 80 accessible from internet
- Domain points to server's public IP

**Configuration:**
```bash
CHALLENGE_TYPE="http"
DNS_PROVIDER=""
```

### DNS Challenge (Internal Networks)

**Best for:**
- Internal networks with firewall
- Servers behind NAT/proxy
- Private networks with external DNS

**Requirements:**
- DNS provider API access
- DNS provider credentials configured
- Domain managed by supported DNS provider

**Configuration:**
```bash
CHALLENGE_TYPE="dns"
DNS_PROVIDER="cloudflare"  # or route53, digitalocean, etc.
```

**Setup DNS Provider Credentials:**

**Cloudflare:**
```bash
sudo nano /etc/letsencrypt/cloudflare.ini
```
Add:
```ini
dns_cloudflare_email = your-email@example.com
dns_cloudflare_api_key = your-api-key
```
```bash
sudo chmod 600 /etc/letsencrypt/cloudflare.ini
```

**AWS Route53:**
```bash
# Configure AWS CLI
aws configure

# Or use IAM role with appropriate permissions
# AmazonRoute53FullAccess or custom policy
```

**DigitalOcean:**
```bash
sudo nano /etc/letsencrypt/digitalocean.ini
```
Add:
```ini
dns_digitalocean_token = your-api-token
```
```bash
sudo chmod 600 /etc/letsencrypt/digitalocean.ini
```

## Usage

### Install SSL Certificate

```bash
# Standard installation
sudo ./secure-netassets.sh

# Or explicitly
sudo ./secure-netassets.sh --install
```

This will:
1. ✓ Validate domain configuration
2. ✓ Install SSL certificate
3. ✓ Configure web server (Apache/Nginx)
4. ✓ Apply security headers
5. ✓ Setup auto-renewal
6. ✓ Configure firewall
7. ✓ Verify installation
8. ✓ Test SSL configuration

### Verify Certificate

```bash
sudo ./secure-netassets.sh --verify
```

Shows:
- Certificate expiration date
- Days remaining
- Certificate details
- HTTPS accessibility

### Security Audit

```bash
sudo ./secure-netassets.sh --audit
```

Checks:
- File permissions
- HTTPS redirect
- Security headers (HSTS, X-Frame-Options, etc.)
- Configuration issues

### Repair Issues

```bash
sudo ./secure-netassets.sh --repair
```

Fixes:
- File ownership/permissions
- SSL configuration
- Security headers
- Web server configuration

### Test SSL Configuration

```bash
sudo ./secure-netassets.sh --test
```

Tests:
- TLS 1.2 support
- TLS 1.3 support
- Certificate validity
- Cipher suites

### Renew Certificate

```bash
# Force renewal
sudo ./secure-netassets.sh --renew

# Or use certbot directly
sudo certbot renew
```

## Security Features

### SSL/TLS Configuration

**Protocols:**
- TLS 1.2 ✓
- TLS 1.3 ✓
- SSL 3.0 ✗ (disabled)
- TLS 1.0 ✗ (disabled)
- TLS 1.1 ✗ (disabled)

**Cipher Suites:**
```
ECDHE-ECDSA-AES128-GCM-SHA256
ECDHE-RSA-AES128-GCM-SHA256
ECDHE-ECDSA-AES256-GCM-SHA384
ECDHE-RSA-AES256-GCM-SHA384
```

**Features:**
- Perfect Forward Secrecy (PFS)
- OCSP Stapling (Nginx)
- HTTP/2 support
- Session ticket disabled

### Security Headers

**Applied Headers:**

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self' https://cdn.jsdelivr.net; ...
```

**What They Do:**

- **HSTS**: Forces HTTPS for 1 year
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing
- **X-XSS-Protection**: Browser XSS protection
- **Referrer-Policy**: Controls referrer information
- **CSP**: Controls resource loading

### Firewall Configuration

**UFW Rules:**
```bash
# SSH
sudo ufw allow 22/tcp

# HTTP
sudo ufw allow 80/tcp

# HTTPS
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

**Check Status:**
```bash
sudo ufw status numbered
```

## Auto-Renewal

Certificates automatically renew via systemd timer or cron job.

### Check Timer Status

```bash
# Systemd timer
sudo systemctl status certbot.timer

# List all timers
sudo systemctl list-timers certbot.timer
```

### Check Cron Job

```bash
# View certbot cron
cat /etc/cron.d/certbot

# Or custom cron
cat /etc/cron.d/certbot-netassets
```

### Test Renewal

```bash
# Dry run (doesn't renew, just tests)
sudo certbot renew --dry-run

# Force renewal
sudo certbot renew --force-renewal
```

### Manual Renewal

```bash
# Using certbot
sudo certbot renew

# Using script
sudo ./secure-netassets.sh --renew
```

## Troubleshooting

### Port 80 Not Accessible

**Problem:** HTTP challenge fails, port 80 blocked

**Solution:** Use DNS challenge

```bash
CHALLENGE_TYPE="dns"
DNS_PROVIDER="cloudflare"  # your DNS provider
```

### Domain Not Resolving

**Check DNS:**
```bash
host netassets.example.com
dig netassets.example.com
nslookup netassets.example.com
```

**Verify A Record:**
```bash
# Should return your server's IP
dig +short netassets.example.com
```

### Certificate Already Exists

**Problem:** Certificate already exists

**Solution 1 - Expand:**
```bash
sudo certbot certonly --expand -d netassets.example.com -d www.netassets.example.com
```

**Solution 2 - Force Renew:**
```bash
sudo certbot renew --force-renewal
```

**Solution 3 - Delete and Reinstall:**
```bash
sudo certbot delete --cert-name netassets.example.com
sudo ./secure-netassets.sh --install
```

### Permission Denied Errors

```bash
# Fix ownership
sudo chown -R www-data:www-data /var/www/netassets/

# Fix permissions
sudo find /var/www/netassets/ -type f -exec chmod 644 {} \;
sudo find /var/www/netassets/ -type d -exec chmod 755 {} \;

# Or use repair
sudo ./secure-netassets.sh --repair
```

### Web Server Won't Start

**Apache:**
```bash
# Test configuration
sudo apache2ctl configtest

# Check logs
sudo tail -f /var/log/apache2/error.log

# Restart
sudo systemctl restart apache2
```

**Nginx:**
```bash
# Test configuration
sudo nginx -t

# Check logs
sudo tail -f /var/log/nginx/error.log

# Restart
sudo systemctl restart nginx
```

### HTTPS Not Working After Install

**Check Certificate:**
```bash
sudo certbot certificates
```

**Check SSL Configuration:**
```bash
# Apache
sudo apache2ctl -t -D DUMP_VHOSTS

# Nginx
sudo nginx -T | grep -A 20 "server {"
```

**Test Port 443:**
```bash
sudo netstat -tlnp | grep :443
sudo ss -tlnp | grep :443
```

### DNS Provider Credentials Invalid

**Cloudflare:**
```bash
# Verify credentials
cat /etc/letsencrypt/cloudflare.ini

# Test API access
curl -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json"
```

**AWS Route53:**
```bash
# Test AWS credentials
aws sts get-caller-identity

# List hosted zones
aws route53 list-hosted-zones
```

### Mixed Content Warnings

**Problem:** Page loads over HTTPS but resources load over HTTP

**Solution:** Update CSP headers or fix resource URLs

**Check Resources:**
```bash
curl -s https://netassets.example.com | grep -i "http://"
```

## Monitoring & Maintenance

### Monitor Certificate Expiry

**Script to check:**
```bash
#!/bin/bash
DOMAIN="netassets.example.com"
CERT="/etc/letsencrypt/live/$DOMAIN/fullchain.pem"

if [ -f "$CERT" ]; then
    EXPIRY=$(openssl x509 -enddate -noout -in "$CERT" | cut -d= -f2)
    EXPIRY_EPOCH=$(date -d "$EXPIRY" +%s)
    NOW_EPOCH=$(date +%s)
    DAYS_LEFT=$(( ($EXPIRY_EPOCH - $NOW_EPOCH) / 86400 ))

    echo "Certificate expires in $DAYS_LEFT days ($EXPIRY)"

    if [ $DAYS_LEFT -lt 30 ]; then
        echo "WARNING: Certificate expires soon!"
        # Send alert
        echo "Certificate expires in $DAYS_LEFT days" | mail -s "SSL Alert" admin@example.com
    fi
fi
```

### Cron Job for Monitoring

```bash
# Add to root crontab
sudo crontab -e
```

Add:
```bash
# Check SSL certificate daily at 6 AM
0 6 * * * /usr/local/bin/check-ssl.sh >> /var/log/ssl-check.log 2>&1
```

### Log Monitoring

```bash
# Security logs
sudo tail -f /var/log/netassets-security.log

# Web server logs
sudo tail -f /var/log/apache2/access.log
sudo tail -f /var/log/nginx/access.log

# Certbot logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

### SSL Testing Services

**SSL Labs:**
```
https://www.ssllabs.com/ssltest/analyze.html?d=netassets.example.com
```

**SSL Checker:**
```
https://www.sslshopper.com/ssl-checker.html#hostname=netassets.example.com
```

**Security Headers:**
```
https://securityheaders.com/?q=netassets.example.com
```

## Best Practices

### 1. Regular Updates

```bash
# Update system packages weekly
sudo apt update && sudo apt upgrade -y

# Update certbot
sudo apt install --only-upgrade certbot
```

### 2. Backup Certificates

```bash
# Backup Let's Encrypt directory
sudo tar -czf letsencrypt-backup-$(date +%Y%m%d).tar.gz /etc/letsencrypt/

# Store offsite or on backup server
scp letsencrypt-backup-*.tar.gz backup-server:/backups/
```

### 3. Monitor Logs

```bash
# Setup log rotation
sudo nano /etc/logrotate.d/netassets-security
```

Add:
```
/var/log/netassets-security.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 root root
    sharedscripts
}
```

### 4. Test After Changes

```bash
# After any SSL/security changes
sudo ./secure-netassets.sh --verify
sudo ./secure-netassets.sh --test
sudo ./secure-netassets.sh --audit
```

### 5. Keep Documentation Updated

- Document your DNS provider setup
- Record certificate renewal dates
- Note any custom configurations
- Keep emergency contact information

## Advanced Configuration

### Custom Certificate Paths

If using custom certificates (not Let's Encrypt):

**Apache:**
```apache
SSLCertificateFile /path/to/your/certificate.crt
SSLCertificateKeyFile /path/to/your/private.key
SSLCertificateChainFile /path/to/chain.crt
```

**Nginx:**
```nginx
ssl_certificate /path/to/your/fullchain.pem;
ssl_certificate_key /path/to/your/private.key;
```

### Wildcard Certificates

```bash
# Wildcard requires DNS challenge
sudo certbot certonly \
  --dns-cloudflare \
  --dns-cloudflare-credentials /etc/letsencrypt/cloudflare.ini \
  -d example.com \
  -d *.example.com
```

### Multiple Domains

```bash
# Configure in script
DOMAIN="netassets.example.com"
ALT_NAMES="app.example.com,dashboard.example.com"
```

### Behind Reverse Proxy

If behind nginx reverse proxy or load balancer:

```nginx
# On reverse proxy
location / {
    proxy_pass http://internal-server;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## Emergency Procedures

### Certificate Expired

```bash
# 1. Force renewal immediately
sudo certbot renew --force-renewal

# 2. Reload web server
sudo systemctl reload apache2  # or nginx

# 3. Verify
sudo ./secure-netassets.sh --verify
```

### SSL Breaks Site

```bash
# 1. Check what changed
sudo tail -50 /var/log/netassets-security.log

# 2. Test configuration
sudo apache2ctl configtest  # or nginx -t

# 3. Restore from backup
sudo cp /var/www/backups/netassets/latest.tar.gz .
sudo tar -xzf latest.tar.gz

# 4. Or disable SSL temporarily
sudo a2dissite netassets-ssl  # Apache
sudo rm /etc/nginx/sites-enabled/netassets  # Nginx
sudo systemctl reload apache2  # or nginx
```

### Can't Access Dashboard

```bash
# 1. Check web server status
sudo systemctl status apache2  # or nginx

# 2. Check ports
sudo netstat -tlnp | grep -E ':80|:443'

# 3. Check firewall
sudo ufw status

# 4. Check logs
sudo tail -50 /var/log/apache2/error.log
sudo tail -50 /var/log/nginx/error.log

# 5. Restart services
sudo systemctl restart apache2  # or nginx
```

## Support

- **GitHub Issues**: https://github.com/MrNetsudo/NetAssets/issues
- **Documentation**: https://github.com/MrNetsudo/NetAssets
- **Let's Encrypt Docs**: https://letsencrypt.org/docs/
- **Certbot Docs**: https://certbot.eff.org/docs/

---

**Last Updated**: October 2025
**Script Version**: 1.0
**Maintained by**: Miguel Jimenez

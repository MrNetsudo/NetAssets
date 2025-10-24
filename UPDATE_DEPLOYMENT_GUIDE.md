# NetAssets v2.0 - Deployment Update Guide

Complete guide for updating NetAssets on your Ubuntu web server from GitHub.

## Quick Update

```bash
# Copy script to server
scp update-netassets.sh user@your-server.com:/tmp/

# SSH to server
ssh user@your-server.com

# Run update
sudo /tmp/update-netassets.sh
```

## Prerequisites

### 1. Install Dependencies
```bash
sudo apt update
sudo apt install -y git rsync
```

### 2. Configure Script

Edit the configuration section in `update-netassets.sh`:

```bash
# Web server document root where NetAssets is deployed
# Example: /var/www/netassets.example.com/html or /var/www/html/netassets
WEB_ROOT="/var/www/netassets/html"

# GitHub repository URL
GITHUB_REPO="https://github.com/MrNetsudo/NetAssets.git"

# Web server user (usually www-data for Apache/Nginx)
WEB_USER="www-data"
WEB_GROUP="www-data"

# Files to preserve (won't be overwritten)
PRESERVE_FILES=(
    "device_data_combined.js"
    ".htpasswd"
)
```

## Usage

### Standard Update (Recommended)
```bash
sudo ./update-netassets.sh
```

This will:
1. ✓ Create backup of current version
2. ✓ Clone latest from GitHub
3. ✓ Preserve your data files
4. ✓ Deploy new version
5. ✓ Set correct permissions
6. ✓ Verify deployment
7. ✓ Reload web server

### Update Without Backup (Not Recommended)
```bash
sudo ./update-netassets.sh --no-backup
```

### Test Run (See What Would Happen)
```bash
sudo ./update-netassets.sh --dry-run
```

### Rollback to Previous Version
```bash
sudo ./update-netassets.sh --rollback
```

### Show Help
```bash
./update-netassets.sh --help
```

## Features

### Automatic Backup
- Creates compressed backup before each update
- Stores in `/var/backups/netassets/`
- Keeps last 5 backups
- Quick rollback capability

### File Preservation
Automatically preserves:
- `device_data_combined.js` (your device data)
- `.htpasswd` (authentication credentials)
- Add more files to `PRESERVE_FILES` array as needed

### Safety Features
- ✓ Verifies all dependencies before starting
- ✓ Checks directory existence
- ✓ Creates backup before making changes
- ✓ Automatic rollback on failure
- ✓ Detailed logging to `/var/log/netassets-update.log`
- ✓ Verification after deployment

### Permission Management
Automatically sets:
- Owner: `www-data:www-data`
- Files: `644` (readable by web server)
- Directories: `755` (accessible by web server)

## Installation on Server

### Option 1: Manual Placement
```bash
# Copy script to server
scp update-netassets.sh user@your-server.com:/usr/local/bin/

# SSH to server
ssh user@your-server.com

# Make executable
sudo chmod +x /usr/local/bin/update-netassets.sh

# Run from anywhere
sudo update-netassets.sh
```

### Option 2: Clone Repository
```bash
# On server
cd /opt
sudo git clone https://github.com/MrNetsudo/NetAssets.git netassets-repo

# Link script to PATH
sudo ln -s /opt/netassets-repo/update-netassets.sh /usr/local/bin/update-netassets

# Run from anywhere
sudo update-netassets
```

## Automated Updates (Optional)

### Create Systemd Service

**1. Create service file:**
```bash
sudo nano /etc/systemd/system/netassets-update.service
```

Add:
```ini
[Unit]
Description=NetAssets Update Service
After=network.target

[Service]
Type=oneshot
ExecStart=/usr/local/bin/update-netassets.sh
StandardOutput=journal
StandardError=journal
```

**2. Create timer file:**
```bash
sudo nano /etc/systemd/system/netassets-update.timer
```

Add:
```ini
[Unit]
Description=NetAssets Weekly Update Timer
Requires=netassets-update.service

[Timer]
# Run every Monday at 2 AM
OnCalendar=Mon *-*-* 02:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

**3. Enable and start:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable netassets-update.timer
sudo systemctl start netassets-update.timer

# Check status
sudo systemctl status netassets-update.timer

# View scheduled runs
sudo systemctl list-timers netassets-update.timer
```

**4. Manual trigger:**
```bash
sudo systemctl start netassets-update.service
```

## Cron Job (Alternative)

```bash
# Edit root crontab
sudo crontab -e

# Add weekly update (every Monday at 2 AM)
0 2 * * 1 /usr/local/bin/update-netassets.sh >> /var/log/netassets-cron.log 2>&1

# Or monthly (1st of month at 2 AM)
0 2 1 * * /usr/local/bin/update-netassets.sh >> /var/log/netassets-cron.log 2>&1
```

## Monitoring & Logs

### View Update Logs
```bash
# View latest update log
sudo tail -f /var/log/netassets-update.log

# View all updates
sudo cat /var/log/netassets-update.log

# View recent updates
sudo tail -n 100 /var/log/netassets-update.log
```

### Check Backup Status
```bash
# List all backups
ls -lh /var/backups/netassets/

# View latest backup
cat /var/backups/netassets/latest-backup.txt
```

### Test After Update
```bash
# Check if application loads
curl -I https://your-netassets-domain.com

# View deployed version
curl -s https://your-netassets-domain.com | grep 'meta name="version"'
```

## Rollback Procedure

If update causes issues:

```bash
# Immediate rollback
sudo update-netassets.sh --rollback

# Or manually restore specific backup
cd /var/backups/netassets/
ls -lh  # Find desired backup
sudo tar -xzf netassets-backup-YYYYMMDD-HHMMSS.tar.gz -C /var/www/
sudo chown -R www-data:www-data /var/www/netassets.gtk.gtech.com/
sudo systemctl reload apache2  # or nginx
```

## Troubleshooting

### Script Fails to Start
```bash
# Check script permissions
ls -l /usr/local/bin/update-netassets.sh

# Should be executable
sudo chmod +x /usr/local/bin/update-netassets.sh

# Verify dependencies
git --version
rsync --version
```

### Permission Denied Errors
```bash
# Ensure running as root
sudo ./update-netassets.sh

# Check web root permissions
ls -ld /var/www/netassets.gtk.gtech.com/html/
```

### Backup Directory Full
```bash
# Check disk space
df -h /var/backups/

# Manually clean old backups
sudo rm /var/backups/netassets/netassets-backup-2024*.tar.gz
```

### GitHub Clone Fails
```bash
# Test connectivity
git ls-remote https://github.com/MrNetsudo/NetAssets.git

# Check firewall
sudo ufw status

# Verify DNS
nslookup github.com
```

### Web Server Not Reloading
```bash
# Check web server status
sudo systemctl status apache2
sudo systemctl status nginx

# Manually restart
sudo systemctl restart apache2
# or
sudo systemctl restart nginx

# Check for config errors
sudo apache2ctl configtest
# or
sudo nginx -t
```

## Best Practices

### Before Major Updates
1. **Announce maintenance window** to team
2. **Create manual backup** of entire site
3. **Test in staging** environment first (if available)
4. **Document current version** for reference

### After Updates
1. **Verify functionality** - Check main features
2. **Review logs** - Ensure no errors
3. **Monitor performance** - Watch server metrics
4. **Test data import** - Ensure CSV import works
5. **Check analytics** - Verify charts display

### Regular Maintenance
- **Weekly**: Check update logs
- **Monthly**: Review backups, clean old ones
- **Quarterly**: Test rollback procedure
- **Annually**: Update script configuration

## Security Considerations

### Access Control
```bash
# Restrict script to root only
sudo chown root:root /usr/local/bin/update-netassets.sh
sudo chmod 750 /usr/local/bin/update-netassets.sh
```

### Backup Encryption (Optional)
```bash
# Encrypt sensitive backups
sudo apt install -y gpg

# Create encrypted backup
tar -czf - /var/www/netassets | \
  gpg --symmetric --cipher-algo AES256 -o \
  /var/backups/netassets/backup-$(date +%Y%m%d).tar.gz.gpg
```

### Notifications (Optional)

**Email on Update:**
```bash
# Install mailutils
sudo apt install -y mailutils

# Add to script or create wrapper
echo "NetAssets updated successfully" | mail -s "NetAssets Update" admin@example.com
```

**Slack Notification:**
```bash
# Add webhook to script (configure your webhook URL)
SLACK_WEBHOOK="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"NetAssets v2.0 updated successfully"}' \
  "$SLACK_WEBHOOK"
```

## Version History

Check deployed version:
```bash
# On server
grep 'meta name="version"' /var/www/netassets/html/index.html
```

## Support

- **GitHub Issues**: https://github.com/MrNetsudo/NetAssets/issues
- **Documentation**: https://github.com/MrNetsudo/NetAssets/blob/main/README.md
- **Update Logs**: `/var/log/netassets-update.log`

---

**Last Updated**: October 2025
**Script Version**: 1.0
**Maintained by**: Miguel Jimenez

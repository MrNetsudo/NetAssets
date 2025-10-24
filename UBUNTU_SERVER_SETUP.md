# Ubuntu Server Setup Guide for NetAssets Dashboard

This guide will help you set up the NetAssets Network Device Inventory Dashboard on your Ubuntu server.

## Prerequisites

- Ubuntu Server (20.04 LTS or newer recommended)
- Root or sudo access
- Basic familiarity with Linux command line

## Installation Options

### Option 1: Using Apache Web Server (Recommended)

#### 1. Install Apache

```bash
sudo apt update
sudo apt install apache2 -y
```

#### 2. Enable Apache and configure firewall

```bash
# Start and enable Apache
sudo systemctl start apache2
sudo systemctl enable apache2

# Configure firewall (if UFW is enabled)
sudo ufw allow 'Apache Full'
sudo ufw status
```

#### 3. Deploy the NetAssets Dashboard

```bash
# Create a directory for the application
sudo mkdir -p /var/www/netassets

# Copy your files to the web directory
sudo cp -r /home/miguel/Firemon/* /var/www/netassets/

# Set proper permissions
sudo chown -R www-data:www-data /var/www/netassets
sudo chmod -R 755 /var/www/netassets
```

#### 4. Configure Apache Virtual Host

Create a new Apache configuration file:

```bash
sudo nano /etc/apache2/sites-available/netassets.conf
```

Add the following configuration:

```apache
<VirtualHost *:80>
    ServerName your-server-ip-or-domain
    ServerAdmin admin@example.com
    DocumentRoot /var/www/netassets

    <Directory /var/www/netassets>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/netassets_error.log
    CustomLog ${APACHE_LOG_DIR}/netassets_access.log combined
</VirtualHost>
```

#### 5. Enable the site and restart Apache

```bash
# Disable default site (optional)
sudo a2dissite 000-default.conf

# Enable the NetAssets site
sudo a2ensite netassets.conf

# Enable mod_rewrite if using .htaccess
sudo a2enmod rewrite

# Test Apache configuration
sudo apache2ctl configtest

# Restart Apache
sudo systemctl restart apache2
```

#### 6. Access your dashboard

Open a web browser and navigate to:
```
http://your-server-ip
```

---

### Option 2: Using Nginx Web Server

#### 1. Install Nginx

```bash
sudo apt update
sudo apt install nginx -y
```

#### 2. Enable Nginx and configure firewall

```bash
# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Configure firewall (if UFW is enabled)
sudo ufw allow 'Nginx Full'
sudo ufw status
```

#### 3. Deploy the NetAssets Dashboard

```bash
# Create a directory for the application
sudo mkdir -p /var/www/netassets

# Copy your files to the web directory
sudo cp -r /home/miguel/Firemon/* /var/www/netassets/

# Set proper permissions
sudo chown -R www-data:www-data /var/www/netassets
sudo chmod -R 755 /var/www/netassets
```

#### 4. Configure Nginx Server Block

Create a new Nginx configuration file:

```bash
sudo nano /etc/nginx/sites-available/netassets
```

Add the following configuration:

```nginx
server {
    listen 80;
    listen [::]:80;

    server_name your-server-ip-or-domain;
    root /var/www/netassets;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    # Enable gzip compression for better performance
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;

    access_log /var/log/nginx/netassets_access.log;
    error_log /var/log/nginx/netassets_error.log;
}
```

#### 5. Enable the site and restart Nginx

```bash
# Create symbolic link to enable site
sudo ln -s /etc/nginx/sites-available/netassets /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### 6. Access your dashboard

Open a web browser and navigate to:
```
http://your-server-ip
```

---

### Option 3: Simple Python HTTP Server (Development/Testing Only)

For quick testing or development environments:

```bash
# Navigate to the project directory
cd /home/miguel/Firemon

# Start Python HTTP server on port 8000
python3 -m http.server 8000

# Or specify a different port
python3 -m http.server 8080
```

Access via: `http://your-server-ip:8000`

**Note:** This method is NOT recommended for production use as it lacks security features and proper performance optimization.

---

## SSL/TLS Configuration (HTTPS) - Recommended for Production

### Using Let's Encrypt with Certbot

#### For Apache:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-apache -y

# Obtain and install certificate
sudo certbot --apache -d your-domain.com

# Auto-renewal is configured automatically
```

#### For Nginx:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain and install certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
```

---

## Application Features

### Starting with Empty Data

The application is now configured to start with **empty data** by default. The CSV data file is commented out in `index.html`.

To **preload data** from the CSV file:
1. Edit `/var/www/netassets/index.html` (or your installation path)
2. Find line ~2266-2267:
   ```html
   <!-- Uncomment below to preload CSV data -->
   <!-- <script src="device_data_combined.js"></script> -->
   ```
3. Uncomment the script tag:
   ```html
   <!-- Uncomment below to preload CSV data -->
   <script src="device_data_combined.js"></script>
   ```
4. Reload the page

### Importing Data

You can import device data using the **Import** button in the dashboard:
- **CSV Format**: Standard comma-separated values
- **JSON Format**: Structured JSON data

### Clearing All Data

Use the red **"🗑️ Clear Data"** button in the toolbar to remove all devices from the dashboard. This will prompt for confirmation before clearing.

---

## Troubleshooting

### Permission Issues

If you encounter permission errors:

```bash
# For Apache
sudo chown -R www-data:www-data /var/www/netassets
sudo chmod -R 755 /var/www/netassets

# For Nginx (same commands)
sudo chown -R www-data:www-data /var/www/netassets
sudo chmod -R 755 /var/www/netassets
```

### Check Web Server Status

```bash
# Apache
sudo systemctl status apache2

# Nginx
sudo systemctl status nginx
```

### View Logs

```bash
# Apache logs
sudo tail -f /var/log/apache2/netassets_error.log

# Nginx logs
sudo tail -f /var/log/nginx/netassets_error.log
```

### Firewall Issues

Ensure your firewall allows HTTP/HTTPS traffic:

```bash
# Check UFW status
sudo ufw status

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

---

## Security Recommendations

1. **Use HTTPS** - Always use SSL/TLS certificates in production
2. **Restrict Access** - Consider adding authentication if needed
3. **Regular Updates** - Keep your server and web server software updated:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```
4. **Backup** - Regularly backup your data exports
5. **File Permissions** - Ensure proper file permissions (755 for directories, 644 for files)

---

## Maintenance

### Update the Application

```bash
# Navigate to your installation directory
cd /var/www/netassets

# Backup current version
sudo cp -r /var/www/netassets /var/www/netassets.backup-$(date +%Y%m%d)

# Copy new files
sudo cp -r /home/miguel/Firemon/* /var/www/netassets/

# Set permissions
sudo chown -R www-data:www-data /var/www/netassets

# Restart web server
sudo systemctl restart apache2  # or nginx
```

### Monitor Server Resources

```bash
# Check disk usage
df -h

# Check memory usage
free -h

# Check CPU and processes
top
```

---

## Support

For issues or questions:
- Check the project README.md
- Review server logs for error messages
- Ensure all prerequisites are met

---

**Author:** Miguel Jimenez - Miguel@netsudo.com
**Application:** NetAssets - Network Device Inventory Dashboard

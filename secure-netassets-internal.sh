#!/bin/bash

#═══════════════════════════════════════════════════════════════
# NetAssets v2.0 - Internal SSL Certificate Setup
# Author: Miguel Jimenez
# Description: Creates self-signed SSL certificate for internal use
#═══════════════════════════════════════════════════════════════

set -e  # Exit on error

# ──────────────────────────────────────────────────────────────
# CONFIGURATION - EDIT THESE VALUES
# ──────────────────────────────────────────────────────────────

# Your internal domain name
DOMAIN="netassets.gtk.gtech.com"

# Organization details (for certificate)
ORGANIZATION="GTech"
ORGANIZATIONAL_UNIT="IT Department"
COUNTRY="US"
STATE="State"
CITY="City"

# Certificate validity (in days)
CERT_VALIDITY_DAYS=3650  # 10 years

# Web server type (apache or nginx)
WEB_SERVER="apache"

# Certificate storage location
CERT_DIR="/etc/ssl/netassets"
CERT_KEY="$CERT_DIR/netassets.key"
CERT_CRT="$CERT_DIR/netassets.crt"

# Web root directory
WEB_ROOT="/var/www/netassets"

# Log file
LOG_FILE="/var/log/netassets-ssl-internal.log"

# ──────────────────────────────────────────────────────────────
# COLOR CODES
# ──────────────────────────────────────────────────────────────

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ──────────────────────────────────────────────────────────────
# FUNCTIONS
# ──────────────────────────────────────────────────────────────

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

log_warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

log_info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO:${NC} $1" | tee -a "$LOG_FILE"
}

log_section() {
    echo -e "\n${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}\n"
}

print_header() {
    clear
    echo "═══════════════════════════════════════════════════════════════"
    echo "  NetAssets v2.0 - Internal SSL Certificate Setup"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
}

check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "This script must be run as root (use sudo)"
        exit 1
    fi
}

check_dependencies() {
    log "Checking dependencies..."

    if ! command -v openssl &> /dev/null; then
        log_info "Installing OpenSSL..."
        apt update && apt install -y openssl
    fi

    log "All dependencies satisfied ✓"
}

detect_webserver() {
    log "Detecting web server..."

    if systemctl is-active --quiet apache2; then
        WEB_SERVER="apache"
        log "Detected: Apache ✓"
    elif systemctl is-active --quiet nginx; then
        WEB_SERVER="nginx"
        log "Detected: Nginx ✓"
    else
        log_error "No supported web server detected (Apache or Nginx)"
        log_info "Please start your web server first"
        exit 1
    fi
}

create_certificate_directory() {
    log "Creating certificate directory..."

    if [ ! -d "$CERT_DIR" ]; then
        mkdir -p "$CERT_DIR"
        chmod 755 "$CERT_DIR"
        log "Directory created: $CERT_DIR ✓"
    else
        log "Directory exists: $CERT_DIR ✓"
    fi
}

generate_self_signed_certificate() {
    log_section "Generating Self-Signed Certificate"

    log_info "Domain: $DOMAIN"
    log_info "Validity: $CERT_VALIDITY_DAYS days (~$(($CERT_VALIDITY_DAYS / 365)) years)"

    # Generate private key and certificate in one command
    openssl req -x509 -nodes -days "$CERT_VALIDITY_DAYS" \
        -newkey rsa:4096 \
        -keyout "$CERT_KEY" \
        -out "$CERT_CRT" \
        -subj "/C=$COUNTRY/ST=$STATE/L=$CITY/O=$ORGANIZATION/OU=$ORGANIZATIONAL_UNIT/CN=$DOMAIN" \
        -addext "subjectAltName=DNS:$DOMAIN,DNS:*.$DOMAIN" \
        >> "$LOG_FILE" 2>&1

    if [ $? -eq 0 ]; then
        log "Certificate generated successfully ✓"
        log_info "Private key: $CERT_KEY"
        log_info "Certificate: $CERT_CRT"
    else
        log_error "Certificate generation failed"
        exit 1
    fi

    # Set secure permissions
    chmod 600 "$CERT_KEY"
    chmod 644 "$CERT_CRT"
    log "Permissions set ✓"
}

verify_certificate() {
    log "Verifying certificate..."

    # Check certificate details
    local expiry_date=$(openssl x509 -enddate -noout -in "$CERT_CRT" | cut -d= -f2)
    local subject=$(openssl x509 -subject -noout -in "$CERT_CRT" | cut -d= -f2-)

    log_info "Subject: $subject"
    log_info "Expires: $expiry_date"

    # Verify certificate and key match
    local cert_md5=$(openssl x509 -noout -modulus -in "$CERT_CRT" | openssl md5)
    local key_md5=$(openssl rsa -noout -modulus -in "$CERT_KEY" 2>/dev/null | openssl md5)

    if [ "$cert_md5" == "$key_md5" ]; then
        log "Certificate and key match ✓"
    else
        log_error "Certificate and key don't match!"
        exit 1
    fi
}

configure_apache() {
    log_section "Configuring Apache SSL"

    local ssl_conf="/etc/apache2/sites-available/netassets-ssl.conf"

    # Create SSL virtual host configuration
    cat > "$ssl_conf" << EOF
<IfModule mod_ssl.c>
<VirtualHost *:443>
    ServerName $DOMAIN

    DocumentRoot $WEB_ROOT

    # SSL Configuration
    SSLEngine on
    SSLCertificateFile $CERT_CRT
    SSLCertificateKeyFile $CERT_KEY

    # Modern SSL Configuration
    SSLProtocol -all +TLSv1.2 +TLSv1.3
    SSLCipherSuite ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384
    SSLHonorCipherOrder off

    # Security Headers
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Content-Security-Policy "default-src 'self' https://cdn.jsdelivr.net; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:;"

    # Enable HTTP/2
    Protocols h2 http/1.1

    <Directory $WEB_ROOT>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    # Logging
    ErrorLog \${APACHE_LOG_DIR}/netassets-ssl-error.log
    CustomLog \${APACHE_LOG_DIR}/netassets-ssl-access.log combined
</VirtualHost>

# Redirect HTTP to HTTPS
<VirtualHost *:80>
    ServerName $DOMAIN
    Redirect permanent / https://$DOMAIN/
</VirtualHost>
</IfModule>
EOF

    # Enable necessary modules
    log "Enabling Apache modules..."
    a2enmod ssl headers http2 rewrite &>> "$LOG_FILE"

    # Disable default SSL site if exists
    a2dissite default-ssl &>> "$LOG_FILE" 2>&1 || true

    # Enable our SSL site
    a2ensite netassets-ssl &>> "$LOG_FILE"

    # Test configuration
    if apache2ctl configtest &>> "$LOG_FILE"; then
        log "Apache SSL configuration: Valid ✓"
        systemctl reload apache2
        log "Apache reloaded ✓"
    else
        log_error "Apache configuration test failed"
        apache2ctl configtest
        exit 1
    fi
}

configure_nginx() {
    log_section "Configuring Nginx SSL"

    local ssl_conf="/etc/nginx/sites-available/netassets"

    # Create SSL server block
    cat > "$ssl_conf" << EOF
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN;

    root $WEB_ROOT;
    index index.html;

    # SSL Configuration
    ssl_certificate $CERT_CRT;
    ssl_certificate_key $CERT_KEY;

    # Modern SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self' https://cdn.jsdelivr.net; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:;" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;

    location / {
        try_files \$uri \$uri/ =404;
    }

    # Security: Deny access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF

    # Enable site
    ln -sf "$ssl_conf" "/etc/nginx/sites-enabled/netassets" 2>/dev/null || true

    # Test configuration
    if nginx -t &>> "$LOG_FILE"; then
        log "Nginx SSL configuration: Valid ✓"
        systemctl reload nginx
        log "Nginx reloaded ✓"
    else
        log_error "Nginx configuration test failed"
        nginx -t
        exit 1
    fi
}

export_certificate_for_clients() {
    log_section "Certificate Information for Clients"

    log_info "Certificate file for client import: $CERT_CRT"

    # Copy certificate to web root for easy download
    local download_path="$WEB_ROOT/netassets-certificate.crt"
    cp "$CERT_CRT" "$download_path"
    chmod 644 "$download_path"

    log "Certificate copied to: $download_path"
    log_info "Users can download from: https://$DOMAIN/netassets-certificate.crt"
}

print_summary() {
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "  Internal SSL Setup Complete!"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
    echo "  Domain: $DOMAIN"
    echo "  Certificate: $CERT_CRT"
    echo "  Private Key: $CERT_KEY"
    echo "  Valid for: $CERT_VALIDITY_DAYS days (~$(($CERT_VALIDITY_DAYS / 365)) years)"
    echo ""
    echo "  HTTPS URL: https://$DOMAIN"
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
    echo "  ${YELLOW}IMPORTANT - Certificate Trust:${NC}"
    echo ""
    echo "  Since this is a self-signed certificate, users will see a"
    echo "  security warning in their browsers. To remove the warning:"
    echo ""
    echo "  ${CYAN}Option 1: Import Certificate (Recommended)${NC}"
    echo "    • Download: https://$DOMAIN/netassets-certificate.crt"
    echo "    • Install in: System Trusted Root Certificates"
    echo ""
    echo "  ${CYAN}Option 2: Browser Exception (Quick)${NC}"
    echo "    • Click 'Advanced' → 'Accept Risk and Continue'"
    echo "    • Browser will remember this exception"
    echo ""
    echo "  ${CYAN}Instructions by Platform:${NC}"
    echo ""
    echo "  ${GREEN}Windows:${NC}"
    echo "    1. Download netassets-certificate.crt"
    echo "    2. Double-click certificate file"
    echo "    3. Click 'Install Certificate'"
    echo "    4. Select 'Local Machine' → Next"
    echo "    5. Select 'Trusted Root Certification Authorities'"
    echo "    6. Click Next → Finish"
    echo ""
    echo "  ${GREEN}macOS:${NC}"
    echo "    1. Download netassets-certificate.crt"
    echo "    2. Double-click to open in Keychain Access"
    echo "    3. Find certificate → Double-click"
    echo "    4. Expand 'Trust' section"
    echo "    5. Set 'When using this certificate' to 'Always Trust'"
    echo ""
    echo "  ${GREEN}Linux:${NC}"
    echo "    sudo cp $CERT_CRT /usr/local/share/ca-certificates/netassets.crt"
    echo "    sudo update-ca-certificates"
    echo ""
    echo "  ${GREEN}Firefox (All Platforms):${NC}"
    echo "    Settings → Privacy & Security → Certificates"
    echo "    → View Certificates → Import → Select certificate file"
    echo "    → Check 'Trust this CA to identify websites'"
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
    echo "  Log file: $LOG_FILE"
    echo ""
}

show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --install         Generate and install SSL certificate (default)"
    echo "  --verify          Verify existing certificate"
    echo "  --export          Export certificate for distribution"
    echo "  --help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  sudo $0                    # Install SSL certificate"
    echo "  sudo $0 --verify           # Check certificate status"
    echo "  sudo $0 --export           # Export for clients"
    echo ""
}

# ──────────────────────────────────────────────────────────────
# MAIN EXECUTION
# ──────────────────────────────────────────────────────────────

main() {
    local action="install"

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --install)
                action="install"
                shift
                ;;
            --verify)
                action="verify"
                shift
                ;;
            --export)
                action="export"
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done

    print_header
    check_root
    check_dependencies
    detect_webserver

    case $action in
        install)
            create_certificate_directory
            generate_self_signed_certificate
            verify_certificate

            if [ "$WEB_SERVER" == "apache" ]; then
                configure_apache
            else
                configure_nginx
            fi

            export_certificate_for_clients
            print_summary
            ;;
        verify)
            verify_certificate
            ;;
        export)
            export_certificate_for_clients
            log "Certificate exported ✓"
            ;;
    esac

    log "Operation complete!"
}

# Run main function with all arguments
main "$@"

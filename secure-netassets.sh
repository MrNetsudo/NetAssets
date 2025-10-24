#!/bin/bash

#═══════════════════════════════════════════════════════════════
# NetAssets v2.0 - SSL & Security Management Script
# Author: Miguel Jimenez
# Description: Comprehensive SSL certificate and security management
#              Handles internal networks with external reach
#═══════════════════════════════════════════════════════════════

set -e  # Exit on error

# ──────────────────────────────────────────────────────────────
# CONFIGURATION - EDIT THESE VALUES
# ──────────────────────────────────────────────────────────────

# Your domain name
DOMAIN="netassets.example.com"

# Alternative names (optional, comma-separated)
# Example: "www.netassets.example.com,app.netassets.example.com"
ALT_NAMES=""

# Admin email for Let's Encrypt notifications
ADMIN_EMAIL="admin@example.com"

# Web server type (apache or nginx)
WEB_SERVER="apache"

# Web root directory
WEB_ROOT="/var/www/netassets/html"

# Let's Encrypt challenge type
# Options: "http" (standard), "dns" (for internal networks behind firewall)
CHALLENGE_TYPE="http"

# DNS provider for DNS challenge (if using dns challenge)
# Options: cloudflare, route53, digitalocean, etc.
# Leave empty if using HTTP challenge
DNS_PROVIDER=""

# Certbot configuration directory
CERTBOT_DIR="/etc/letsencrypt"

# Log file
LOG_FILE="/var/log/netassets-security.log"

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
    echo "  NetAssets v2.0 - SSL & Security Management"
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

    local missing_deps=()

    # Check certbot
    if ! command -v certbot &> /dev/null; then
        missing_deps+=("certbot")
    fi

    # Check openssl
    if ! command -v openssl &> /dev/null; then
        missing_deps+=("openssl")
    fi

    # Check curl
    if ! command -v curl &> /dev/null; then
        missing_deps+=("curl")
    fi

    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_warn "Missing dependencies: ${missing_deps[*]}"
        log_info "Installing missing dependencies..."
        apt update
        apt install -y "${missing_deps[@]}"
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

validate_domain() {
    log "Validating domain: $DOMAIN"

    # Check if domain is configured
    if [ "$DOMAIN" == "netassets.example.com" ]; then
        log_error "Please configure your actual domain in the script"
        log_info "Edit DOMAIN variable at the top of this script"
        exit 1
    fi

    # Test DNS resolution
    if ! host "$DOMAIN" &> /dev/null; then
        log_warn "DNS resolution failed for $DOMAIN"
        log_info "Ensure your A record is configured correctly"
    else
        local IP=$(host "$DOMAIN" | awk '/has address/ {print $4}' | head -1)
        log_info "Domain resolves to: $IP"
    fi
}

install_ssl_certificate() {
    log_section "Installing SSL Certificate"

    # Build certbot command
    local certbot_cmd="certbot certonly"

    # Add web server plugin
    if [ "$WEB_SERVER" == "apache" ]; then
        certbot_cmd+=" --apache"
    else
        certbot_cmd+=" --nginx"
    fi

    # Add domain(s)
    certbot_cmd+=" -d $DOMAIN"
    if [ -n "$ALT_NAMES" ]; then
        IFS=',' read -ra NAMES <<< "$ALT_NAMES"
        for name in "${NAMES[@]}"; do
            certbot_cmd+=" -d $(echo $name | xargs)"
        done
    fi

    # Add email
    certbot_cmd+=" --email $ADMIN_EMAIL --agree-tos --non-interactive"

    # Add challenge type
    if [ "$CHALLENGE_TYPE" == "dns" ]; then
        log_info "Using DNS challenge (suitable for internal networks)"

        if [ -z "$DNS_PROVIDER" ]; then
            log_error "DNS_PROVIDER must be set when using DNS challenge"
            log_info "Set DNS_PROVIDER to your DNS provider: cloudflare, route53, etc."
            exit 1
        fi

        certbot_cmd+=" --dns-$DNS_PROVIDER"
        log_warn "Ensure DNS provider credentials are configured in $CERTBOT_DIR"
    else
        log_info "Using HTTP challenge (standard)"
        certbot_cmd+=" --webroot -w $WEB_ROOT"
    fi

    # Execute certbot
    log "Running: $certbot_cmd"
    if eval "$certbot_cmd" >> "$LOG_FILE" 2>&1; then
        log "SSL certificate installed successfully ✓"
    else
        log_error "Certificate installation failed"
        log_info "Check logs: $LOG_FILE"
        log_info "For internal networks, consider using DNS challenge"
        exit 1
    fi
}

verify_certificate() {
    log_section "Verifying SSL Certificate"

    local cert_path="$CERTBOT_DIR/live/$DOMAIN/fullchain.pem"

    if [ ! -f "$cert_path" ]; then
        log_error "Certificate not found: $cert_path"
        return 1
    fi

    log "Certificate found ✓"

    # Check expiration
    local expiry_date=$(openssl x509 -enddate -noout -in "$cert_path" | cut -d= -f2)
    local expiry_epoch=$(date -d "$expiry_date" +%s)
    local current_epoch=$(date +%s)
    local days_left=$(( ($expiry_epoch - $current_epoch) / 86400 ))

    log_info "Expires: $expiry_date"
    log_info "Days remaining: $days_left"

    if [ $days_left -lt 30 ]; then
        log_warn "Certificate expires in less than 30 days!"
        log_info "Consider renewing: sudo certbot renew"
    else
        log "Certificate validity: Good ✓"
    fi

    # Verify certificate details
    log_info "Certificate details:"
    openssl x509 -in "$cert_path" -text -noout | grep -E "Subject:|Issuer:|Not Before|Not After" | tee -a "$LOG_FILE"

    # Test online if domain is accessible
    if curl -sI "https://$DOMAIN" &> /dev/null; then
        log "HTTPS accessibility: Good ✓"
    else
        log_warn "HTTPS not accessible (may be internal network)"
    fi
}

configure_ssl_apache() {
    log_section "Configuring Apache SSL"

    local ssl_conf="/etc/apache2/sites-available/$DOMAIN-ssl.conf"

    # Create SSL virtual host configuration
    cat > "$ssl_conf" << EOF
<IfModule mod_ssl.c>
<VirtualHost *:443>
    ServerName $DOMAIN
    $([ -n "$ALT_NAMES" ] && echo "ServerAlias $ALT_NAMES")

    DocumentRoot $WEB_ROOT

    # SSL Configuration
    SSLEngine on
    SSLCertificateFile $CERTBOT_DIR/live/$DOMAIN/fullchain.pem
    SSLCertificateKeyFile $CERTBOT_DIR/live/$DOMAIN/privkey.pem

    # Modern SSL Configuration (A+ Rating)
    SSLProtocol -all +TLSv1.2 +TLSv1.3
    SSLCipherSuite ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384
    SSLHonorCipherOrder off
    SSLSessionTickets off

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
    ErrorLog \${APACHE_LOG_DIR}/$DOMAIN-ssl-error.log
    CustomLog \${APACHE_LOG_DIR}/$DOMAIN-ssl-access.log combined
</VirtualHost>
</IfModule>
EOF

    # Enable necessary modules
    log "Enabling Apache modules..."
    a2enmod ssl headers http2 rewrite &>> "$LOG_FILE"

    # Enable SSL site
    a2ensite "$DOMAIN-ssl" &>> "$LOG_FILE"

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

configure_ssl_nginx() {
    log_section "Configuring Nginx SSL"

    local ssl_conf="/etc/nginx/sites-available/$DOMAIN"

    # Create SSL server block
    cat > "$ssl_conf" << EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN $([ -n "$ALT_NAMES" ] && echo "$ALT_NAMES");

    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN $([ -n "$ALT_NAMES" ] && echo "$ALT_NAMES");

    root $WEB_ROOT;
    index index.html;

    # SSL Configuration
    ssl_certificate $CERTBOT_DIR/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key $CERTBOT_DIR/live/$DOMAIN/privkey.pem;

    # Modern SSL Configuration (A+ Rating)
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets off;

    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate $CERTBOT_DIR/live/$DOMAIN/chain.pem;

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
    ln -sf "$ssl_conf" "/etc/nginx/sites-enabled/$DOMAIN" 2>/dev/null || true

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

setup_auto_renewal() {
    log_section "Setting Up Auto-Renewal"

    # Certbot already sets up auto-renewal via cron/systemd
    # Let's verify it's working

    if systemctl list-timers | grep -q certbot; then
        log "Certbot renewal timer: Active ✓"
        systemctl status certbot.timer --no-pager | grep "Active:" | tee -a "$LOG_FILE"
    elif [ -f /etc/cron.d/certbot ]; then
        log "Certbot renewal cron job: Active ✓"
    else
        log_warn "Auto-renewal not detected, setting up cron job..."

        # Create cron job
        cat > /etc/cron.d/certbot-netassets << EOF
# Renew certificates twice daily
0 0,12 * * * root certbot renew --quiet --post-hook "systemctl reload $WEB_SERVER"
EOF
        log "Auto-renewal cron job created ✓"
    fi

    # Test renewal
    log "Testing renewal process..."
    if certbot renew --dry-run &>> "$LOG_FILE"; then
        log "Renewal test: Successful ✓"
    else
        log_error "Renewal test failed"
        log_info "Check logs: $LOG_FILE"
    fi
}

configure_firewall() {
    log_section "Configuring Firewall (UFW)"

    if ! command -v ufw &> /dev/null; then
        log_info "UFW not installed, skipping firewall configuration"
        return
    fi

    log "Checking UFW status..."

    if ufw status | grep -q "Status: active"; then
        log "UFW is active"
    else
        log_info "UFW is inactive, enabling..."
        ufw --force enable
    fi

    # Allow HTTP/HTTPS
    log "Configuring firewall rules..."
    ufw allow 'Nginx Full' &>> "$LOG_FILE" 2>&1 || ufw allow 80/tcp &>> "$LOG_FILE" 2>&1
    ufw allow 443/tcp &>> "$LOG_FILE" 2>&1
    ufw allow 22/tcp &>> "$LOG_FILE" 2>&1

    log "Firewall rules configured ✓"
    ufw status numbered | tee -a "$LOG_FILE"
}

security_audit() {
    log_section "Security Audit"

    local issues=0

    # Check file permissions
    log "Checking file permissions..."
    if [ -d "$WEB_ROOT" ]; then
        local owner=$(stat -c '%U:%G' "$WEB_ROOT")
        if [ "$owner" == "www-data:www-data" ] || [ "$owner" == "nginx:nginx" ]; then
            log "Web root ownership: Correct ✓"
        else
            log_warn "Web root ownership: $owner (expected www-data:www-data)"
            ((issues++))
        fi
    fi

    # Check HTTPS redirect
    log "Checking HTTPS redirect..."
    if curl -sI "http://$DOMAIN" 2>/dev/null | grep -q "301\|302"; then
        log "HTTP to HTTPS redirect: Working ✓"
    else
        log_warn "HTTP to HTTPS redirect: Not configured"
        ((issues++))
    fi

    # Check security headers
    log "Checking security headers..."
    local headers=$(curl -sI "https://$DOMAIN" 2>/dev/null || echo "")

    if echo "$headers" | grep -qi "strict-transport-security"; then
        log "HSTS header: Present ✓"
    else
        log_warn "HSTS header: Missing"
        ((issues++))
    fi

    if echo "$headers" | grep -qi "x-frame-options"; then
        log "X-Frame-Options: Present ✓"
    else
        log_warn "X-Frame-Options: Missing"
        ((issues++))
    fi

    if echo "$headers" | grep -qi "x-content-type-options"; then
        log "X-Content-Type-Options: Present ✓"
    else
        log_warn "X-Content-Type-Options: Missing"
        ((issues++))
    fi

    # Summary
    echo ""
    if [ $issues -eq 0 ]; then
        log "Security audit: PASSED (no issues) ✓"
    else
        log_warn "Security audit: $issues issue(s) found"
        log_info "Run with --repair to fix issues"
    fi
}

repair_issues() {
    log_section "Repairing Issues"

    # Fix file permissions
    log "Fixing file permissions..."
    chown -R www-data:www-data "$WEB_ROOT"
    find "$WEB_ROOT" -type f -exec chmod 644 {} \;
    find "$WEB_ROOT" -type d -exec chmod 755 {} \;
    log "Permissions fixed ✓"

    # Reconfigure SSL
    log "Reconfiguring SSL..."
    if [ "$WEB_SERVER" == "apache" ]; then
        configure_ssl_apache
    else
        configure_ssl_nginx
    fi

    log "Repair complete ✓"
}

ssl_test() {
    log_section "SSL Configuration Test"

    log "Testing SSL configuration..."
    echo ""

    # Test with OpenSSL
    log_info "Testing TLS 1.2..."
    if echo | timeout 5 openssl s_client -connect "$DOMAIN:443" -tls1_2 2>/dev/null | grep -q "Verify return code: 0"; then
        echo -e "${GREEN}✓${NC} TLS 1.2: Supported"
    else
        echo -e "${RED}✗${NC} TLS 1.2: Failed"
    fi

    log_info "Testing TLS 1.3..."
    if echo | timeout 5 openssl s_client -connect "$DOMAIN:443" -tls1_3 2>/dev/null | grep -q "Verify return code: 0"; then
        echo -e "${GREEN}✓${NC} TLS 1.3: Supported"
    else
        echo -e "${YELLOW}⚠${NC} TLS 1.3: Not supported (optional)"
    fi

    echo ""
    log_info "For detailed SSL analysis, visit:"
    log_info "https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
}

print_summary() {
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "  SSL & Security Setup Complete!"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
    echo "  Domain: $DOMAIN"
    echo "  Certificate Path: $CERTBOT_DIR/live/$DOMAIN/"
    echo "  Web Server: $WEB_SERVER"
    echo ""
    echo "  HTTPS URL: https://$DOMAIN"
    echo ""
    echo "  Certificate auto-renewal: Configured ✓"
    echo "  Next renewal check: $(date -d '+12 hours' '+%Y-%m-%d %H:00')"
    echo ""
    echo "  Logs: $LOG_FILE"
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
    echo "  Manual Commands:"
    echo "    Renew certificate:  sudo certbot renew"
    echo "    Check status:       sudo certbot certificates"
    echo "    Test SSL:           sudo $0 --test"
    echo "    Security audit:     sudo $0 --audit"
    echo ""
}

show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --install         Install SSL certificate (default action)"
    echo "  --renew           Force certificate renewal"
    echo "  --verify          Verify existing certificate"
    echo "  --repair          Fix common security issues"
    echo "  --audit           Run security audit"
    echo "  --test            Test SSL configuration"
    echo "  --help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  sudo $0                    # Install SSL certificate"
    echo "  sudo $0 --renew            # Force renewal"
    echo "  sudo $0 --verify           # Check certificate status"
    echo "  sudo $0 --audit            # Run security audit"
    echo "  sudo $0 --repair           # Fix issues"
    echo ""
    echo "Important Notes:"
    echo "  - Edit configuration variables at the top of this script"
    echo "  - For internal networks, use DNS challenge (CHALLENGE_TYPE=\"dns\")"
    echo "  - Ensure firewall allows ports 80 and 443"
    echo "  - Auto-renewal runs automatically twice daily"
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
            --renew)
                action="renew"
                shift
                ;;
            --verify)
                action="verify"
                shift
                ;;
            --repair)
                action="repair"
                shift
                ;;
            --audit)
                action="audit"
                shift
                ;;
            --test)
                action="test"
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
            validate_domain
            install_ssl_certificate
            if [ "$WEB_SERVER" == "apache" ]; then
                configure_ssl_apache
            else
                configure_ssl_nginx
            fi
            setup_auto_renewal
            configure_firewall
            verify_certificate
            ssl_test
            print_summary
            ;;
        renew)
            log_section "Forcing Certificate Renewal"
            certbot renew --force-renewal
            systemctl reload "$WEB_SERVER"
            log "Certificate renewed and web server reloaded ✓"
            verify_certificate
            ;;
        verify)
            verify_certificate
            ssl_test
            ;;
        repair)
            repair_issues
            security_audit
            ;;
        audit)
            security_audit
            ;;
        test)
            ssl_test
            ;;
    esac

    log "Operation complete!"
}

# Run main function with all arguments
main "$@"

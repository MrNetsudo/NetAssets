#!/bin/bash

#═══════════════════════════════════════════════════════════════
# NetAssets v2.0 - Automated Update Script
# Author: Miguel Jimenez
# Description: Safely updates NetAssets from GitHub repository
#═══════════════════════════════════════════════════════════════

set -e  # Exit on error

# ──────────────────────────────────────────────────────────────
# CONFIGURATION - EDIT THESE VALUES
# ──────────────────────────────────────────────────────────────

# Web server document root where NetAssets is deployed
WEB_ROOT="/var/www/netassets.gtk.gtech.com/html"

# GitHub repository URL
GITHUB_REPO="https://github.com/MrNetsudo/NetAssets.git"

# Temporary directory for git clone
TEMP_DIR="/tmp/netassets-update-$(date +%s)"

# Backup directory (keeps last 5 backups)
BACKUP_DIR="/var/backups/netassets"

# Web server user (usually www-data for Apache/Nginx)
WEB_USER="www-data"
WEB_GROUP="www-data"

# Files to preserve (won't be overwritten)
PRESERVE_FILES=(
    "device_data_combined.js"
    ".htpasswd"
)

# Log file
LOG_FILE="/var/log/netassets-update.log"

# ──────────────────────────────────────────────────────────────
# COLOR CODES
# ──────────────────────────────────────────────────────────────

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_header() {
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "  NetAssets v2.0 - Automated Update"
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

    if ! command -v git &> /dev/null; then
        missing_deps+=("git")
    fi

    if ! command -v rsync &> /dev/null; then
        missing_deps+=("rsync")
    fi

    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "Missing dependencies: ${missing_deps[*]}"
        log_info "Install with: apt update && apt install -y ${missing_deps[*]}"
        exit 1
    fi

    log "All dependencies satisfied ✓"
}

check_directories() {
    log "Checking directories..."

    if [ ! -d "$WEB_ROOT" ]; then
        log_error "Web root directory not found: $WEB_ROOT"
        log_info "Please update WEB_ROOT variable in this script"
        exit 1
    fi

    # Create backup directory if it doesn't exist
    if [ ! -d "$BACKUP_DIR" ]; then
        log_info "Creating backup directory: $BACKUP_DIR"
        mkdir -p "$BACKUP_DIR"
    fi

    # Create log directory if it doesn't exist
    local log_dir=$(dirname "$LOG_FILE")
    if [ ! -d "$log_dir" ]; then
        mkdir -p "$log_dir"
    fi

    log "Directories verified ✓"
}

create_backup() {
    log "Creating backup of current deployment..."

    local backup_name="netassets-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
    local backup_path="$BACKUP_DIR/$backup_name"

    # Create compressed backup
    tar -czf "$backup_path" -C "$(dirname $WEB_ROOT)" "$(basename $WEB_ROOT)" 2>/dev/null

    if [ $? -eq 0 ]; then
        log "Backup created: $backup_path ✓"

        # Keep only last 5 backups
        log_info "Cleaning old backups (keeping last 5)..."
        cd "$BACKUP_DIR"
        ls -t netassets-backup-*.tar.gz | tail -n +6 | xargs -r rm --

        echo "$backup_path" > "$BACKUP_DIR/latest-backup.txt"
    else
        log_error "Backup failed!"
        exit 1
    fi
}

clone_repository() {
    log "Cloning latest version from GitHub..."

    # Remove temp directory if it exists
    if [ -d "$TEMP_DIR" ]; then
        rm -rf "$TEMP_DIR"
    fi

    # Clone repository
    git clone --depth 1 "$GITHUB_REPO" "$TEMP_DIR" >> "$LOG_FILE" 2>&1

    if [ $? -eq 0 ]; then
        log "Repository cloned successfully ✓"
    else
        log_error "Failed to clone repository from GitHub"
        log_info "Check your internet connection and repository URL"
        exit 1
    fi
}

preserve_files() {
    log "Preserving existing data files..."

    for file in "${PRESERVE_FILES[@]}"; do
        if [ -f "$WEB_ROOT/$file" ]; then
            log_info "Backing up: $file"
            cp "$WEB_ROOT/$file" "$TEMP_DIR/$file" 2>/dev/null || true
        fi
    done

    log "Files preserved ✓"
}

deploy_update() {
    log "Deploying update..."

    # Sync files (exclude .git directory)
    rsync -av --delete \
        --exclude='.git' \
        --exclude='.gitignore' \
        --exclude='*.md' \
        --exclude='push-to-github.sh' \
        --exclude='update-netassets.sh' \
        "$TEMP_DIR/" "$WEB_ROOT/" >> "$LOG_FILE" 2>&1

    if [ $? -eq 0 ]; then
        log "Files deployed successfully ✓"
    else
        log_error "Deployment failed!"
        rollback
        exit 1
    fi
}

set_permissions() {
    log "Setting correct permissions..."

    # Set ownership
    chown -R $WEB_USER:$WEB_GROUP "$WEB_ROOT"

    # Set file permissions (644 for files, 755 for directories)
    find "$WEB_ROOT" -type f -exec chmod 644 {} \;
    find "$WEB_ROOT" -type d -exec chmod 755 {} \;

    # Make .htaccess readable
    if [ -f "$WEB_ROOT/.htaccess" ]; then
        chmod 644 "$WEB_ROOT/.htaccess"
    fi

    log "Permissions set ✓"
}

verify_deployment() {
    log "Verifying deployment..."

    if [ ! -f "$WEB_ROOT/index.html" ]; then
        log_error "index.html not found after deployment!"
        rollback
        exit 1
    fi

    # Check for version meta tag
    if grep -q 'meta name="version"' "$WEB_ROOT/index.html"; then
        local version=$(grep 'meta name="version"' "$WEB_ROOT/index.html" | sed 's/.*content="\([^"]*\)".*/\1/')
        log "Deployed version: $version ✓"
    fi

    log "Deployment verified ✓"
}

cleanup() {
    log "Cleaning up temporary files..."

    if [ -d "$TEMP_DIR" ]; then
        rm -rf "$TEMP_DIR"
    fi

    log "Cleanup complete ✓"
}

rollback() {
    log_warn "Initiating rollback to previous version..."

    local latest_backup=$(cat "$BACKUP_DIR/latest-backup.txt" 2>/dev/null)

    if [ -z "$latest_backup" ] || [ ! -f "$latest_backup" ]; then
        log_error "No backup found for rollback!"
        exit 1
    fi

    log_info "Restoring from: $latest_backup"

    # Extract backup
    tar -xzf "$latest_backup" -C "$(dirname $WEB_ROOT)" 2>/dev/null

    if [ $? -eq 0 ]; then
        log "Rollback successful ✓"
        set_permissions
    else
        log_error "Rollback failed!"
        exit 1
    fi
}

restart_webserver() {
    log "Checking if web server restart is needed..."

    # Detect web server
    if systemctl is-active --quiet apache2; then
        log_info "Reloading Apache..."
        systemctl reload apache2
        log "Apache reloaded ✓"
    elif systemctl is-active --quiet nginx; then
        log_info "Reloading Nginx..."
        systemctl reload nginx
        log "Nginx reloaded ✓"
    else
        log_info "No web server reload needed (static files only)"
    fi
}

print_summary() {
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "  Update Complete!"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
    echo "  Deployment Path: $WEB_ROOT"
    echo "  Backup Location: $BACKUP_DIR"
    echo "  Log File: $LOG_FILE"
    echo ""
    echo "  Application URL: https://netassets.gtk.gtech.com"
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
}

show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --no-backup       Skip backup creation (not recommended)"
    echo "  --rollback        Rollback to previous backup"
    echo "  --dry-run         Show what would be done without making changes"
    echo "  --help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  sudo $0                    # Normal update with backup"
    echo "  sudo $0 --rollback         # Restore previous version"
    echo "  sudo $0 --dry-run          # Test without making changes"
    echo ""
}

# ──────────────────────────────────────────────────────────────
# MAIN EXECUTION
# ──────────────────────────────────────────────────────────────

main() {
    local skip_backup=false
    local dry_run=false
    local do_rollback=false

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --no-backup)
                skip_backup=true
                shift
                ;;
            --rollback)
                do_rollback=true
                shift
                ;;
            --dry-run)
                dry_run=true
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

    # Handle rollback
    if [ "$do_rollback" = true ]; then
        check_root
        rollback
        restart_webserver
        log "Rollback complete!"
        exit 0
    fi

    # Dry run mode
    if [ "$dry_run" = true ]; then
        log_info "DRY RUN MODE - No changes will be made"
        log_info "Web Root: $WEB_ROOT"
        log_info "GitHub Repo: $GITHUB_REPO"
        log_info "Backup Dir: $BACKUP_DIR"
        log_info "Preserve Files: ${PRESERVE_FILES[*]}"
        exit 0
    fi

    # Normal update process
    check_root
    check_dependencies
    check_directories

    if [ "$skip_backup" = false ]; then
        create_backup
    else
        log_warn "Skipping backup (not recommended!)"
    fi

    clone_repository
    preserve_files
    deploy_update
    set_permissions
    verify_deployment
    cleanup
    restart_webserver

    print_summary

    log "Update completed successfully!"
}

# Run main function with all arguments
main "$@"

# NetAssets - Network Device Inventory Dashboard

A modern, enterprise-grade web-based dashboard for managing and visualizing network device inventories across multiple regions and data centers. Supporting multi-vendor environments including Fortinet, Palo Alto, Cisco, Check Point, Juniper, F5, and other enterprise network equipment.

**Author:** Miguel Jimenez

## Overview

NetAssets provides Network Operations Center (NOC) teams with a comprehensive view of network device inventory, including serial numbers, HA configurations, regional distribution, and analytics insights. Built as a single-page application with no server dependencies, featuring intelligent device detection and a premium glassmorphism design.

## Key Features

### 🌍 Multi-Level Geographic Filtering
- **Global Coverage**: Filter by continent (North America, Europe, Asia Pacific)
- **Country-Level**: Separate filters for US, EU countries, and international regions
- **Granular Location**: State/city detection for US locations, country/city for EU
- **Smart Detection**: Automatic location inference from device names and serial numbers

### 🔧 Multi-Vendor Support
Intelligent detection and management for:
- **Fortinet FortiGate**: 30/40/60/80/81/100/200/300/400/500/600/1000/2000/3000 series + VM
- **Palo Alto Networks**: PA-200/400/800/3000/5000/7000 series + VM
- **Cisco ASA & Firepower**: Full ASA series and FTD platforms
- **Check Point**: All major appliance series
- **Juniper SRX**: SRX series security platforms
- **F5 Networks**: BIG-IP load balancers and ADC platforms

### 🎯 Advanced Filtering System
- **Device Type**: Firewall, Router, Switch, Load Balancer
- **Site Type**: PDC, BDC, CAT, HQ, Branch, Remote, Cloud, Colo
- **Device Role**: VPN Gateway, WAN Edge, DMZ, Internet Edge, Access, Core
- **Configuration**: HA Configured vs Standalone
- **Vendor-Specific**: Filter by manufacturer
- **Multi-Dimensional**: All filters work simultaneously

### 📥 Intelligent CSV Import
- **Flexible Column Detection**: Automatically recognizes multiple column name variations
  - Example: "sn", "serial", "serial number", "serialnumber", "primary sn" all work
- **Smart Defaults**: Auto-generates missing device names, defaults missing regions
- **Auto-Detection**: Automatically detects vendors, models, locations, site types, device roles
- **Serial Numbers Optional**: No longer required - system adapts to your data
- **Import Feedback**: Real-time progress indicators and detection statistics
- **Preview Before Import**: See exactly what will be imported with smart detection hints

### 🎨 Premium Design
- **Glassmorphism UI**: Modern frosted glass effects with backdrop blur
- **Gradient Accents**: Professional indigo/purple/pink color scheme
- **Smooth Animations**: Cubic-bezier transitions for premium feel
- **Dark Mode**: Full dark mode support with persistent preferences
- **Responsive**: Optimized for mobile, tablet, and desktop

### 📊 Data Operations
- **Import Formats**: CSV (flexible columns), JSON (API-ready)
- **Import Modes**: Replace all data or append to existing
- **Export Formats**:
  - CSV (Excel-compatible)
  - JSON (API-ready)
  - Markdown (documentation-ready)
  - Formatted text (NOC tickets)
- **Clear Data**: Reset dashboard to empty state
- **Bulk Copy**: Copy all serial numbers at once
- **Print-Friendly**: Optimized layouts for PDF generation

### 📈 Analytics Dashboard
- Data Center distribution (PDC/BDC/CAT)
- HA configuration status visualization
- Regional device distribution
- Model breakdown charts by vendor
- Critical infrastructure site monitoring
- Single Point of Failure (SPOF) detection

### ⌨️ User Experience
- Dual view modes (table and card layouts)
- Real-time search across all fields
- Keyboard shortcuts (Ctrl+F, Ctrl+K, Ctrl+P)
- One-click serial number copying
- Row selection for bulk operations
- Sortable columns with visual indicators

## Quick Start

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/MrNetsudo/Network-Assets-Inventory.git
cd Network-Assets-Inventory
```

2. **Deploy to web server:**

See `UBUNTU_SERVER_SETUP.md` for comprehensive deployment instructions including:
- Apache setup with virtual hosts
- Nginx configuration with server blocks
- SSL/TLS with Let's Encrypt
- Firewall configuration (UFW)
- Python HTTP server for testing

Quick test deployment:
```bash
python3 -m http.server 8000
# Then open: http://localhost:8000
```

3. **Access the dashboard:**
   - Open `index.html` in a modern web browser
   - Dashboard starts empty - use Import to add your device data
   - Or navigate to your deployed URL

### Security Setup (Recommended)

Since this manages sensitive network infrastructure data:

1. **Add Password Protection:**
   - Edit `.htaccess` and uncomment authentication directives
   - Create password file: `htpasswd -c /path/to/.htpasswd admin`
   - Update `AuthUserFile` path in `.htaccess`

2. **Use HTTPS:**
   - See `UBUNTU_SERVER_SETUP.md` for Let's Encrypt setup
   - Always deploy over encrypted connection

3. **Restrict Access:**
   - Configure firewall rules
   - Limit access to NOC/authorized personnel
   - Use VPN for remote access

## Usage

### Starting with Your Data

The dashboard starts empty by design. Import your device inventory:

1. **Prepare CSV File:**
   - Use any column names - system auto-detects: `devicename`, `device name`, `hostname`, `sn`, `serial`, etc.
   - Minimum requirement: Just device names (serial numbers optional)
   - System auto-detects: vendors, models, locations, site types, device roles

2. **Import Process:**
   - Click "Import" button
   - Select CSV file
   - Review preview showing what will be auto-detected
   - Choose Replace or Append mode
   - Confirm import

3. **Example CSV Format:**
```csv
devicename,region,serial,ha status
NYC-FW-01,US,FGT60F1234567890,yes
LON-RTR-01,EU,PA-5000-12345678,no
```

### Filtering Devices

**Geographic Filtering:**
- Click continent groups (North America, Europe, Asia Pacific)
- Select specific countries or regions
- Filter cascades: Continent → Country → State → City

**Device Filtering:**
- **Vendor**: Filter by manufacturer (Fortinet, Palo Alto, Cisco, etc.)
- **Type**: Firewall, Router, Switch, Load Balancer
- **Site**: PDC, BDC, CAT, HQ, Branch, Remote, Cloud, Colo
- **Role**: VPN Gateway, WAN Edge, DMZ, Internet Edge, Access, Core
- **Configuration**: HA Configured or Standalone

**Search:**
- Use search box for device names, serials, models
- Press `Ctrl+F` to focus search
- Press `Ctrl+K` to clear all filters

### Analytics & Insights

Click "Analytics Dashboard" to view:
- Device distribution by data center
- HA configuration analysis
- Regional breakdown with charts
- Critical infrastructure monitoring
- Single point of failure detection
- Vendor diversity metrics

### Data Management

**Clear Data:**
- Click "Clear Data" button to reset dashboard
- Confirmation dialog prevents accidental deletion
- Useful when switching between different inventories

**Export Data:**
- Select export format based on use case
- CSV for Excel and analysis
- JSON for automation and APIs
- Markdown for documentation
- Text format for NOC tickets

### Keyboard Shortcuts

- `Ctrl+F`: Focus search box
- `Ctrl+K`: Clear all filters and search
- `Ctrl+P`: Print current view

## File Structure

```
netassets/
├── index.html                  # Main dashboard application (single-page app)
├── UBUNTU_SERVER_SETUP.md      # Comprehensive deployment guide
├── .htaccess                   # Apache security configuration
├── .gitignore                  # Protects sensitive data from commits
├── LICENSE                     # MIT License
├── CONTRIBUTING.md             # Contribution guidelines
├── README.md                   # This file
├── QUICK_START.txt             # Quick deployment guide
└── push-to-github.sh           # GitHub upload helper script
```

**Note**: `device_data_combined.js` and CSV files are excluded from repository for security. Dashboard loads empty and uses Import feature for data.

## Smart Detection System

NetAssets automatically detects and enriches your data:

### Vendor Detection
Recognizes devices from serial numbers and naming patterns:
- Fortinet: FGT, FG, FGVM prefixes
- Palo Alto: PA- prefixes and model numbers
- Cisco: ASA, FPR, FTD naming
- Check Point: CP, CPAP patterns
- Juniper: SRX series
- F5: BIG-IP identifiers

### Model Detection
Automatically identifies:
- FortiGate series (30E, 60F, 100F, 200E, 500E, 1000D, etc.)
- Palo Alto models (PA-220, PA-850, PA-5220, etc.)
- Cisco ASA/Firepower (ASA5506, FPR1140, etc.)
- Full model and series information

### Location Detection
Smart geolocation from device names:
- **US**: All 50 states, major cities (NYC, LA, Chicago, Houston, etc.)
- **EU**: 15+ countries, major cities (London, Paris, Berlin, Munich, etc.)
- **Hierarchical**: Country → State/Region → City

### Site & Role Detection
Infers from naming conventions:
- **Sites**: PDC, BDC, CAT, HQ, Branch, Remote, Cloud, Colo
- **Roles**: VPN, WAN, DMZ, Internet, Access, Core, Edge

## Technical Details

### Browser Compatibility
- Chrome/Edge 90+ (Recommended)
- Firefox 88+
- Safari 14+
- Modern mobile browsers

### Dependencies
- **Chart.js 4.4.0**: Loaded from CDN for analytics
- **Pure JavaScript**: No frameworks required
- **No Server**: Runs entirely client-side

### Performance
- Handles 1,000+ devices smoothly
- Client-side filtering and sorting
- Optimized rendering for large datasets
- Mobile-optimized with touch support

### Design System
- **Colors**: CSS custom properties (--primary-color, --secondary-color, --accent-color)
- **Spacing**: Consistent scale (--spacing-xs through --spacing-lg)
- **Radius**: Standardized border radius (--radius-sm through --radius-lg)
- **Effects**: Glassmorphism with backdrop-filter, multi-layer shadows
- **Animations**: Cubic-bezier easing for smooth transitions

## Security Considerations

⚠️ **Important**: This dashboard manages sensitive infrastructure data

- **No Sensitive Data in Repository**: Device data, CSVs, and serials excluded by .gitignore
- **Authentication Required**: Use `.htaccess` or equivalent for access control
- **HTTPS Mandatory**: Always deploy over encrypted connection
- **Access Restrictions**: Limit to authorized NOC personnel only
- **Data Handling**: Contains serial numbers, topology, and configuration details
- **Regular Audits**: Review access logs and user permissions

## Troubleshooting

### Dashboard Shows Empty
- **Expected Behavior**: Dashboard starts empty by design
- **Solution**: Use Import feature to add your device inventory

### Import Errors
- **Column Not Found**: System auto-detects most column names - check preview
- **Validation Failed**: Ensure at least device names are present
- **Detection Issues**: Verify serial numbers follow vendor patterns

### Charts Not Displaying
- **CDN Issue**: Check internet connection (Chart.js loads from CDN)
- **Browser Cache**: Clear cache with Ctrl+Shift+R
- **Firewall**: Ensure CDN domains are accessible

### Performance Issues
- **Large Dataset**: Consider filtering before viewing
- **Browser Memory**: Close unused tabs, restart browser
- **Device Limitations**: Use table view on mobile devices

### Visual Issues
- **Glassmorphism Not Working**: Update to modern browser with backdrop-filter support
- **Dark Mode Issues**: Clear browser cache and localStorage
- **Layout Problems**: Ensure viewport meta tag is present

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Test thoroughly with sample data
4. Commit your changes with clear messages
5. Push to the branch (`git push origin feature/improvement`)
6. Open a Pull Request with detailed description

**Areas for Contribution:**
- Additional vendor support
- New filter types
- Enhanced analytics
- Performance optimizations
- UI/UX improvements

## License

Copyright (c) 2025 Miguel Jimenez

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or feature requests:
- **GitHub Issues**: Submit via repository issues page
- **Pull Requests**: Contributions welcome

## Acknowledgments

- Built for enterprise network operations teams
- Designed for Network Operations Centers (NOC)
- Supports multi-vendor network infrastructure management
- Initially designed for FortiGate, expanded to multi-vendor support
- Premium design inspired by modern enterprise applications

---

**Last Updated**: October 2025
**Version**: 2.0.0
**Status**: Production Ready
**Maintained by**: Miguel Jimenez

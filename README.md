# NetAssets - Network Device Inventory Dashboard

A modern, interactive web-based dashboard for managing and visualizing network device inventories across multiple regions and data centers. Supporting FortiGate, Cisco, Palo Alto, and other enterprise network equipment.

**Author:** Miguel Jimenez (Miguel@netsudo.com)

## Overview

NetAssets provides Network Operations Center (NOC) teams with a comprehensive view of network device inventory, including serial numbers, HA configurations, regional distribution, and analytics insights. Built as a single-page application with no server dependencies, making it easy to deploy anywhere.

## Features

### Core Functionality
- **Interactive Device Management**: View and manage 1,000+ network devices across multiple regions
- **Dual View Modes**: Switch between table and card layouts for optimal viewing
- **Advanced Filtering**: Filter by region, HA status, device model, and custom criteria
- **Real-time Search**: Search across device names, serial numbers, and models
- **Smart Analytics**: Visual charts and insights for infrastructure monitoring
- **Multi-Vendor Support**: Works with FortiGate, Cisco, Palo Alto, and other network devices

### Data Operations
- **Import Capabilities**:
  - CSV import with preview
  - JSON import with validation
  - Replace or append modes
  - Field mapping and validation
- **Export Capabilities**:
  - CSV (Excel-compatible)
  - JSON (API-ready)
  - Markdown (documentation-ready)
  - Formatted text (NOC tickets)
- **Bulk Operations**: Copy all serial numbers at once
- **Print-friendly**: Optimized layouts for PDF generation

### Analytics Dashboard
- Data Center distribution (PDC/BDC)
- HA configuration status visualization
- Regional device distribution
- Model breakdown charts
- Critical infrastructure site monitoring
- Single Point of Failure (SPOF) detection

### User Experience
- Dark mode support with persistent preferences
- Responsive design (mobile, tablet, desktop)
- Keyboard shortcuts (Ctrl+F, Ctrl+K, Ctrl+P)
- One-click serial number copying
- Row selection for bulk operations
- Sortable columns with visual indicators

## Quick Start

### Installation

1. Clone this repository:
```bash
git clone https://github.com/MrNetsudo/Network-Assets-Inventory.git
cd Network-Assets-Inventory
```

2. Deploy to your web server:
```bash
# Option A: Copy files to web server
scp index.html device_data_combined.js .htaccess user@server:/path/to/web/root/

# Option B: Use with a local server for testing
python3 -m http.server 8000
# Then open: http://localhost:8000
```

3. Access the dashboard:
   - Open `index.html` in a modern web browser
   - Or navigate to your deployed URL

### Security Setup (Recommended)

Since this contains sensitive device information, add password protection:

1. Edit `.htaccess` and uncomment the authentication directives
2. Create a password file:
```bash
htpasswd -c /path/to/.htpasswd admin
```
3. Update the `AuthUserFile` path in `.htaccess`

## Usage

### Filtering Devices
- **Region Filter**: Click region buttons to filter by geographic location
- **Configuration Type**: Filter by HA Configured or Standalone devices
- **Device Series**: Filter by device models and series
- **Quick Access**: Use predefined filters for VPN, Firewall, PDC/BDC sites
- **Custom Filters**: Create your own filter combinations

### Searching
- Use the search box to find devices by name or serial number
- Press `Ctrl+F` to quickly focus the search input
- Click the X button or press `Ctrl+K` to clear search and filters

### Importing & Exporting Data

**Import:**
1. Click the "Import" button
2. Choose CSV or JSON format
3. Preview data before importing
4. Select Replace or Append mode

**Export:**
1. Click the "Export" button
2. Select your preferred format:
   - **Standard CSV**: For Excel and spreadsheet applications
   - **JSON Format**: For APIs and automation scripts
   - **Markdown Table**: For documentation and wikis
   - **Formatted Text**: For NOC tickets and reports

### Analytics
- Click "Analytics Dashboard" to view comprehensive charts and insights
- View data center distribution, HA status, regional breakdown
- Monitor critical infrastructure sites
- Identify single points of failure

### Keyboard Shortcuts
- `Ctrl+F`: Focus search box
- `Ctrl+K`: Clear all filters
- `Ctrl+P`: Print current view

## File Structure

```
netassets/
├── index.html                  # Main dashboard application
├── device_data_combined.js     # Device inventory data
├── .htaccess                   # Apache security configuration
├── .gitignore                  # Git ignore rules
├── LICENSE                     # MIT License
├── CONTRIBUTING.md             # Contribution guidelines
├── README.md                   # This file
├── QUICK_START.txt             # Quick deployment guide
└── push-to-github.sh           # GitHub upload helper script
```

## Updating Device Data

When your network device inventory changes:

1. Export new CSV data from your management platform (FortiManager, Cisco DNA, Panorama, etc.)
2. Use the Import feature in the dashboard, or convert CSV to JavaScript format:
```javascript
const DEVICE_DATA = [
  {
    region: "US",
    deviceName: "SITE-FW01",
    sn: "FGT60EXXXXXXXXXX",
    hasHA: true,
    sn_ha1: "FGT60EXXXXXXXXXX",
    sn_ha2: "FGT60EXXXXXXXXXX"
  },
  // ... more devices
];
```
3. Replace `device_data_combined.js` with the new file
4. Upload to your web server

## Technical Details

### Browser Compatibility
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Modern mobile browsers

### Dependencies
- **Chart.js 4.4.0**: Loaded from CDN for analytics charts
- No server-side requirements
- Pure JavaScript (no frameworks)

### Performance
- Handles 1,000+ devices smoothly
- Client-side filtering and sorting
- Lazy rendering for large datasets
- Optimized for mobile devices

## Security Considerations

- **Authentication**: Use `.htaccess` for password protection
- **HTTPS**: Always deploy over HTTPS
- **Access Control**: Restrict access to authorized personnel only
- **Data Sensitivity**: Contains serial numbers and infrastructure topology
- **Regular Updates**: Keep device data current and accurate

## Troubleshooting

### Blank Page
- Check browser console (F12) for errors
- Verify `device_data_combined.js` is in the same directory
- Ensure both files are uploaded correctly

### "DEVICE_DATA undefined" Error
- Confirm `device_data_combined.js` is properly formatted
- Check file permissions (should be 644)
- Verify the file path is correct

### Charts Not Showing
- Check internet connection (Chart.js loads from CDN)
- Clear browser cache (Ctrl+Shift+R)
- Verify Chart.js CDN is accessible

### Print Issues
- Use "Print" button instead of browser's print function
- Ensure print-friendly mode is enabled
- Check page orientation and margins

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/improvement`)
5. Open a Pull Request

## License

Copyright (c) 2025 Miguel Jimenez (Miguel@netsudo.com)

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or feature requests:
- **Email**: Miguel@netsudo.com
- **Website**: https://netsudo.com
- **Issues**: Submit via GitHub Issues

## Acknowledgments

- Built for enterprise network operations teams
- Designed for Network Operations Centers (NOC)
- Supports multi-vendor network infrastructure management
- Initially designed for FortiGate but expandable to any network device

---

**Last Updated**: October 2025
**Version**: 1.0.0
**Maintained by**: Miguel Jimenez @ NetSudo

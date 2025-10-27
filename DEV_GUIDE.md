# Developer Guide

This file provides guidance for developers when working with code in this repository.

## Project Overview

NetAssets is a single-page web application for managing network device inventories across multiple regions and data centers. It's a pure JavaScript implementation with no framework dependencies, designed for Network Operations Center (NOC) teams to track multi-vendor network infrastructure.

## Architecture

The entire application is contained in a single **index.html** file (307KB) with embedded JavaScript. This monolithic approach ensures:
- No build process required
- No npm dependencies
- Direct browser execution
- Easy deployment to any web server

### Key Global Variables
- `DEVICE_DATA`: Main array storing all device objects
- `filteredDevices`: Current filtered view of devices
- `currentFilters`: Active filter state object
- `isDarkMode`: Theme preference flag

## Development Commands

### Local Testing
```bash
# Quick local server (Python 3)
python3 -m http.server 8000
# Access at http://localhost:8000

# Run test scripts
node test_full_flow.js     # Test complete CSV import flow
node test_parse.js          # Test CSV parsing logic
node test_csv_parse.html    # Browser-based CSV testing
```

### Deployment
```bash
# No build required - just copy files
scp index.html user@server:/path/to/webroot/
scp .htaccess user@server:/path/to/webroot/  # Optional security

# Set up authentication (if using .htaccess)
htpasswd -c /path/to/.htpasswd admin
```

## Core Functions and Their Locations

### Detection System (index.html)
- `detectVendorFromCSV()` - Line ~3705: Vendor detection from device data
- `detectVendorIntelligent()` - Line ~7093: Enhanced vendor detection with serial number analysis
- `detectModelIntelligent()` - Line ~7147: Model detection from serial numbers and names
- `detectLocation()` - Line ~4122: Geographic location detection (US states, EU countries, cities)
- `detectSiteType()` - Line ~4223: Site type detection (PDC, BDC, CAT, HQ, Branch)
- `detectDeviceRole()` - Line ~4240: Device role detection (VPN, WAN, DMZ, Edge)

### Data Processing
- `parseCSV()` - Line ~6415: Main CSV parsing with flexible column detection
- `parseCSVLine()` - Line ~7301: Individual CSV line processing
- `confirmImport()` - Line ~7475: Import confirmation with data enrichment
- `exportData()` - Export to CSV/JSON/Markdown/Text formats
- `renderTable()` - Dynamic table generation with filtering

### Filter Management
- `applyFilters()`: Applies all active filters to device list
- `clearAllFilters()`: Resets all filter states
- `updateFilterDisplay()`: Updates UI filter badges

## Data Flow

1. **Import**: CSV/JSON → `parseCSV()`/`parseJSON()` → Preview → `confirmImport()`
2. **Detection**: Raw data → Detection functions → Enriched device object
3. **Storage**: Enriched data → `DEVICE_DATA` array → localStorage persistence
4. **Display**: `DEVICE_DATA` → `applyFilters()` → `filteredDevices` → `renderTable()`/`renderCards()`
5. **Export**: `filteredDevices` → Format converter → Download

## Device Object Structure

```javascript
{
    deviceName: "NYC-FW-01",
    vendor: "Fortinet",           // Auto-detected or CSV
    model: "FortiGate-60F",        // Auto-detected or CSV
    series: "FGT60F",              // Auto-detected
    deviceType: "Firewall",        // Auto-detected or CSV
    sn: "FGT60F123456789",         // Primary serial
    secondarySN: "",               // For HA pairs
    region: "US",                  // Geographic region
    location: "New York",          // Auto-detected city/state
    country: "United States",      // Auto-detected
    siteType: "HQ",                // Auto-detected (PDC/BDC/etc)
    deviceRole: "Perimeter",       // Auto-detected role
    haStatus: "standalone"         // HA configuration status
}
```

## Testing Approach

The project uses Node.js scripts for testing core functionality:

- **test_full_flow.js**: Tests complete CSV import → detection → enrichment → display flow
- **test_parse.js**: Unit tests for CSV parsing and column detection
- **test_csv_parse.html**: Browser-based testing interface for CSV import
- **validate_import.html**: Validation tool for import functionality

Run tests before making changes to detection algorithms or CSV parsing logic.

## Import/Export Capabilities

### CSV Import Features
- **Flexible column naming**: Recognizes variations (e.g., "sn", "serial", "serial number")
- **Smart defaults**: Generates device names if missing, defaults regions
- **Auto-enrichment**: Detects vendor/model/location from serial numbers and naming patterns
- **Preview before import**: Shows detection results before committing

### Supported Export Formats
- **CSV**: Excel-compatible with all device fields
- **JSON**: API-ready format with complete data
- **Markdown**: Table format for documentation
- **Text**: Formatted for NOC tickets and reports

## Vendor Detection Patterns

The system recognizes devices from multiple vendors through serial number prefixes and naming conventions:

- **Fortinet**: FGT, FG, FGVM prefixes → FortiGate models
- **Palo Alto**: PA- prefixes → PA-220, PA-850, PA-5260, etc.
- **Cisco**: ASA, FPR, FTD patterns → ASA and Firepower models
- **Check Point**: CP, CPAP patterns → Check Point appliances
- **Juniper**: SRX patterns → SRX series devices
- **F5**: BIG-IP identifiers → Load balancers

## Location Intelligence

The system automatically detects geographic information from device names:

- **US States**: All 50 states + major cities (NYC, LA, CHI, HOU, etc.)
- **EU Countries**: 15+ countries with major cities (LON, PAR, BER, MUN, etc.)
- **Hierarchy**: Country → State/Region → City extraction
- **Fallback**: Defaults to "Unknown" when detection fails

## Deployment Notes

- **No device_data_combined.js in repo**: Security measure - data loaded via import
- **Dashboard starts empty**: By design - use Import feature to populate
- **.htaccess security**: Uncomment authentication lines for production
- **Chart.js CDN dependency**: Only external dependency for analytics charts
- **localStorage persistence**: Preferences and data survive page refreshes

Development Guidelines:
1. First think through the problem, read the codebase for relevant files, and write a plan to tasks/todo.md.
2. The plan should have a list of todo items that you can check off as you complete them
3. Before beginning work, verify the plan is sound and comprehensive.
4. Work on the todo items systematically, marking them as complete as you go.
5. Provide high-level explanations of changes at each step
6. Make every task and code change as simple as possible. Avoid massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
7. Add a review section to the todo.md file with a summary of the changes and any other relevant information.
8. DO NOT BE LAZY. NEVER BE LAZY. IF THERE IS A BUG FIND THE ROOT CAUSE AND FIX IT. NO TEMPORARY FIXES. SENIOR DEVELOPER LEVEL ONLY.
9. MAKE ALL FIXES AND CODE CHANGES AS SIMPLE AS HUMANLY POSSIBLE. THEY SHOULD ONLY IMPACT NECESSARY CODE RELEVANT TO THE TASK AND NOTHING ELSE. IT SHOULD IMPACT AS LITTLE CODE AS POSSIBLE. GOAL IS TO NOT INTRODUCE ANY BUGS. IT'S ALL ABOUT SIMPLICITY.

CRITICAL: When debugging, you MUST trace through the ENTIRE code flow step by step. No assumptions. No shortcuts.

## Recent Major Enhancements (v2.1.0)

### UI Beautification - "Beautiful Modern Design"
Complete visual overhaul transforming the app into a premium, modern interface:

**Background & Base (Lines 57-87)**:
- Dynamic animated gradient background with radial overlays
- Shifting background animation (20s cycle) for depth and movement
- Glassmorphic container with backdrop blur

**Header Enhancement (Lines 118-169)**:
- Gradient header with glassmorphism (purple/indigo/pink)
- Animated shine effect sweeping across header
- Floating, rotating logo with hover interactions
- Staggered fade-in animations for all elements
- Pulsing version badge with glassmorphic styling

**Controls Section (Lines 405-440)**:
- Glassmorphic background with gradient
- Shimmer animation effect across controls
- Enhanced backdrop blur for depth

**Search Box (Lines 450-514)**:
- Rounded glassmorphic design with backdrop blur
- Search icon integrated into input
- Focus animations with glow and lift effects
- Gradient background with smooth transitions

**Buttons & Interactive Elements (Lines 317-379, 542-622)**:
- Glassmorphic buttons with gradient backgrounds
- Ripple effect animations on hover
- Scale and lift animations
- Radial gradient overlays on interaction
- Fade-in animations on load

**View Toggle Buttons (Lines 624-695)**:
- Enhanced with gradient overlays
- Ripple effects on hover
- Active state with gradient and shadow
- Smooth scale transitions

**Statistics Cards (Lines 838-979)**:
- Glassmorphic cards with gradient borders
- Animated gradient stripe at top (4s animation)
- Pulse effect in background
- Float-in animation on load
- Gradient text for stat values
- Number pop animation
- Hover lift with enhanced shadows

### Export System Excellence - "Microsoft Excel-Level"
Professional export system with enterprise-grade quality:

**Excel-Grade CSV Export (Lines 6725-6904)**:
- UTF-8 BOM for perfect Excel compatibility
- Professional header naming conventions
- Smart escaping for special characters
- Complete data validation before export
- Handles 1000+ devices efficiently

**Enterprise JSON Export (Lines 7341-7538)**:
- Complete nested data structure
- Metadata section with export info
- Calculated metrics included (health, risk, compliance)
- Device-level error handling
- Pretty-printed formatting

**Professional PDF Reports (Lines 8991-9525)**:
- A4-ready HTML format
- Executive summary section
- Statistics dashboard
- Risk distribution analysis
- Data quality metrics
- Unique report IDs for tracking
- Processing time metrics

**NOC Technical Reports (Lines 7874-8420)**:
- Terminal-style aesthetic for NOC teams
- Animated critical alerts
- Comprehensive metrics dashboard
- Data quality coverage bars
- Priority action recommendations
- Landscape orientation for wide tables
- Color-coded tables for quick scanning

**Data Validation & Diagnostics (Lines 10783-11105)**:
- `validateDeviceData()`: Field validation and completeness scoring
- `analyzeExportQuality()`: Coverage percentages and quality assessment
- `showExportDiagnostics()`: Visual quality dashboard
- `runDataCleanup()`: Automatic data fixes
- `bulkUpdateSerials()`: NOC bulk operations

### Key Design Principles Applied:
1. **Glassmorphism**: Frosted glass effects with backdrop blur
2. **Gradient Accents**: Multi-stop gradients for depth
3. **Smooth Animations**: Cubic-bezier easing for professional feel
4. **Micro-interactions**: Hover effects, ripples, pulses
5. **Performance**: GPU-accelerated animations (transform/opacity)
6. **Consistency**: Unified design language throughout
7. **Accessibility**: Maintained contrast and visual hierarchy

### Animation Techniques Used:
- `@keyframes` for complex animations
- `transform` for GPU acceleration
- `backdrop-filter` for glassmorphism
- `background-clip: text` for gradient text
- Staggered animations with delays
- Infinite loops for ambient effects
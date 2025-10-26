# 🚨 NOC-Critical Features Implementation Plan

## Features Being Added:

### 1. Health Score Calculation (0-100)
**Algorithm:**
```javascript
function calculateHealthScore(device) {
    let score = 0;
    
    // Base status scoring (50 points max)
    if (device.status === 'NORMAL') score += 50;
    else if (device.status === 'MINOR') score += 40;
    else if (device.status === 'UNKNOWN') score += 25;
    else if (device.status === 'CRITICAL') score += 0;
    
    // Operational state (20 points max)
    if (device.operationalState === 'UP') score += 20;
    else if (device.operationalState === 'NO_POLLING_POLICY') score += 10;
    
    // ICMP reachability (15 points max)
    if (device.icmpState === 'RESPONDING') score += 15;
    else if (device.icmpState === 'NOT_POLLED') score += 7;
    
    // Management state (10 points max)
    if (device.managementMode === 'MANAGED') score += 10;
    
    // Firmware presence (5 points max)
    if (device.firmwareVersion && device.firmwareVersion !== '') score += 5;
    
    return score;
}
```

### 2. Port Count Extraction
**Patterns:**
```javascript
function extractPortCount(model) {
    if (!model) return null;
    
    // Cisco patterns: WS-C3850-48T, WS-C2960X-24TS
    const ciscoMatch = model.match(/[-\s](\d{2,3})[PTX]/i);
    if (ciscoMatch) return parseInt(ciscoMatch[1]);
    
    // Juniper patterns: ex3300-48p, ex3200-24t
    const juniperMatch = model.match(/[-\s](\d{2})p/i);
    if (juniperMatch) return parseInt(juniperMatch[1]);
    
    return null;
}
```

### 3. Device Age Calculation (from serial numbers)
**Cisco Serial Decoding:**
```javascript
function calculateDeviceAge(serial) {
    if (!serial) return null;
    
    // Cisco format: [Site][YY][WW][Sequence]
    // Example: FTX1416AKXH = 2014, Week 16
    
    const ciscoMatch = serial.match(/^([A-Z]{3})(\d{2})(\d{2})/);
    if (ciscoMatch) {
        const year = 2000 + parseInt(ciscoMatch[2]);
        const week = parseInt(ciscoMatch[3]);
        
        // Calculate approximate date
        const mfgDate = new Date(year, 0, 1 + (week * 7));
        const ageYears = (Date.now() - mfgDate) / (1000 * 60 * 60 * 24 * 365);
        
        return {
            manufacturingDate: mfgDate,
            ageYears: Math.floor(ageYears),
            ageMonths: Math.floor(ageYears * 12)
        };
    }
    
    return null;
}
```

### 4. Critical Device Detection
**Criteria:**
- Status = CRITICAL
- Operational State = DOWN or NOT_RESPONDING
- ICMP State = NOT_RESPONDING
- Health Score < 50

### 5. Port Summary
**Categories:**
- Access Switches: 24-48 ports
- Distribution Switches: 48 ports
- Core Switches/Routers: Modular

### 6. Firmware Version Parsing
**Extract:**
- Major version
- Minor version
- Maintenance release
- Train (M/T/E for Cisco)

Example: `15.1(4)M9` →
- Major: 15
- Minor: 1
- Maintenance: 4
- Train: M (Mainline)
- Patch: 9

## Display Enhancements:

### Table Columns to Add:
1. **IP Address** (managementIP)
2. **Health Score** (calculated, color-coded)
3. **Status** (with icon: ✅ NORMAL, ⚠️ UNKNOWN, 🔴 CRITICAL)
4. **Port Count** (extracted from model)
5. **Age** (years, from serial)
6. **Firmware** (version)
7. **Last Seen** (days since statusLastModified)

### Color Coding:
- Health 90-100: Green (#28a745)
- Health 70-89: Yellow (#ffc107)
- Health 50-69: Orange (#fd7e14)
- Health 0-49: Red (#dc3545)

### Row Highlighting:
- Critical devices: Red background
- Offline devices: Gray background
- Normal devices: White background

## Export Enhancements:

### NOC CSV Export Columns:
1. Device Name
2. Model
3. Serial Number
4. IP Address
5. Status
6. Health Score
7. Operational State
8. Firmware Version
9. Port Count
10. Age (years)
11. Last Modified
12. Vendor
13. Tenant

### Sorting:
- Primary: Health Score (lowest first - critical on top)
- Secondary: Status (CRITICAL, UNKNOWN, NORMAL)
- Tertiary: Device Name

## Dashboard Metrics (Top of Page):

### Critical Alerts Box:
- 🔴 Critical Devices: X
- ⚠️ Devices Offline: X
- 📊 Average Health: XX%

### Device Distribution:
- By Vendor (pie chart data)
- By Status (counts)
- By Age (<2yr, 2-5yr, >5yr)

### Quick Filters:
- Show Critical Only
- Show Offline Only
- Show Managed Only
- Show by Vendor

## Implementation Steps:

1. ✅ Add NOC field mappings (DONE)
2. Add helper functions (calculateHealthScore, extractPortCount, calculateDeviceAge)
3. Integrate into confirmImport enrichment
4. Update table rendering to show new columns
5. Add color coding and row highlighting
6. Create NOC export function
7. Add dashboard summary stats
8. Test with real CSV

Ready to implement?

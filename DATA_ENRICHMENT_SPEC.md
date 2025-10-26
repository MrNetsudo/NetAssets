# 🏆 NetAssets: Enterprise Data Enrichment & Multi-Stakeholder Export System

## Vision: Transform Raw Hardware Data into Actionable Intelligence

### Current CSV Fields Available:
```
1. Status (CRITICAL, UNKNOWN, NORMAL, NOSTATUS)
2. Administrative State (NOT_POLLED, NO_POLLING_POLICY)
3. Operational State (UP, NO_POLLING_POLICY, NOT_POLLED)
4. Managed By (numeric ID)
5. Status Last Modified (date)
6. Name (device/component name)
7. Model Name (CISCO2811, WS-C3850-48T-E, ex3300-48p)
8. Model Type (cevChassis2811, cevChassisWSC6513)
9. Serial Number (FTX1416AKXH, FOC2042U0F0)
10. Firmware Version (15.1(4)M9, 03.06.05E)
11. Hardware Version (V08, V05, V07)
12. Software Version (15.1(4)M9, CW_VERSION$...)
13. Component Identifier (1, 1000, -1)
14. State Last Modified (date)
15. Description (chassis description, port count)
```

## Phase 1: Deep Field Extraction

### A. Hardware Intelligence
**Extract from existing fields:**
- **Vendor**: From model name (CISCO, WS-C, ex = Juniper)
- **Product Line**: Router, Switch, Firewall (from model prefix)
- **Port Count**: From model (WS-C3850-48T = 48 ports)
- **Form Factor**: Chassis, Module, Stack Member
- **Generation**: 2800 series, 3850 series, etc.

**Derive:**
- **Platform Category**: Access, Distribution, Core
- **Device Class**: Enterprise, Data Center, Branch
- **Stack Member**: From "Switch 1", "FPC 0" patterns

### B. Lifecycle Intelligence
**Calculate from data:**
- **Age**: From serial number prefix (FTX = manufacturing date code)
- **EOL Status**: Based on model + current date
- **Support Status**: EOS (End of Sale), EOM (End of Maintenance)
- **Firmware Currency**: Current vs. latest available

**Cisco Serial Decode:**
- FTX = Manufacturing site (Foxconn)
- Year/Week: FTX1416 = 2014, Week 16
- Model family encoded in serial

### C. Operational Intelligence
**From Status fields:**
- **Health Score**: NORMAL=100, UNKNOWN=50, CRITICAL=0
- **Managed Status**: Actively managed vs. discovered only
- **Reachability**: Responding vs. Not Responding
- **Last Seen**: Days since last status update

### D. Software Intelligence
**From Firmware/Software versions:**
- **OS Type**: IOS, IOS-XE, NX-OS, Junos
- **Version**: 15.1(4)M9 → Major: 15, Minor: 1, Maintenance: 4
- **Train**: M (Mainline), T (Technology), E (Enterprise)
- **Vulnerability Status**: Known CVEs for this version

### E. Network Topology
**Infer from data:**
- **Stack Configuration**: Multiple "Switch X" with same managed_by
- **Chassis Redundancy**: Dual supervisors
- **Module Inventory**: Line cards, power supplies

## Phase 2: Multi-Stakeholder Data Views

### View 1: NOC Operations Dashboard
**Focus**: Health, alerts, troubleshooting

**Key Metrics:**
- Critical/Down devices count
- Devices not responding (by location)
- Firmware out-of-date count
- Last polled status

**Alerts:**
- Devices offline >24hrs
- Critical status devices
- Firmware vulnerabilities
- Hardware EOL within 6 months

**Export Format:**
- Real-time dashboard (HTML)
- Daily email report (PDF)
- SNMP trap integration

### View 2: Corporate/Finance Asset Inventory
**Focus**: Asset value, compliance, depreciation

**Key Metrics:**
- Total device count by vendor
- Hardware value (estimated)
- Depreciation schedule
- Support contract status

**Fields:**
- Serial numbers (for warranty lookup)
- Purchase date (estimated from serial)
- Model numbers
- Location/tenant assignment

**Export Format:**
- Excel spreadsheet (pivot-ready)
- CSV for ERP import
- PDF summary report

### View 3: Security & Compliance
**Focus**: Vulnerabilities, patch status, compliance

**Key Metrics:**
- Devices with known CVEs
- Firmware versions (by criticality)
- Unsupported/EOL devices
- Unmanaged devices

**Fields:**
- Software versions
- Last update date
- EOL status
- Vulnerability count

**Export Format:**
- Security scorecard (PDF)
- Vulnerability CSV
- Compliance report

### View 4: Executive Summary
**Focus**: High-level KPIs, trends, risks

**Key Metrics:**
- Network health score (0-100)
- Infrastructure age profile
- Vendor diversity
- Critical risk count

**Visualizations:**
- Pie chart: Vendor distribution
- Bar chart: Device age
- Trend: Health over time
- Map: Geographic distribution

**Export Format:**
- Executive dashboard (PDF, 1-page)
- PowerPoint slides
- Monthly trend report

## Phase 3: Smart Export Engine

### Export Profiles

#### Profile 1: "NOC Handoff"
**Columns:**
- Device Name
- Model
- Serial Number
- Status
- IP Address
- Last Seen
- Firmware Version
- Health Score

**Format:** CSV
**Filtering:** Only managed devices, exclude pseudo/virtual
**Sorting:** By status (Critical first), then by name

#### Profile 2: "Finance Asset Report"
**Columns:**
- Serial Number
- Model
- Vendor
- Estimated Age
- EOL Date
- Tenant/Cost Center
- Estimated Value

**Format:** Excel (with formulas)
**Grouping:** By vendor, then by model
**Totals:** Count, estimated value per group

#### Profile 3: "Security Audit"
**Columns:**
- Device Name
- Model
- Software Version
- Known CVEs
- Last Updated
- EOL Status
- Risk Score

**Format:** PDF Report
**Highlighting:** Red (critical), Yellow (warning), Green (ok)
**Sorting:** By risk score (highest first)

#### Profile 4: "Executive Dashboard"
**Sections:**
- Network Health: 87/100 (pie chart)
- Device Distribution: Cisco 65%, Juniper 20%, etc.
- Age Profile: <2yrs: 30%, 2-5yrs: 50%, >5yrs: 20%
- Critical Issues: 5 devices offline, 12 firmware updates needed

**Format:** Interactive HTML Dashboard
**Features:** Drill-down, filters, date range selector

## Phase 4: Data Enrichment Algorithms

### Algorithm 1: Vendor Detection
```javascript
Priority:
1. Model Name prefix (CISCO, WS-C, ex) → 100% confidence
2. Model Type (cevChassis...) → 95% confidence
3. Serial Number pattern (FTX, FOC, GB) → 90% confidence
4. Description parsing → 85% confidence
```

### Algorithm 2: Port Count Extraction
```javascript
Patterns:
- WS-C3850-48T → 48 ports
- ex3300-48p → 48 ports
- 2960X-24TS → 24 ports
- Regex: /-(\d{2,3})[PT]/
```

### Algorithm 3: Age Calculation
```javascript
Cisco Serial Format: [Site][YY][WW][Sequence]
Example: FTX1416AKXH
- FTX = Foxconn (site code)
- 14 = 2014
- 16 = Week 16 (April 2014)
Age = Current Date - Manufacturing Date
```

### Algorithm 4: EOL Lookup
```javascript
Model EOL Database:
{
  "CISCO2811": { eol: "2011-07-30", eos: "2016-07-31" },
  "CISCO2851": { eol: "2011-07-30", eos: "2016-07-31" },
  "WS-C3850-48T": { eol: "2024-01-31", eos: "2029-01-31" },
  ...
}

Status:
- Active: Current production
- EOL Announced: No longer sold, still supported
- EOS: End of support, security risk
```

### Algorithm 5: Health Scoring
```javascript
Health Score (0-100):
- Status NORMAL: +50
- Operational State UP: +20
- Firmware current: +15
- Not EOL: +10
- Responding to polls: +5

Score Bands:
- 90-100: Excellent (Green)
- 70-89: Good (Yellow)
- 50-69: Fair (Orange)
- 0-49: Poor (Red)
```

## Implementation Priority

### Phase 1 (Immediate):
1. ✅ Vendor detection from model name
2. ✅ Serial number validation
3. ✅ Filter out pseudo/virtual devices
4. Add port count extraction
5. Add basic EOL lookup

### Phase 2 (Next):
1. Health score calculation
2. Age calculation from serials
3. Multi-view export (NOC, Finance, Security)
4. Dashboard visualization

### Phase 3 (Advanced):
1. Firmware vulnerability database
2. Geographic distribution (if location data available)
3. Trend analysis (historical data)
4. Automated alerting

## Questions for You:

1. **Which stakeholder view is most important first?**
   - NOC operations?
   - Finance/asset tracking?
   - Security/compliance?
   - Executive dashboard?

2. **Do you have location/site data?**
   - Building names?
   - City/country?
   - Data center vs. branch?

3. **Do you want real-time updates or periodic exports?**
   - Live dashboard?
   - Daily/weekly reports?
   - On-demand exports?

4. **What external systems do you integrate with?**
   - ServiceNow?
   - Splunk?
   - CMDB?
   - ERP?

Let me know your priorities and I'll build the most valuable features first!

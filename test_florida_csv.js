#!/usr/bin/env node

// Test Florida CSV parsing to identify issues

const fs = require('fs');

console.log('═══════════════════════════════════════════════════════════════');
console.log('Florida CSV Import Analysis');
console.log('═══════════════════════════════════════════════════════════════\n');

// Read Florida CSV
const floridaCSV = fs.readFileSync('./node-list-exports/node-list-Florida.csv', 'utf-8');
const lines = floridaCSV.trim().split('\n');

console.log(`📊 Total lines: ${lines.length}`);
console.log(`📊 Total devices: ${lines.length - 1}\n`);

// Parse header
const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

console.log('📋 CSV Headers:');
headers.forEach((h, i) => {
    console.log(`  [${i}] ${h}`);
});

// Check for critical columns
console.log('\n🔍 Critical Column Check:');
const criticalColumns = [
    'Serial Number',
    'Model Name',
    'Model',
    'Firmware Version',
    'Hardware Version',
    'Software Version'
];

const foundColumns = {};
criticalColumns.forEach(col => {
    const index = headers.findIndex(h => h.toLowerCase() === col.toLowerCase());
    foundColumns[col] = index;
    const status = index !== -1 ? '✅ FOUND' : '❌ MISSING';
    console.log(`  ${status}: ${col}${index !== -1 ? ` (column ${index})` : ''}`);
});

// Check alternative columns that might have the data
console.log('\n📦 Alternative Data Sources:');
const alternativeColumns = [
    'Device Vendor',
    'Device Family',
    'Device Profile',
    'System Description',
    'Device Category',
    'Name',
    'Hostname'
];

alternativeColumns.forEach(col => {
    const index = headers.findIndex(h => h.toLowerCase() === col.toLowerCase());
    if (index !== -1) {
        console.log(`  ✅ ${col} (column ${index})`);
    }
});

// Parse a few sample devices
console.log('\n🔬 Sample Device Data (first 3 devices):');
console.log('═══════════════════════════════════════════════════════════════\n');

for (let i = 1; i <= Math.min(3, lines.length - 1); i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));

    const deviceName = values[headers.findIndex(h => h === 'Name')] || 'Unknown';
    const managementIP = values[headers.findIndex(h => h === 'Management Address')] || '';
    const deviceVendor = values[headers.findIndex(h => h === 'Device Vendor')] || '';
    const deviceFamily = values[headers.findIndex(h => h === 'Device Family')] || '';
    const deviceProfile = values[headers.findIndex(h => h === 'Device Profile')] || '';
    const systemDescription = values[headers.findIndex(h => h === 'System Description')] || '';
    const tenant = values[headers.findIndex(h => h === 'Tenant')] || '';

    console.log(`Device ${i}: ${deviceName}`);
    console.log(`  IP: ${managementIP}`);
    console.log(`  Tenant: ${tenant}`);
    console.log(`  Device Vendor: ${deviceVendor}`);
    console.log(`  Device Family: ${deviceFamily}`);
    console.log(`  Device Profile: ${deviceProfile}`);
    console.log(`  System Description: ${systemDescription.substring(0, 100)}${systemDescription.length > 100 ? '...' : ''}`);
    console.log('');
}

// Analysis Summary
console.log('═══════════════════════════════════════════════════════════════');
console.log('📊 ANALYSIS SUMMARY');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log('❌ MISSING CRITICAL FIELDS:');
Object.entries(foundColumns).forEach(([col, index]) => {
    if (index === -1) {
        console.log(`  - ${col}`);
    }
});

console.log('\n✅ AVAILABLE DATA SOURCES:');
console.log('  - Device Vendor (vendor information)');
console.log('  - Device Family (could be used as model fallback)');
console.log('  - Device Profile (software agent info)');
console.log('  - System Description (rich text with OS/version info)');
console.log('  - Tenant (geographic region: Florida_Tenant)');

console.log('\n💡 RECOMMENDED FIXES:');
console.log('  1. Fallback logic should prioritize:');
console.log('     Model: Device Family > Device Profile > Extract from System Description');
console.log('  2. Extract firmware/software version from System Description');
console.log('  3. Use Tenant field for region/state extraction');
console.log('  4. Serial Number: Leave empty if not available (better than wrong data)');
console.log('  5. Vendor: Device Vendor field is populated correctly');

console.log('\n═══════════════════════════════════════════════════════════════\n');

#!/usr/bin/env node

// Analyze ALL devices to find any inaccurate geographic data
const fs = require('fs');
const XLSX = require('xlsx');

// Load validator
const validatorCode = fs.readFileSync('./geographic_validator.js', 'utf8');
eval(validatorCode);

console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║  ANALYZING ALL DEVICES FOR GEOGRAPHIC ACCURACY               ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

// Load ALL sheets from node-list.xlsx
const workbook = XLSX.readFile('./node-list.xlsx');
console.log(`📚 Loading all ${workbook.SheetNames.length} sheets...\n`);

let allDevices = [];
let allResults = [];

workbook.SheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (jsonData.length > 0) {
        console.log(`   📋 ${sheetName}: ${jsonData.length} devices`);

        jsonData.forEach(row => {
            const device = {
                deviceName: row['Name'] || row['Device Name'] || row['Hostname'] || '',
                systemLocation: row['System Location'] || row['Location'] || '',
                tenant: row['Tenant'] || '',
                region: row['Region'] || '',
                managementIP: row['Management IP'] || row['IP Address'] || '',
                ipAddress: row['Management IP'] || row['IP Address'] || '',
                sheetName: sheetName
            };
            allDevices.push(device);
        });
    }
});

console.log(`\n✅ Total devices loaded: ${allDevices.length}\n`);

console.log('═══════════════════════════════════════════════════════════════');
console.log('🔍 ANALYZING GEOGRAPHIC VALIDATION FOR ALL DEVICES...');
console.log('═══════════════════════════════════════════════════════════════\n');

// Suppress individual device logs for mass analysis
const originalLog = console.log;
console.log = () => {}; // Silence validation logs

allDevices.forEach(device => {
    const result = analyzeGeographicLocation(device);
    allResults.push({
        device: device,
        result: result
    });
});

console.log = originalLog; // Restore logging

// Analyze results
const validated = allResults.filter(r => r.result.validated);
const rejected = allResults.filter(r => !r.result.validated);

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('📊 OVERALL STATISTICS');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log(`Total Devices:       ${allDevices.length}`);
console.log(`✅ Validated:        ${validated.length} (${(validated.length/allDevices.length*100).toFixed(1)}%)`);
console.log(`❌ Rejected:         ${rejected.length} (${(rejected.length/allDevices.length*100).toFixed(1)}%)`);

if (validated.length > 0) {
    const avgConfidence = validated.reduce((sum, r) => sum + r.result.confidence, 0) / validated.length;
    console.log(`📈 Avg Confidence:   ${avgConfidence.toFixed(1)}%`);
}

// Group by world region
console.log('\n🌍 WORLD REGIONS DETECTED:');
const byWorldRegion = validated.reduce((acc, r) => {
    const region = r.result.worldRegion || 'Unknown';
    acc[region] = (acc[region] || 0) + 1;
    return acc;
}, {});
Object.entries(byWorldRegion).forEach(([region, count]) => {
    console.log(`   ${region}: ${count} device(s)`);
});

// Group by state
console.log('\n📍 STATES DETECTED:');
const byState = validated.reduce((acc, r) => {
    const state = r.result.state || 'Unknown';
    acc[state] = (acc[state] || 0) + 1;
    return acc;
}, {});
Object.entries(byState)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .forEach(([state, count]) => {
        console.log(`   ${state}: ${count} device(s)`);
    });

// Analyze unique System Location patterns
console.log('\n═══════════════════════════════════════════════════════════════');
console.log('🔍 UNIQUE SYSTEM LOCATION PATTERNS');
console.log('═══════════════════════════════════════════════════════════════\n');

const uniqueLocations = {};
allDevices.forEach(d => {
    if (d.systemLocation && d.systemLocation.trim() !== '') {
        const loc = d.systemLocation.trim();
        if (!uniqueLocations[loc]) {
            uniqueLocations[loc] = { count: 0, validated: false, result: null };
        }
        uniqueLocations[loc].count++;
    }
});

// Check validation for each unique location
console.log = () => {}; // Silence again
Object.keys(uniqueLocations).forEach(loc => {
    const device = { deviceName: 'test', systemLocation: loc, tenant: '', ipAddress: '' };
    const result = analyzeGeographicLocation(device);
    uniqueLocations[loc].validated = result.validated;
    uniqueLocations[loc].result = result;
});
console.log = originalLog;

console.log('VALIDATED Locations:\n');
Object.entries(uniqueLocations)
    .filter(([loc, data]) => data.validated)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 20)
    .forEach(([loc, data]) => {
        const r = data.result;
        console.log(`✅ "${loc}" (${data.count} devices)`);
        console.log(`   → ${r.city || '(no city)'}, ${r.state || r.country} [${r.confidence}%]`);
    });

console.log('\n\nREJECTED Locations (top 20 by frequency):\n');
Object.entries(uniqueLocations)
    .filter(([loc, data]) => !data.validated)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 20)
    .forEach(([loc, data]) => {
        console.log(`❌ "${loc}" (${data.count} devices)`);
    });

// Look for potentially problematic validations
console.log('\n═══════════════════════════════════════════════════════════════');
console.log('⚠️  POTENTIAL ISSUES TO REVIEW');
console.log('═══════════════════════════════════════════════════════════════\n');

// Find devices with validation but suspicious patterns
const suspicious = validated.filter(r => {
    const loc = r.device.systemLocation.toLowerCase();
    const name = r.device.deviceName.toLowerCase();

    // Check for facility codes being interpreted as states
    if (loc.includes('dca') || loc.includes('noc') || loc.includes('f10')) {
        // These might be facility codes, not real locations
        if (!loc.match(/[a-z]{3,}/)) { // No real words
            return true;
        }
    }

    // Check for device names that might be influencing results
    if (name.includes('cat') && r.result.state === 'California') return true;
    if (name.includes('core') && r.result.state === 'Colorado') return true;
    if (name.includes('in-') && r.result.state === 'Indiana') return true;

    return false;
});

if (suspicious.length > 0) {
    console.log(`Found ${suspicious.length} potentially suspicious validations:\n`);
    suspicious.slice(0, 10).forEach(r => {
        console.log(`⚠️  Device: ${r.device.deviceName}`);
        console.log(`   SystemLocation: "${r.device.systemLocation}"`);
        console.log(`   Detected: ${r.result.city || ''}, ${r.result.state} (${r.result.confidence}%)`);
        console.log('');
    });
} else {
    console.log('✅ No suspicious validations detected!\n');
}

// Check confidence distribution
console.log('═══════════════════════════════════════════════════════════════');
console.log('📊 CONFIDENCE SCORE DISTRIBUTION');
console.log('═══════════════════════════════════════════════════════════════\n');

const confidenceBuckets = {
    '95-100%': 0,
    '90-94%': 0,
    '85-89%': 0,
    '80-84%': 0,
    '75-79%': 0,
    '70-74%': 0,
    '<70%': 0
};

validated.forEach(r => {
    const conf = r.result.confidence;
    if (conf >= 95) confidenceBuckets['95-100%']++;
    else if (conf >= 90) confidenceBuckets['90-94%']++;
    else if (conf >= 85) confidenceBuckets['85-89%']++;
    else if (conf >= 80) confidenceBuckets['80-84%']++;
    else if (conf >= 75) confidenceBuckets['75-79%']++;
    else if (conf >= 70) confidenceBuckets['70-74%']++;
    else confidenceBuckets['<70%']++;
});

Object.entries(confidenceBuckets).forEach(([bucket, count]) => {
    if (count > 0) {
        console.log(`${bucket}: ${count} device(s)`);
    }
});

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('💡 RECOMMENDATIONS FOR 99.9% ACCURACY');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log('1. Raise confidence thresholds if too much low-confidence data');
console.log('2. Add explicit rejection rules for facility codes (DCA, NOC, etc.)');
console.log('3. Validate cities against known city database');
console.log('4. Add more strict pattern matching requirements');
console.log('5. Implement whitelist of known good System Location values');

console.log('\n✅ Analysis complete!\n');

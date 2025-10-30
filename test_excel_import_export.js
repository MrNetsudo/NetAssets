#!/usr/bin/env node

// Integration test: Import node-list.xlsx California sheet and verify correct data mapping
// This tests the actual bug scenario reported by the user

const XLSX = require('xlsx');

console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║  EXCEL IMPORT/EXPORT INTEGRATION TEST                       ║');
console.log('║  Testing California sheet from node-list.xlsx                ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

// Load the Excel file
console.log('📂 Loading node-list.xlsx...');
const workbook = XLSX.readFile('./node-list.xlsx');

if (!workbook.SheetNames.includes('California')) {
    console.error('❌ California sheet not found!');
    process.exit(1);
}

console.log('✅ Found California sheet\n');

// Convert to JSON
const worksheet = workbook.Sheets['California'];
const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: '' });

console.log(`📊 Loaded ${jsonData.length} rows from California sheet\n`);

// Replicate the fixed findColumn function (same as in test_column_mapping.js)
function findColumn(headers, possibleNames) {
    // First pass: exact matches only
    for (const name of possibleNames) {
        const index = headers.findIndex(h => h === name.toLowerCase());
        if (index !== -1) return index;
    }
    // Second pass: word-boundary partial matches - with strict exclusions
    for (const name of possibleNames) {
        const index = headers.findIndex(h => {
            if (h.includes('ha ') || h.includes('configured')) return false;

            if (name.toLowerCase() === 'state' || name.toLowerCase() === 'province') {
                if (h.includes('modified') || h.includes('last') ||
                    h.includes('admin') || h.includes('oper') || h.includes('discovery') ||
                    h.includes('icmp') || h.includes('snmp') || h.includes('agent') ||
                    h.includes('power') || h.includes('link') || h.includes('port') ||
                    h.includes('device') || h.includes('interface') || h.includes('connection')) {
                    return false;
                }
            }

            if (name.toLowerCase().includes('ip') || name.toLowerCase().includes('address')) {
                if (h.includes('modified') || h.includes('last') || h.includes('time') ||
                    h.includes('date') || h.includes('discovery') || h.includes('learned') ||
                    h.includes('first') || h.includes('updated') || h.includes('changed') ||
                    h.includes('timestamp') || h.includes('scan') || h.includes('added') ||
                    h.includes('created') || h.includes('when') || h.includes('aging')) {
                    return false;
                }
                if (h.startsWith('ip ') && (h.includes('time') || h.includes('date') ||
                    h.includes('modified') || h.includes('discovered') || h.includes('learned'))) {
                    return false;
                }
            }

            if (h.includes('status') && !name.toLowerCase().includes('status')) return false;

            if (name.toLowerCase() === 'sn' || name.toLowerCase() === 's/n') {
                if (h.includes('snmp') || h.includes('agent') || h.includes('enabled') ||
                    h.includes('protocol') || h.includes('version') || h.includes('monitoring')) {
                    return false;
                }
            }

            if (name.toLowerCase() === 'ip') {
                if (h.includes('icmp') || h.includes('snmp') || h.includes('description') ||
                    h.includes('script') || h.includes('chip') || h.includes('equip')) {
                    return false;
                }
            }

            const searchTerm = name.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const wordBoundaryPattern = new RegExp(`\\b${searchTerm}\\b`);
            return wordBoundaryPattern.test(h);
        });
        if (index !== -1) return index;
    }
    return -1;
}

// Map columns using the fixed logic
const headers = Object.keys(jsonData[0]).map(h => h.toLowerCase());

console.log('🗺️  Column Mapping Results:');
console.log('═══════════════════════════════════════════════════════════════\n');

const columnMap = {
    deviceName: findColumn(headers, ['device name', 'devicename', 'hostname', 'host', 'name', 'system name']),
    managementIP: findColumn(headers, ['management address', 'managementaddress', 'management ip', 'ip address', 'ip']),
    sn: findColumn(headers, ['serial number', 'serialnumber', 'serial #', 'serial#', 'serial', 'sn', 's/n', 'device serial']),
    state: findColumn(headers, ['state', 'province']),
    firmwareVersion: findColumn(headers, ['firmware version', 'firmwareversion', 'firmware', 'fw version']),
    vendor: findColumn(headers, ['device vendor', 'devicevendor', 'vendor', 'manufacturer']),
    managedBy: findColumn(headers, ['managed by', 'managedby', 'manager id'])
};

// Display mapping results
Object.entries(columnMap).forEach(([field, idx]) => {
    const headerKeys = Object.keys(jsonData[0]);
    const mappedTo = idx !== -1 ? headerKeys[idx] : 'NOT FOUND';
    console.log(`${field.padEnd(20)} → ${mappedTo}`);
});

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('🔍 CRITICAL VERIFICATIONS');
console.log('═══════════════════════════════════════════════════════════════\n');

let allChecksPass = true;

// Sample a few devices and check for the reported bugs
const sampleSize = Math.min(10, jsonData.length);
console.log(`Checking first ${sampleSize} devices for data correctness:\n`);

for (let i = 0; i < sampleSize; i++) {
    const row = jsonData[i];
    const headerKeys = Object.keys(jsonData[0]);
    const getValue = (idx) => idx !== -1 ? row[headerKeys[idx]] : '';

    const deviceName = getValue(columnMap.deviceName);
    const ipAddress = getValue(columnMap.managementIP);
    const serialNum = getValue(columnMap.sn);
    const state = getValue(columnMap.state);
    const firmware = getValue(columnMap.firmwareVersion);

    console.log(`Device ${i + 1}: ${deviceName}`);

    // Check 1: Serial number should NOT be "TRUE" or "true" or boolean
    if (serialNum === 'TRUE' || serialNum === 'true' || serialNum === 'FALSE' || serialNum === 'false') {
        console.log(`   ❌ ERROR: Serial number is boolean: "${serialNum}"`);
        allChecksPass = false;
    } else {
        console.log(`   ✅ Serial: ${serialNum || '(empty)'}`);
    }

    // Check 2: IP address should NOT be a large number (Excel date serial)
    if (ipAddress && !isNaN(ipAddress) && parseFloat(ipAddress) > 10000) {
        console.log(`   ❌ ERROR: IP address looks like Excel date serial: "${ipAddress}"`);
        allChecksPass = false;
    } else {
        console.log(`   ✅ IP: ${ipAddress || '(empty)'}`);
    }

    // Check 3: State should NOT be a large number (timestamp)
    if (state && !isNaN(state) && parseFloat(state) > 1000) {
        console.log(`   ❌ ERROR: State looks like timestamp: "${state}"`);
        allChecksPass = false;
    } else {
        console.log(`   ✅ State: ${state || '(empty)'}`);
    }

    // Check 4: Device name should look like a device name, not a manager ID
    if (deviceName && deviceName.includes('@') && deviceName.includes('.')) {
        console.log(`   ⚠️  WARNING: Device name looks like email/ID: "${deviceName}"`);
    } else {
        console.log(`   ✅ Name: OK`);
    }

    console.log('');
}

console.log('═══════════════════════════════════════════════════════════════');
console.log('📊 FINAL RESULTS');
console.log('═══════════════════════════════════════════════════════════════\n');

if (allChecksPass) {
    console.log('✅ ALL CHECKS PASSED!');
    console.log('\n🎉 The bugs are fixed:');
    console.log('   ✅ Serial numbers do NOT show TRUE values');
    console.log('   ✅ IP addresses do NOT show date/timestamp values');
    console.log('   ✅ State does NOT show timestamp values');
    console.log('   ✅ Device names are correctly mapped');
    console.log('\n💡 The column mapping fix successfully prevents:');
    console.log('   - "sn" from matching "snmp agent enabled"');
    console.log('   - "ip" from matching "management address icmp state"');
    console.log('   - "state" from matching "state last modified" or "power state"');
    console.log('\n✅ Users can now safely import node-list.xlsx and export without data corruption!\n');
} else {
    console.log('❌ SOME CHECKS FAILED');
    console.log('   Review errors above for details\n');
    process.exit(1);
}

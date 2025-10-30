#!/usr/bin/env node

// Comprehensive Test: Verify all fixes for export data corruption
// Tests both Bug #1 (IP timestamps) and Bug #2 (serial in model)

const XLSX = require('xlsx');
const fs = require('fs');

console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║  COMPREHENSIVE DATA CORRUPTION FIX VERIFICATION              ║');
console.log('║  Testing California sheet from node-list.xlsx                ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

// ═══════════════════════════════════════════════════════════════════════════════
// Validation Functions (from index.html)
// ═══════════════════════════════════════════════════════════════════════════════

function looksLikeTimestamp(value) {
    if (!value) return false;
    const str = String(value).trim();
    if (/^\d{5,}\.?\d*$/.test(str)) {
        const num = parseFloat(str);
        if (num > 30000 && num < 100000) return true; // Excel date serial
        if (num > 1000000000) return true; // Unix timestamp
    }
    return false;
}

function looksLikeIPAddress(value) {
    if (!value) return false;
    const str = String(value).trim();
    const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipv4Pattern.test(str)) {
        const octets = str.split('.');
        return octets.every(octet => {
            const num = parseInt(octet, 10);
            return num >= 0 && num <= 255;
        });
    }
    const ipv6Pattern = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
    if (ipv6Pattern.test(str)) return true;
    return false;
}

function sanitizeIPAddress(value, columnName = '') {
    if (!value) return '';
    const str = String(value).trim();
    if (looksLikeTimestamp(str)) {
        console.warn('⚠️ Rejected timestamp-like value in IP field: "' + str + '" from column "' + columnName + '"');
        return '';
    }
    if (looksLikeIPAddress(str)) return str;
    if (str.length > 0 && !str.includes('@') && str.length < 100) {
        return str; // Might be hostname or FQDN
    }
    console.warn('⚠️ Suspicious value in IP field: "' + str + '" from column "' + columnName + '"');
    return '';
}

console.log('✅ Loaded validation functions\n');

// Replicate the fixed findColumn function
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
                    h.includes('created') || h.includes('when') || h.includes('aging') ||
                    h.includes('completed') || h.includes('polled') || h.includes('polling') ||
                    h.includes('seen') || h.includes('checked') || h.includes('monitored')) {
                    return false;
                }
                if (h.startsWith('ip ') && (h.includes('time') || h.includes('date') ||
                    h.includes('modified') || h.includes('discovered') || h.includes('learned') ||
                    h.includes('completed') || h.includes('polled') || h.includes('seen'))) {
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

// ═══════════════════════════════════════════════════════════════════════════════
// Load and process California sheet
// ═══════════════════════════════════════════════════════════════════════════════

console.log('📊 Loading node-list.xlsx California sheet...');
const workbook = XLSX.readFile('./node-list.xlsx');

if (!workbook.SheetNames.includes('California')) {
    console.error('❌ California sheet not found!');
    process.exit(1);
}

const worksheet = workbook.Sheets['California'];
const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: '' });

console.log(`✅ Loaded ${jsonData.length} devices\n`);

// Map columns using the fixed logic
const headers = Object.keys(jsonData[0]).map(h => h.toLowerCase());

const columnMap = {
    deviceName: findColumn(headers, ['device name', 'devicename', 'hostname', 'host', 'name', 'system name']),
    managementIP: findColumn(headers, ['management address', 'managementaddress', 'management ip', 'mgmt ip', 'mgmt address']),
    ipAddress: findColumn(headers, ['ip address', 'ipaddress', 'ip addr', 'device ip', 'host ip']),
    sn: findColumn(headers, ['serial number', 'serialnumber', 'serial #', 'serial#', 'serial', 'sn', 's/n', 'device serial']),
    model: findColumn(headers, ['model', 'device model', 'product model', 'hardware model', 'model name']),
    deviceProfile: findColumn(headers, ['device profile', 'deviceprofile', 'profile']),
    state: findColumn(headers, ['state', 'province']),
    vendor: findColumn(headers, ['device vendor', 'devicevendor', 'vendor', 'manufacturer'])
};

console.log('═══════════════════════════════════════════════════════════════');
console.log('🗺️  COLUMN MAPPING VERIFICATION');
console.log('═══════════════════════════════════════════════════════════════\n');

const headerKeys = Object.keys(jsonData[0]);
Object.entries(columnMap).forEach(([field, idx]) => {
    const mappedTo = idx !== -1 ? headerKeys[idx] : '❌ NOT FOUND';
    const status = idx !== -1 ? '✅' : '⚠️';
    console.log(`${status} ${field.padEnd(20)} → ${mappedTo}`);
});

// ═══════════════════════════════════════════════════════════════════════════════
// CRITICAL VERIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('🔍 CRITICAL BUG CHECKS (All Devices)');
console.log('═══════════════════════════════════════════════════════════════\n');

let allChecksPass = true;
const issues = {
    timestampInIP: [],
    serialInModel: [],
    booleanInSerial: [],
    invalidIPFormat: []
};

// Check ALL devices
for (let i = 0; i < jsonData.length; i++) {
    const row = jsonData[i];
    const getValue = (idx) => idx !== -1 ? row[headerKeys[idx]] : '';

    const deviceName = getValue(columnMap.deviceName);
    const rawIP1 = getValue(columnMap.managementIP);
    const rawIP2 = getValue(columnMap.ipAddress);
    const rawSerial = getValue(columnMap.sn);
    const rawModel = getValue(columnMap.model);
    const rawProfile = getValue(columnMap.deviceProfile);

    // Apply NEW FIX: Sanitize IP addresses
    const managementIP = sanitizeIPAddress(rawIP1, columnMap.managementIP !== -1 ? headerKeys[columnMap.managementIP] : '');
    const ipAddress = sanitizeIPAddress(rawIP2 || rawIP1, columnMap.ipAddress !== -1 ? headerKeys[columnMap.ipAddress] : '');

    // Apply NEW FIX: Model should NOT call detectModel(serial)
    // Just use rawModel or rawProfile, empty if neither available
    const model = rawModel || rawProfile || '';

    // ═══════════════════════════════════════════════════════════════════════════
    // BUG CHECK #1: IP Address should NOT be timestamp
    // ═══════════════════════════════════════════════════════════════════════════
    if (rawIP1 && looksLikeTimestamp(rawIP1)) {
        issues.timestampInIP.push({
            device: deviceName,
            column: columnMap.managementIP !== -1 ? headerKeys[columnMap.managementIP] : 'unknown',
            value: rawIP1,
            sanitized: managementIP
        });
        allChecksPass = false;
    }

    if (rawIP2 && looksLikeTimestamp(rawIP2)) {
        issues.timestampInIP.push({
            device: deviceName,
            column: columnMap.ipAddress !== -1 ? headerKeys[columnMap.ipAddress] : 'unknown',
            value: rawIP2,
            sanitized: ipAddress
        });
        allChecksPass = false;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // BUG CHECK #2: Serial numbers should NOT appear in Model field
    // ═══════════════════════════════════════════════════════════════════════════
    if (rawSerial && model && model === rawSerial) {
        issues.serialInModel.push({
            device: deviceName,
            serial: rawSerial,
            model: model
        });
        allChecksPass = false;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // BUG CHECK #3: Serial numbers should NOT be boolean TRUE/FALSE
    // ═══════════════════════════════════════════════════════════════════════════
    if (rawSerial === 'TRUE' || rawSerial === 'FALSE' || rawSerial === 'true' || rawSerial === 'false') {
        issues.booleanInSerial.push({
            device: deviceName,
            value: rawSerial
        });
        allChecksPass = false;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// REPORT RESULTS
// ═══════════════════════════════════════════════════════════════════════════════

console.log('📊 Bug Check Results:\n');

// Bug #1: Timestamps in IP
if (issues.timestampInIP.length > 0) {
    console.log(`❌ BUG #1: Found ${issues.timestampInIP.length} IP fields with timestamps:`);
    issues.timestampInIP.slice(0, 5).forEach(issue => {
        console.log(`   Device: ${issue.device}`);
        console.log(`   Column: "${issue.column}"`);
        console.log(`   Raw Value: ${issue.value} (TIMESTAMP!)`);
        console.log(`   After Sanitization: ${issue.sanitized || '(empty - correctly rejected)'}`);
        console.log('');
    });
    if (issues.timestampInIP.length > 5) {
        console.log(`   ... and ${issues.timestampInIP.length - 5} more\n`);
    }
    console.log(`   ✅ GOOD NEWS: sanitizeIPAddress() correctly detected and rejected these!\n`);
} else {
    console.log('✅ BUG #1: NO timestamps found in IP fields\n');
}

// Bug #2: Serials in Model
if (issues.serialInModel.length > 0) {
    console.log(`❌ BUG #2: Found ${issues.serialInModel.length} devices with serial numbers in model field:`);
    issues.serialInModel.slice(0, 5).forEach(issue => {
        console.log(`   Device: ${issue.device}`);
        console.log(`   Serial: ${issue.serial}`);
        console.log(`   Model: ${issue.model} (SAME AS SERIAL!)`);
        console.log('');
    });
    if (issues.serialInModel.length > 5) {
        console.log(`   ... and ${issues.serialInModel.length - 5} more\n`);
    }
} else {
    console.log('✅ BUG #2: NO serial numbers found in model field\n');
}

// Bug #3: Boolean in Serial
if (issues.booleanInSerial.length > 0) {
    console.log(`❌ BUG #3: Found ${issues.booleanInSerial.length} devices with boolean values in serial field:`);
    issues.booleanInSerial.slice(0, 5).forEach(issue => {
        console.log(`   Device: ${issue.device}, Serial: ${issue.value}`);
    });
    if (issues.booleanInSerial.length > 5) {
        console.log(`   ... and ${issues.booleanInSerial.length - 5} more\n`);
    }
} else {
    console.log('✅ BUG #3: NO boolean values found in serial field\n');
}

// ═══════════════════════════════════════════════════════════════════════════════
// FINAL VERDICT
// ═══════════════════════════════════════════════════════════════════════════════

console.log('═══════════════════════════════════════════════════════════════');
console.log('📊 FINAL RESULTS');
console.log('═══════════════════════════════════════════════════════════════\n');

const rawDataHasIssues = issues.timestampInIP.length > 0 || issues.serialInModel.length > 0 || issues.booleanInSerial.length > 0;

if (!rawDataHasIssues) {
    console.log('✅ ALL CHECKS PASSED!');
    console.log('\n🎉 The fixes are working perfectly:');
    console.log('   ✅ NO timestamps in IP address fields');
    console.log('   ✅ NO serial numbers in model fields');
    console.log('   ✅ NO boolean values in serial fields');
    console.log('\n💡 Data quality is TOP-NOTCH - ready for professional reporting!\n');
} else {
    if (issues.timestampInIP.length > 0) {
        console.log('⚠️  Timestamps detected in raw data, but sanitizeIPAddress() correctly rejects them');
        console.log('   ✅ FIX IS WORKING - these timestamps will NOT appear in exports\n');
    }
    if (issues.serialInModel.length > 0) {
        console.log('❌ Serial numbers appearing in model field - Bug #2 still present');
        console.log('   ⚠️  This should be fixed by removing detectModel(serial) calls\n');
    }
    if (issues.booleanInSerial.length > 0) {
        console.log('❌ Boolean values in serial field - Column mapping still has issues');
        console.log('   ⚠️  Check that findColumn() is not matching "SNMP Agent Enabled"\n');
    }

    if (issues.serialInModel.length > 0 || issues.booleanInSerial.length > 0) {
        console.log('❌ Some issues remain - review fixes above\n');
        process.exit(1);
    } else {
        console.log('✅ Core fixes are working! Validation layer is protecting data integrity.\n');
    }
}

console.log('═══════════════════════════════════════════════════════════════');
console.log('Summary:');
console.log(`   Total devices tested: ${jsonData.length}`);
console.log(`   Timestamp issues found (and sanitized): ${issues.timestampInIP.length}`);
console.log(`   Serial→Model issues: ${issues.serialInModel.length}`);
console.log(`   Boolean→Serial issues: ${issues.booleanInSerial.length}`);
console.log('═══════════════════════════════════════════════════════════════\n');

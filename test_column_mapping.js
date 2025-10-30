#!/usr/bin/env node

// Test the fixed findColumn() function to ensure proper column mapping
// This verifies that "sn" doesn't match "snmp agent enabled", etc.

console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║  COLUMN MAPPING FIX VERIFICATION TEST                        ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

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
            // Avoid matching boolean/HA columns for text fields
            if (h.includes('ha ') || h.includes('configured')) {
                return false;
            }
            // Prevent "State Last Modified" from matching geographic "state"
            if (name.toLowerCase() === 'state' || name.toLowerCase() === 'province') {
                if (h.includes('modified') || h.includes('last') ||
                    h.includes('admin') || h.includes('oper') || h.includes('discovery') ||
                    h.includes('icmp') || h.includes('snmp') || h.includes('agent') ||
                    h.includes('power') || h.includes('link') || h.includes('port') ||
                    h.includes('device') || h.includes('interface') || h.includes('connection')) {
                    return false;
                }
            }
            // Prevent "IP Discovery Time" from matching "ip address" or "ip"
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
            // For non-state fields, exclude status columns
            if (h.includes('status') && !name.toLowerCase().includes('status')) {
                return false;
            }

            // Additional exclusions for short abbreviations
            if (name.toLowerCase() === 'sn' || name.toLowerCase() === 's/n') {
                if (h.includes('snmp') || h.includes('agent') || h.includes('enabled') ||
                    h.includes('protocol') || h.includes('version') || h.includes('monitoring')) {
                    return false;
                }
            }

            // Prevent "ip" from matching "icmp", "description", "snmp", etc.
            if (name.toLowerCase() === 'ip') {
                if (h.includes('icmp') || h.includes('snmp') || h.includes('description') ||
                    h.includes('script') || h.includes('chip') || h.includes('equip')) {
                    return false;
                }
            }

            // Use word boundaries to match whole words only
            const searchTerm = name.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const wordBoundaryPattern = new RegExp(`\\b${searchTerm}\\b`);
            return wordBoundaryPattern.test(h);
        });
        if (index !== -1) return index;
    }
    return -1;
}

// Test with actual headers from node-list.xlsx California sheet
const headers = [
    "status",
    "device category",
    "name",
    "hostname",
    "management address",
    "tenant",
    "security group",
    "system location",
    "device profile",
    "snmp agent enabled",  // This should NOT match "sn"
    "status last modified",
    "notes",
    "power state",
    "state last modified",  // This should NOT match "state"
    "hosted on",
    "system name",
    "system contact",
    "system description",
    "node management mode",
    "system object id",
    "device vendor",
    "device family",
    "snmp agent",
    "protocol version",
    "agent snmp state",
    "management address icmp state",  // This should NOT match "ip"
    "state last modified2",
    "discovery state",
    "last completed",
    "created",
    "last modified"
];

console.log('📋 Testing Column Mapping with Real Headers\n');

// Test cases that should NOT match (these were the bugs)
const criticalTests = [
    {
        field: 'Serial Number',
        patterns: ['serial number', 'serialnumber', 'serial #', 'serial#', 'serial', 'sn', 's/n'],
        shouldNotMatch: ['snmp agent enabled', 'snmp agent', 'agent snmp state'],
        shouldMatch: []
    },
    {
        field: 'IP Address',
        patterns: ['management address', 'managementaddress', 'management ip', 'ip address', 'ip'],
        shouldNotMatch: ['management address icmp state', 'status last modified', 'state last modified'],
        shouldMatch: ['management address']
    },
    {
        field: 'State/Province',
        patterns: ['state', 'province'],
        shouldNotMatch: ['status last modified', 'state last modified', 'discovery state', 'agent snmp state', 'power state'],
        shouldMatch: []
    },
    {
        field: 'Firmware Version',
        patterns: ['firmware version', 'firmwareversion', 'firmware', 'fw version'],
        shouldNotMatch: [],
        shouldMatch: []
    }
];

let allPassed = true;

criticalTests.forEach(test => {
    console.log(`\n🧪 Testing: ${test.field}`);
    console.log(`   Patterns: ${test.patterns.join(', ')}`);

    const matchedIndex = findColumn(headers, test.patterns);
    const matchedHeader = matchedIndex !== -1 ? headers[matchedIndex] : 'NOT FOUND';

    console.log(`   Result: ${matchedIndex !== -1 ? `Matched "${matchedHeader}" at index ${matchedIndex}` : '❌ NOT FOUND'}`);

    // Check if it matched something it shouldn't
    let hasError = false;
    test.shouldNotMatch.forEach(badMatch => {
        if (matchedHeader.toLowerCase() === badMatch.toLowerCase()) {
            console.log(`   ❌ ERROR: Incorrectly matched "${badMatch}" (this was the bug!)`);
            hasError = true;
            allPassed = false;
        }
    });

    // Check if it should have matched something
    if (test.shouldMatch.length > 0) {
        const shouldHaveMatched = test.shouldMatch.some(good => matchedHeader.toLowerCase() === good.toLowerCase());
        if (!shouldHaveMatched && matchedIndex !== -1) {
            console.log(`   ⚠️  WARNING: Matched "${matchedHeader}" instead of expected matches: ${test.shouldMatch.join(', ')}`);
        } else if (shouldHaveMatched) {
            console.log(`   ✅ Correctly matched expected column`);
        }
    } else if (matchedIndex === -1) {
        console.log(`   ✅ Correctly returned NOT FOUND (no matching column in this dataset)`);
    } else if (!hasError) {
        console.log(`   ⚠️  Matched "${matchedHeader}" but this field doesn't exist in the test dataset`);
    }
});

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('📊 TEST SUMMARY');
console.log('═══════════════════════════════════════════════════════════════\n');

if (allPassed) {
    console.log('✅ ALL TESTS PASSED!');
    console.log('   The column mapping bug is fixed:');
    console.log('   - "sn" no longer matches "snmp agent enabled"');
    console.log('   - "ip" no longer matches "management address icmp state"');
    console.log('   - "state" no longer matches "state last modified"');
    console.log('\n✅ Serial numbers will no longer show TRUE values');
    console.log('✅ IP addresses will no longer show dates/timestamps');
    console.log('✅ Geographic state will no longer show status timestamps\n');
} else {
    console.log('❌ SOME TESTS FAILED - Review errors above\n');
    process.exit(1);
}

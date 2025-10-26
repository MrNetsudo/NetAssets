// Full CSV Import Flow Test
console.log('='.repeat(80));
console.log('COMPREHENSIVE CSV IMPORT FLOW TEST');
console.log('='.repeat(80));
console.log('');

// Step 1: Parse CSV
function findColumn(headers, possibleNames) {
    for (const name of possibleNames) {
        const index = headers.findIndex(h => h === name.toLowerCase());
        if (index !== -1) return index;
    }
    for (const name of possibleNames) {
        const index = headers.findIndex(h => {
            if (h.includes('ha ') || h.includes('status') || h.includes('configured')) {
                return false;
            }
            return h.includes(name.toLowerCase());
        });
        if (index !== -1) return index;
    }
    return -1;
}

function getValue(values, index) {
    if (index === -1 || index >= values.length) return '';
    const value = values[index].trim().replace(/^"|"$/g, '');
    if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
        return '';
    }
    return value;
}

const csvContent = `Region,Device Name,Vendor,Type,Model,Site,Role,Serial Number,HA Status
US,FW-NYC-01,Fortinet,Firewall,FGT60F,NYC-HQ,Perimeter,FGT60F123456,No`;

const lines = csvContent.trim().split('\n');
const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase());

const columnMap = {
    model: findColumn(headers, ['model', 'device model', 'product model']),
    sn: findColumn(headers, ['serial number', 'serialnumber', 'serial', 'sn', 'primary sn', 'primary serial']),
    deviceName: findColumn(headers, ['device name', 'devicename', 'hostname', 'host']),
    vendor: findColumn(headers, ['vendor', 'manufacturer', 'make']),
    deviceType: findColumn(headers, ['device type', 'devicetype', 'type']),
};

const values = lines[1].split(',').map(v => v.trim());
const rawModel = getValue(values, columnMap.model);
const rawSN = getValue(values, columnMap.sn);

const device = {
    deviceName: getValue(values, columnMap.deviceName) || 'Unknown',
    vendor: getValue(values, columnMap.vendor) || '',
    deviceType: getValue(values, columnMap.deviceType) || '',
    model: rawModel || '',
    series: rawModel || '',
    sn: rawSN || '',
};

console.log('📥 STEP 1: CSV PARSING');
console.log('Device after CSV parse:', JSON.stringify(device, null, 2));
console.log('');

// Step 2: Auto-detection (simplified)
function detectDeviceInfo(device) {
    const sn = device.sn || '';
    let vendor = 'Unknown';
    let model = 'Unknown';
    let series = 'Unknown';

    if (sn.includes('FG') || sn.includes('FGT')) {
        vendor = 'Fortinet';
        if (sn.includes('FGT60') || sn.includes('FG60')) {
            model = 'FortiGate-60';
            series = 'FGT60';
        }
    }

    return { vendor, model, series };
}

const deviceInfo = detectDeviceInfo(device);
console.log('🔍 STEP 2: AUTO-DETECTION');
console.log('Detected info:', JSON.stringify(deviceInfo, null, 2));
console.log('');

// Step 3: Enrichment (confirmImport logic)
const processed = {
    ...device,
    model: device.model || (deviceInfo.model !== 'Unknown' ? deviceInfo.model : ''),
    series: device.series || (deviceInfo.series !== 'Unknown' ? deviceInfo.series : ''),
    vendor: device.vendor || (deviceInfo.vendor !== 'Unknown' ? deviceInfo.vendor : ''),
};

console.log('🔧 STEP 3: ENRICHMENT');
console.log('Processed device:', JSON.stringify(processed, null, 2));
console.log('');

// Step 4: Table rendering (what would be displayed)
function escapeHtml(text) {
    if (!text) return '';
    return text;  // Simplified for test
}

const displayModel = escapeHtml(processed.model) || 'Unknown';
const displaySN = escapeHtml(processed.sn) || '-';

console.log('📊 STEP 4: TABLE DISPLAY');
console.log(`Model column would show: "${displayModel}"`);
console.log(`Primary SN column would show: "${displaySN}"`);
console.log('');

// Final analysis
console.log('='.repeat(80));
console.log('ANALYSIS:');
console.log('='.repeat(80));
console.log(`✓ CSV has model value: "${rawModel}"`);
console.log(`✓ CSV has SN value: "${rawSN}"`);
console.log(`✓ After parsing, device.model: "${device.model}"`);
console.log(`✓ After parsing, device.sn: "${device.sn}"`);
console.log(`✓ Auto-detected model: "${deviceInfo.model}"`);
console.log(`✓ After enrichment, processed.model: "${processed.model}"`);
console.log(`✓ After enrichment, processed.sn: "${processed.sn}"`);
console.log(`✓ Display will show model: "${displayModel}"`);
console.log(`✓ Display will show SN: "${displaySN}"`);
console.log('');

if (displayModel === 'FGT60F' && displaySN === 'FGT60F123456') {
    console.log('✅ TEST PASSED: Model and Serial Number populated correctly!');
} else {
    console.log('❌ TEST FAILED:');
    console.log(`   Expected model: "FGT60F", got: "${displayModel}"`);
    console.log(`   Expected SN: "FGT60F123456", got: "${displaySN}"`);
}

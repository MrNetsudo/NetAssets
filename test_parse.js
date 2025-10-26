// Test CSV parsing logic
function findColumn(headers, possibleNames) {
    // First pass: exact matches only
    for (const name of possibleNames) {
        const index = headers.findIndex(h => h === name.toLowerCase());
        if (index !== -1) return index;
    }
    // Second pass: partial matches (contains) - but avoid matching HA-related columns for non-HA fields
    for (const name of possibleNames) {
        const index = headers.findIndex(h => {
            // Avoid matching boolean/HA columns for text fields
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
    // Filter out boolean-like values that shouldn't be in text fields
    if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
        return '';
    }
    return value;
}

// Test with actual CSV data
const csvContent = `Region,Device Name,Vendor,Type,Model,Site,Role,Serial Number,HA Status
US,FW-NYC-01,Fortinet,Firewall,FGT60F,NYC-HQ,Perimeter,FGT60F123456,No
US,FW-NYC-02,Fortinet,Firewall,FGT60F,NYC-HQ,Perimeter,FGT60F123457,Yes`;

const lines = csvContent.trim().split('\n');
const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase());

console.log('=== CSV HEADERS ===');
console.log(headers);
console.log('');

const columnMap = {
    region: findColumn(headers, ['region']),
    deviceName: findColumn(headers, ['device name', 'devicename', 'hostname', 'host']),
    vendor: findColumn(headers, ['vendor', 'manufacturer', 'make']),
    deviceType: findColumn(headers, ['device type', 'devicetype', 'type']),
    model: findColumn(headers, ['model', 'device model', 'product model']),
    siteType: findColumn(headers, ['site type', 'sitetype', 'site']),
    deviceRole: findColumn(headers, ['device role', 'devicerole', 'role']),
    sn: findColumn(headers, ['serial number', 'serialnumber', 'serial', 'sn', 'primary sn', 'primary serial']),
    hasHA: findColumn(headers, ['ha status', 'hastatus', 'ha configured', 'ha']),
};

console.log('=== COLUMN MAPPING ===');
console.log(columnMap);
console.log('');

console.log('=== HEADER DETAILS ===');
console.log(`Model column index: ${columnMap.model}`);
console.log(`Model header: ${columnMap.model !== -1 ? headers[columnMap.model] : 'NOT FOUND'}`);
console.log(`SN column index: ${columnMap.sn}`);
console.log(`SN header: ${columnMap.sn !== -1 ? headers[columnMap.sn] : 'NOT FOUND'}`);
console.log('');

// Parse first data row
const values = lines[1].split(',').map(v => v.trim());

console.log('=== FIRST ROW VALUES ===');
console.log(values);
console.log('');

const rawModel = getValue(values, columnMap.model);
const rawSN = getValue(values, columnMap.sn);

console.log('=== EXTRACTED VALUES ===');
console.log(`Raw Model: "${rawModel}"`);
console.log(`Raw SN: "${rawSN}"`);
console.log('');

const device = {
    deviceName: getValue(values, columnMap.deviceName) || 'Unknown',
    vendor: getValue(values, columnMap.vendor) || '',
    deviceType: getValue(values, columnMap.deviceType) || '',
    model: rawModel || '',
    sn: rawSN || '',
};

console.log('=== FINAL DEVICE OBJECT ===');
console.log(JSON.stringify(device, null, 2));

// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 INTELLIGENT NAMING CONVENTION PARSER
// Extracts location, site type, device role, and HA pairing from hostnames
// ═══════════════════════════════════════════════════════════════════════════════

// State code to full name lookup table
const STATE_CODE_MAP = {
    'TX': 'Texas', 'RI': 'Rhode Island', 'VI': 'US Virgin Islands',
    'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut',
    'FL': 'Florida', 'GA': 'Georgia', 'IN': 'Indiana', 'KY': 'Kentucky',
    'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
    'NE': 'Nebraska', 'NJ': 'New Jersey', 'NY': 'New York', 'NC': 'North Carolina',
    'OR': 'Oregon', 'SC': 'South Carolina', 'SD': 'South Dakota', 'TN': 'Tennessee',
    'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin',
    'MD': 'Maryland', 'NV': 'Nevada', 'IL': 'Illinois', 'AZ': 'Arizona',
    'AL': 'Alabama', 'AR': 'Arkansas', 'DE': 'Delaware', 'HI': 'Hawaii',
    'ID': 'Idaho', 'IA': 'Iowa', 'KS': 'Kansas', 'LA': 'Louisiana',
    'ME': 'Maine', 'MA': 'Massachusetts', 'MT': 'Montana', 'NH': 'New Hampshire',
    'NM': 'New Mexico', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
    'PA': 'Pennsylvania', 'UT': 'Utah', 'VT': 'Vermont', 'WY': 'Wyoming'
};

/**
 * Parse System Location field to extract geographic and site data
 * This runs FIRST before hostname parsing to prioritize actual CSV data
 * @param {string} systemLocation - System Location field from CSV
 * @returns {Object} Extracted location and site data
 */
function parseSystemLocation(systemLocation) {
    const result = {
        city: '',
        state: '',
        stateCode: '',
        siteType: '',
        country: 'US',
        confidence: 0
    };

    if (!systemLocation || systemLocation === 'Unknown') {
        return result;
    }

    const loc = systemLocation.trim();
    const locLower = loc.toLowerCase();

    // ═══════════════════════════════════════════════════════════════════════════════
    // PATTERN 1: "City, STATE" format (e.g., "Austin, TX", "Germantown, MD")
    // ═══════════════════════════════════════════════════════════════════════════════
    const cityStateMatch = loc.match(/^([^,]+),\s*([A-Z]{2})\b/);
    if (cityStateMatch) {
        result.city = cityStateMatch[1].trim();
        result.stateCode = cityStateMatch[2];
        result.state = STATE_CODE_MAP[result.stateCode] || result.stateCode;
        result.confidence = 90; // High confidence - explicit format
        return result;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // PATTERN 1.5: "City_STATE" format (e.g., "Austin_TX", "Germantown_MD", "North_Las_Vegas_NV")
    // Very common in NMS exports - underscore separator instead of comma
    // ═══════════════════════════════════════════════════════════════════════════════
    const cityStateUnderscoreMatch = loc.match(/^([^_]+(?:_[^_]+)*)_([A-Z]{2})$/);
    if (cityStateUnderscoreMatch) {
        // Replace underscores with spaces in city name (e.g., "North_Las_Vegas" → "North Las Vegas")
        result.city = cityStateUnderscoreMatch[1].replace(/_/g, ' ').trim();
        result.stateCode = cityStateUnderscoreMatch[2];
        result.state = STATE_CODE_MAP[result.stateCode] || result.stateCode;
        result.confidence = 90; // High confidence - explicit format
        return result;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // PATTERN 2: "STATE_SITE" format (e.g., "TX_DCA", "RI_Hub")
    // ═══════════════════════════════════════════════════════════════════════════════
    const stateSiteMatch = loc.match(/^([A-Z]{2})_(.+)$/);
    if (stateSiteMatch) {
        result.stateCode = stateSiteMatch[1];
        result.state = STATE_CODE_MAP[result.stateCode] || result.stateCode;

        const siteCode = stateSiteMatch[2].trim();
        // Preserve specific site types
        if (siteCode === 'DCA' || siteCode === 'DCA1') {
            result.siteType = 'DCA';
        } else if (siteCode === 'DCA2') {
            result.siteType = 'DCA2';
        } else if (siteCode === 'DCA3') {
            result.siteType = 'DCA3';
        } else if (siteCode.toLowerCase() === 'hub') {
            result.siteType = 'Hub';
        } else if (siteCode.toLowerCase() === 'pdc') {
            result.siteType = 'PDC';
        } else if (siteCode.toLowerCase() === 'bdc') {
            result.siteType = 'BDC';
        } else {
            result.siteType = siteCode;
        }

        result.confidence = 85; // High confidence - structured format
        return result;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // PATTERN 3: Complex format with embedded data (e.g., "1833,NOC,DCA,F10,RI WG DCA2 nexus leaf 1")
    // ═══════════════════════════════════════════════════════════════════════════════
    if (locLower.includes('ri ') || locLower.includes('ri wg') || locLower.includes('west greenwich')) {
        result.state = 'Rhode Island';
        result.stateCode = 'RI';
        result.confidence = 70;

        if (locLower.includes('wg') || locLower.includes('west greenwich')) {
            result.city = 'West Greenwich';
            result.confidence = 75;
        }

        // Extract site type from complex string
        if (locLower.includes('dca3')) {
            result.siteType = 'DCA3';
        } else if (locLower.includes('dca2')) {
            result.siteType = 'DCA2';
        } else if (locLower.includes('dca1')) {
            result.siteType = 'DCA';
        } else if (locLower.includes('dca')) {
            result.siteType = 'DCA';
        }

        return result;
    }

    // Check for other state indicators in complex strings
    if (locLower.includes('tx ') || locLower.includes('austin')) {
        result.state = 'Texas';
        result.stateCode = 'TX';
        result.confidence = 70;

        if (locLower.includes('austin')) {
            result.city = 'Austin';
            result.confidence = 75;
        }

        return result;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // PATTERN 4: Site-specific locations (e.g., "DCA3 - Element Critical")
    // ═══════════════════════════════════════════════════════════════════════════════
    const dcaSiteMatch = loc.match(/^(DCA\d*)\s*-\s*(.+)$/);
    if (dcaSiteMatch) {
        result.siteType = dcaSiteMatch[1]; // Preserve DCA, DCA2, DCA3
        result.confidence = 60;
        return result;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // PATTERN 5: Simple location names (e.g., "St.Thomas", "atc computer room")
    // ═══════════════════════════════════════════════════════════════════════════════
    if (locLower.includes('st.thomas') || locLower.includes('st thomas')) {
        result.city = 'St. Thomas';
        result.state = 'US Virgin Islands';
        result.stateCode = 'VI';
        result.confidence = 80;
        return result;
    }

    return result;
}

/**
 * Parse device hostname and extract embedded metadata
 * NOTE: This should be used as FALLBACK when CSV data is not available
 * @param {string} hostname - Device hostname
 * @param {string} systemLocation - System Location field (optional)
 * @param {string} ipAddress - IP address (optional)
 * @returns {Object} Extracted metadata
 */
function parseHostnameIntelligent(hostname, systemLocation = '', ipAddress = '') {
    const result = {
        // Location data
        country: '',
        state: '',
        stateCode: '',
        city: '',
        jurisdiction: '',

        // Site data
        siteType: '',
        siteName: '',
        pod: '',
        stack: '',

        // Device data
        deviceRole: '',
        deviceFunction: '',
        vendor: '',

        // HA data
        haGroup: '',
        haRole: '',
        isPrimary: false,
        haPartner: '',

        // Confidence
        confidence: 0
    };

    if (!hostname) return result;

    const lower = hostname.toLowerCase();
    let confidence = 0;

    // ═══════════════════════════════════════════════════════════════════════════════
    // 1. LOCATION/JURISDICTION EXTRACTION
    // ═══════════════════════════════════════════════════════════════════════════════

    const jurisdictionMap = {
        'lil': { jurisdiction: 'Lottery IL', state: 'Illinois', stateCode: 'IL', country: 'US' },
        'ris': { jurisdiction: 'RI Sports', state: 'Rhode Island', stateCode: 'RI', country: 'US' },
        'risp': { jurisdiction: 'RI Sports', state: 'Rhode Island', stateCode: 'RI', country: 'US' },
        'ri': { jurisdiction: 'Rhode Island', state: 'Rhode Island', stateCode: 'RI', country: 'US' },
        'tx': { jurisdiction: 'Texas', state: 'Texas', stateCode: 'TX', country: 'US' },
        'ant': { jurisdiction: 'Antilles', state: 'Antilles', stateCode: 'ANT', country: 'Caribbean' },
        'usvi': { jurisdiction: 'US Virgin Islands', state: 'US Virgin Islands', stateCode: 'VI', country: 'US' },
        'atc': { jurisdiction: 'ATC', state: 'Unknown', stateCode: 'ATC', country: 'US' },
        'ca': { jurisdiction: 'California', state: 'California', stateCode: 'CA', country: 'US' },
        'co': { jurisdiction: 'Colorado', state: 'Colorado', stateCode: 'CO', country: 'US' },
        'ct': { jurisdiction: 'Connecticut', state: 'Connecticut', stateCode: 'CT', country: 'US' },
        'fl': { jurisdiction: 'Florida', state: 'Florida', stateCode: 'FL', country: 'US' },
        'ga': { jurisdiction: 'Georgia', state: 'Georgia', stateCode: 'GA', country: 'US' },
        'in': { jurisdiction: 'Indiana', state: 'Indiana', stateCode: 'IN', country: 'US' },
        'ky': { jurisdiction: 'Kentucky', state: 'Kentucky', stateCode: 'KY', country: 'US' },
        'mi': { jurisdiction: 'Michigan', state: 'Michigan', stateCode: 'MI', country: 'US' },
        'mn': { jurisdiction: 'Minnesota', state: 'Minnesota', stateCode: 'MN', country: 'US' },
        'ms': { jurisdiction: 'Mississippi', state: 'Mississippi', stateCode: 'MS', country: 'US' },
        'mo': { jurisdiction: 'Missouri', state: 'Missouri', stateCode: 'MO', country: 'US' },
        'ne': { jurisdiction: 'Nebraska', state: 'Nebraska', stateCode: 'NE', country: 'US' },
        'nj': { jurisdiction: 'New Jersey', state: 'New Jersey', stateCode: 'NJ', country: 'US' },
        'ny': { jurisdiction: 'New York', state: 'New York', stateCode: 'NY', country: 'US' },
        'nc': { jurisdiction: 'North Carolina', state: 'North Carolina', stateCode: 'NC', country: 'US' },
        'or': { jurisdiction: 'Oregon', state: 'Oregon', stateCode: 'OR', country: 'US' },
        'sc': { jurisdiction: 'South Carolina', state: 'South Carolina', stateCode: 'SC', country: 'US' },
        'sd': { jurisdiction: 'South Dakota', state: 'South Dakota', stateCode: 'SD', country: 'US' },
        'tn': { jurisdiction: 'Tennessee', state: 'Tennessee', stateCode: 'TN', country: 'US' },
        'va': { jurisdiction: 'Virginia', state: 'Virginia', stateCode: 'VA', country: 'US' },
        'wa': { jurisdiction: 'Washington', state: 'Washington', stateCode: 'WA', country: 'US' },
        'wv': { jurisdiction: 'West Virginia', state: 'West Virginia', stateCode: 'WV', country: 'US' },
        'wi': { jurisdiction: 'Wisconsin', state: 'Wisconsin', stateCode: 'WI', country: 'US' }
    };

    // Check for jurisdiction prefix in hostname
    for (const [prefix, data] of Object.entries(jurisdictionMap)) {
        if (lower.startsWith(prefix)) {
            Object.assign(result, data);
            confidence += 30;
            break;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // 2. CITY EXTRACTION FROM HOSTNAME & SYSTEM LOCATION
    // ═══════════════════════════════════════════════════════════════════════════════

    const cityMap = {
        'austin': { city: 'Austin', state: 'Texas', stateCode: 'TX' },
        'aust': { city: 'Austin', state: 'Texas', stateCode: 'TX' },
        'west greenwich': { city: 'West Greenwich', state: 'Rhode Island', stateCode: 'RI' },
        'wg': { city: 'West Greenwich', state: 'Rhode Island', stateCode: 'RI' },
        'st.thomas': { city: 'St. Thomas', state: 'US Virgin Islands', stateCode: 'VI' },
        'st thomas': { city: 'St. Thomas', state: 'US Virgin Islands', stateCode: 'VI' }
    };

    // Check System Location field
    const locLower = systemLocation.toLowerCase();
    for (const [key, data] of Object.entries(cityMap)) {
        if (locLower.includes(key)) {
            result.city = data.city;
            if (!result.state) result.state = data.state;
            if (!result.stateCode) result.stateCode = data.stateCode;
            confidence += 20;
            break;
        }
    }

    // Check hostname for city codes
    if (lower.includes('aust') || lower.includes('austin')) {
        result.city = 'Austin';
        if (!result.state) result.state = 'Texas';
        if (!result.stateCode) result.stateCode = 'TX';
        confidence += 15;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // 3. SITE TYPE EXTRACTION (PDC/BDC/CAT/HUB/DCA)
    // NOTE: Check most specific patterns FIRST to preserve DCA2, DCA3 distinctions
    // ═══════════════════════════════════════════════════════════════════════════════

    // Check specific site types in order from most to least specific
    if (lower.includes('dca3') || locLower.includes('dca3')) {
        result.siteType = 'DCA3';
        confidence += 15;
    } else if (lower.includes('dca2') || locLower.includes('dca2')) {
        result.siteType = 'DCA2';
        confidence += 15;
    } else if (lower.includes('dca1') || locLower.includes('dca1')) {
        result.siteType = 'DCA';
        confidence += 15;
    } else if (lower.includes('dca') || locLower.includes('dca')) {
        result.siteType = 'DCA';
        confidence += 15;
    } else if (lower.includes('pdc') || locLower.includes('pdc')) {
        result.siteType = 'PDC';
        confidence += 15;
    } else if (lower.includes('bdc') || locLower.includes('bdc')) {
        result.siteType = 'BDC';
        confidence += 15;
    } else if (lower.includes('cat') || locLower.includes('cat')) {
        result.siteType = 'CAT';
        confidence += 15;
    } else if (lower.includes('hub') || locLower.includes('hub')) {
        result.siteType = 'Hub';
        confidence += 15;
    }

    // Extract pod and site/stack numbers
    // Pattern: lilp1s1 = lil + p1 + s1
    const podMatch = lower.match(/p(\d+)/);
    if (podMatch) {
        result.pod = `Pod ${podMatch[1]}`;
        confidence += 10;
    }

    const siteMatch = lower.match(/s(\d+)/);
    if (siteMatch) {
        result.stack = `Site ${siteMatch[1]}`;
        result.haGroup = siteMatch[1]; // s1 or s2 for HA grouping
        confidence += 10;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // 4. DEVICE ROLE & FUNCTION EXTRACTION
    // ═══════════════════════════════════════════════════════════════════════════════

    const deviceRoleMap = {
        'fw': { role: 'Firewall', function: 'Security', type: 'Firewall' },
        'firewall': { role: 'Firewall', function: 'Security', type: 'Firewall' },
        'crsw': { role: 'Core Switch', function: 'Core Switching', type: 'Switch' },
        'wansw': { role: 'WAN Switch', function: 'WAN Edge', type: 'Switch' },
        'vtlb': { role: 'Virtual Load Balancer', function: 'Load Balancing', type: 'Load Balancer' },
        'lb': { role: 'Load Balancer', function: 'Load Balancing', type: 'Load Balancer' },
        'corertr': { role: 'Core Router', function: 'Core Routing', type: 'Router' },
        'swleaf': { role: 'Leaf Switch', function: 'Access Switching', type: 'Switch' },
        'swspine': { role: 'Spine Switch', function: 'Core Switching', type: 'Switch' },
        'hp': { role: 'HP Server', function: 'Compute', type: 'Server', vendor: 'Hewlett Packard' },
        'acon': { role: 'Console Server', function: 'Management', type: 'Console' },
        'lantronix': { role: 'Console Server', function: 'Management', type: 'Console', vendor: 'Lantronix' },
        'pix': { role: 'Firewall', function: 'Security', type: 'Firewall', vendor: 'Cisco' },
        'asa': { role: 'Firewall', function: 'Security', type: 'Firewall', vendor: 'Cisco' }
    };

    for (const [pattern, data] of Object.entries(deviceRoleMap)) {
        if (lower.includes(pattern)) {
            result.deviceRole = data.role;
            result.deviceFunction = data.function;
            if (data.vendor) result.vendor = data.vendor;
            confidence += 25;
            break;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // 5. HIGH AVAILABILITY (HA) DETECTION
    // ═══════════════════════════════════════════════════════════════════════════════

    // Detect HA pairs: s1/s2, p1s1/p1s2, 01/02 suffix
    if (siteMatch) {
        const siteNum = siteMatch[1];
        if (siteNum === '1') {
            result.isPrimary = true;
            result.haRole = 'Primary';
            // Generate partner hostname (s1 → s2)
            result.haPartner = hostname.replace(/s1/, 's2');
        } else if (siteNum === '2') {
            result.isPrimary = false;
            result.haRole = 'Secondary';
            // Generate partner hostname (s2 → s1)
            result.haPartner = hostname.replace(/s2/, 's1');
        }
        confidence += 15;
    }

    // Check for 01/02 numeric suffix patterns
    const suffixMatch = lower.match(/(\d{2})$/);
    if (suffixMatch) {
        const num = parseInt(suffixMatch[1]);
        if (num === 1) {
            result.isPrimary = true;
            result.haRole = result.haRole || 'Primary';
        } else if (num === 2) {
            result.isPrimary = false;
            result.haRole = result.haRole || 'Secondary';
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // 6. IP ADDRESS RANGE TO LOCATION MAPPING
    // ═══════════════════════════════════════════════════════════════════════════════

    if (ipAddress) {
        const ipRangeMap = {
            '10.215.49.': { city: 'Austin', state: 'Texas', site: 'Site 1' },
            '10.215.59.': { city: 'West Greenwich', state: 'Rhode Island', site: 'Site 2' },
            '10.96.237.': { city: 'Providence', state: 'Rhode Island', site: 'Site 1' },
            '10.96.247.': { city: 'Providence', state: 'Rhode Island', site: 'Site 2' },
            '172.25.1.': { city: 'Austin', state: 'Texas', site: 'DCA' },
            '172.25.245.': { city: 'Austin', state: 'Texas', site: 'DCA3' },
            '156.24.': { city: 'West Greenwich', state: 'Rhode Island', site: 'Hub' },
            '10.203.58.': { city: 'West Greenwich', state: 'Rhode Island', site: 'DCA2' },
            '10.201.201.': { city: 'Austin', state: 'Texas', site: 'DCA3' }
        };

        for (const [range, data] of Object.entries(ipRangeMap)) {
            if (ipAddress.startsWith(range)) {
                if (!result.city) result.city = data.city;
                if (!result.state) result.state = data.state;
                if (!result.siteType && data.site) result.siteName = data.site;
                confidence += 10;
                break;
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // 7. PARSE SYSTEM LOCATION FIELD
    // ═══════════════════════════════════════════════════════════════════════════════

    // Handle formats like "Austin, TX" or "West Greenwich, RI"
    const stateMatch = systemLocation.match(/,\s*([A-Z]{2})\b/);
    if (stateMatch) {
        const stateCode = stateMatch[1];
        if (!result.stateCode) result.stateCode = stateCode;

        if (!result.state && STATE_CODE_MAP[stateCode]) {
            result.state = STATE_CODE_MAP[stateCode];
        }
        confidence += 15;
    }

    // Extract city from "City, State" format
    const cityStateMatch = systemLocation.match(/^([^,]+),\s*[A-Z]{2}/);
    if (cityStateMatch && !result.city) {
        result.city = cityStateMatch[1].trim();
        confidence += 10;
    }

    result.confidence = Math.min(confidence, 100);
    return result;
}

/**
 * Detect if two devices are HA pairs
 */
function detectHAPair(device1, device2) {
    const name1 = device1.deviceName.toLowerCase();
    const name2 = device2.deviceName.toLowerCase();

    // Check if names differ by only s1/s2
    if (name1.replace('s1', 'XX') === name2.replace('s2', 'XX')) {
        return true;
    }

    // Check if names differ by only 01/02 suffix
    if (name1.slice(0, -2) === name2.slice(0, -2)) {
        const suffix1 = name1.slice(-2);
        const suffix2 = name2.slice(-2);
        if ((suffix1 === '01' && suffix2 === '02') || (suffix1 === '02' && suffix2 === '01')) {
            return true;
        }
    }

    return false;
}

/**
 * Apply intelligent parsing to device dataset
 */
function enrichDeviceData(devices) {
    const enriched = devices.map(device => {
        const parsed = parseHostnameIntelligent(
            device.deviceName || device.hostname,
            device.systemLocation || device.location || '',
            device.managementIP || device.ipAddress || ''
        );

        return {
            ...device,
            // Override empty fields with parsed data
            country: device.country || parsed.country,
            state: device.state || parsed.state,
            stateCode: parsed.stateCode,
            city: device.city || parsed.city,
            siteType: device.siteType || parsed.siteType,
            deviceRole: device.deviceRole || parsed.deviceRole,
            haGroup: parsed.haGroup,
            haRole: parsed.haRole,
            isPrimary: parsed.isPrimary,
            haPartner: parsed.haPartner,
            parsingConfidence: parsed.confidence
        };
    });

    // Second pass: Detect HA pairs
    for (let i = 0; i < enriched.length; i++) {
        for (let j = i + 1; j < enriched.length; j++) {
            if (detectHAPair(enriched[i], enriched[j])) {
                enriched[i].hasHA = true;
                enriched[j].hasHA = true;
                enriched[i].haPartner = enriched[j].deviceName;
                enriched[j].haPartner = enriched[i].deviceName;
            }
        }
    }

    return enriched;
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        parseHostnameIntelligent,
        detectHAPair,
        enrichDeviceData
    };
}

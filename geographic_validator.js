// ═══════════════════════════════════════════════════════════════════════════════
// 🌍 COMPREHENSIVE GEOGRAPHIC VALIDATION SYSTEM
// Multi-field analysis with confidence scoring and world region mapping
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// WORLD REGIONS MAPPING
// ═══════════════════════════════════════════════════════════════════════════════
const WORLD_REGIONS = {
    US: 'United States',
    EU: 'Europe',
    AP: 'Asia-Pacific',
    LA: 'Latin America',
    UNKNOWN: 'Unknown'
};

// ═══════════════════════════════════════════════════════════════════════════════
// US STATE DATABASE - Complete with validation data
// ═══════════════════════════════════════════════════════════════════════════════
const US_STATES = {
    'AL': { name: 'Alabama', code: 'AL', region: 'US', abbrev: ['ala', 'alabama'] },
    'AK': { name: 'Alaska', code: 'AK', region: 'US', abbrev: ['alaska'] },
    'AZ': { name: 'Arizona', code: 'AZ', region: 'US', abbrev: ['ariz', 'arizona'] },
    'AR': { name: 'Arkansas', code: 'AR', region: 'US', abbrev: ['ark', 'arkansas'] },
    'CA': { name: 'California', code: 'CA', region: 'US', abbrev: ['calif', 'california'] },
    'CO': { name: 'Colorado', code: 'CO', region: 'US', abbrev: ['colo', 'colorado'] },
    'CT': { name: 'Connecticut', code: 'CT', region: 'US', abbrev: ['conn', 'connecticut'] },
    'DE': { name: 'Delaware', code: 'DE', region: 'US', abbrev: ['del', 'delaware'] },
    'FL': { name: 'Florida', code: 'FL', region: 'US', abbrev: ['fla', 'florida'] },
    'GA': { name: 'Georgia', code: 'GA', region: 'US', abbrev: ['georgia'] },
    'HI': { name: 'Hawaii', code: 'HI', region: 'US', abbrev: ['hawaii'] },
    'ID': { name: 'Idaho', code: 'ID', region: 'US', abbrev: ['idaho'] },
    'IL': { name: 'Illinois', code: 'IL', region: 'US', abbrev: ['ill', 'illinois'] },
    'IN': { name: 'Indiana', code: 'IN', region: 'US', abbrev: ['ind', 'indiana'] },
    'IA': { name: 'Iowa', code: 'IA', region: 'US', abbrev: ['iowa'] },
    'KS': { name: 'Kansas', code: 'KS', region: 'US', abbrev: ['kans', 'kansas'] },
    'KY': { name: 'Kentucky', code: 'KY', region: 'US', abbrev: ['ky', 'kentucky'] },
    'LA': { name: 'Louisiana', code: 'LA', region: 'US', abbrev: ['louisiana'] },
    'ME': { name: 'Maine', code: 'ME', region: 'US', abbrev: ['maine'] },
    'MD': { name: 'Maryland', code: 'MD', region: 'US', abbrev: ['maryland'] },
    'MA': { name: 'Massachusetts', code: 'MA', region: 'US', abbrev: ['mass', 'massachusetts'] },
    'MI': { name: 'Michigan', code: 'MI', region: 'US', abbrev: ['mich', 'michigan'] },
    'MN': { name: 'Minnesota', code: 'MN', region: 'US', abbrev: ['minn', 'minnesota'] },
    'MS': { name: 'Mississippi', code: 'MS', region: 'US', abbrev: ['miss', 'mississippi'] },
    'MO': { name: 'Missouri', code: 'MO', region: 'US', abbrev: ['missouri'] },
    'MT': { name: 'Montana', code: 'MT', region: 'US', abbrev: ['mont', 'montana'] },
    'NE': { name: 'Nebraska', code: 'NE', region: 'US', abbrev: ['nebr', 'nebraska'] },
    'NV': { name: 'Nevada', code: 'NV', region: 'US', abbrev: ['nevada'] },
    'NH': { name: 'New Hampshire', code: 'NH', region: 'US', abbrev: ['new hampshire'] },
    'NJ': { name: 'New Jersey', code: 'NJ', region: 'US', abbrev: ['new jersey'] },
    'NM': { name: 'New Mexico', code: 'NM', region: 'US', abbrev: ['new mexico'] },
    'NY': { name: 'New York', code: 'NY', region: 'US', abbrev: ['new york'] },
    'NC': { name: 'North Carolina', code: 'NC', region: 'US', abbrev: ['north carolina'] },
    'ND': { name: 'North Dakota', code: 'ND', region: 'US', abbrev: ['north dakota'] },
    'OH': { name: 'Ohio', code: 'OH', region: 'US', abbrev: ['ohio'] },
    'OK': { name: 'Oklahoma', code: 'OK', region: 'US', abbrev: ['okla', 'oklahoma'] },
    'OR': { name: 'Oregon', code: 'OR', region: 'US', abbrev: ['oregon'] },
    'PA': { name: 'Pennsylvania', code: 'PA', region: 'US', abbrev: ['penn', 'pennsylvania'] },
    'RI': { name: 'Rhode Island', code: 'RI', region: 'US', abbrev: ['rhode island'] },
    'SC': { name: 'South Carolina', code: 'SC', region: 'US', abbrev: ['south carolina'] },
    'SD': { name: 'South Dakota', code: 'SD', region: 'US', abbrev: ['south dakota'] },
    'TN': { name: 'Tennessee', code: 'TN', region: 'US', abbrev: ['tenn', 'tennessee'] },
    'TX': { name: 'Texas', code: 'TX', region: 'US', abbrev: ['texas'] },
    'UT': { name: 'Utah', code: 'UT', region: 'US', abbrev: ['utah'] },
    'VT': { name: 'Vermont', code: 'VT', region: 'US', abbrev: ['vermont'] },
    'VA': { name: 'Virginia', code: 'VA', region: 'US', abbrev: ['virginia'] },
    'WA': { name: 'Washington', code: 'WA', region: 'US', abbrev: ['wash', 'washington'] },
    'WV': { name: 'West Virginia', code: 'WV', region: 'US', abbrev: ['west virginia'] },
    'WI': { name: 'Wisconsin', code: 'WI', region: 'US', abbrev: ['wisc', 'wisconsin'] },
    'WY': { name: 'Wyoming', code: 'WY', region: 'US', abbrev: ['wyo', 'wyoming'] },
    'DC': { name: 'District of Columbia', code: 'DC', region: 'US', abbrev: ['washington dc', 'dc'] },
    'PR': { name: 'Puerto Rico', code: 'PR', region: 'LA', abbrev: ['puerto rico'] },
    'VI': { name: 'US Virgin Islands', code: 'VI', region: 'LA', abbrev: ['virgin islands', 'usvi'] }
};

// ═══════════════════════════════════════════════════════════════════════════════
// INTERNATIONAL LOCATIONS DATABASE
// ═══════════════════════════════════════════════════════════════════════════════
const INTERNATIONAL_LOCATIONS = {
    // Europe
    'UK': { name: 'United Kingdom', code: 'UK', region: 'EU', aliases: ['england', 'britain', 'london'] },
    'DE': { name: 'Germany', code: 'DE', region: 'EU', aliases: ['germany', 'deutschland', 'berlin'] },
    'FR': { name: 'France', code: 'FR', region: 'EU', aliases: ['france', 'paris'] },
    'IT': { name: 'Italy', code: 'IT', region: 'EU', aliases: ['italy', 'rome'] },
    'ES': { name: 'Spain', code: 'ES', region: 'EU', aliases: ['spain', 'madrid'] },
    'NL': { name: 'Netherlands', code: 'NL', region: 'EU', aliases: ['netherlands', 'amsterdam'] },
    'BE': { name: 'Belgium', code: 'BE', region: 'EU', aliases: ['belgium', 'brussels'] },
    'CH': { name: 'Switzerland', code: 'CH', region: 'EU', aliases: ['switzerland', 'zurich'] },
    'SE': { name: 'Sweden', code: 'SE', region: 'EU', aliases: ['sweden', 'stockholm'] },
    'IE': { name: 'Ireland', code: 'IE', region: 'EU', aliases: ['ireland', 'dublin'] },

    // Asia-Pacific
    'CN': { name: 'China', code: 'CN', region: 'AP', aliases: ['china', 'beijing', 'shanghai'] },
    'JP': { name: 'Japan', code: 'JP', region: 'AP', aliases: ['japan', 'tokyo'] },
    'SG': { name: 'Singapore', code: 'SG', region: 'AP', aliases: ['singapore'] },
    'AU': { name: 'Australia', code: 'AU', region: 'AP', aliases: ['australia', 'sydney'] },
    'IN': { name: 'India', code: 'IN', region: 'AP', aliases: ['india', 'mumbai', 'delhi'] },
    'KR': { name: 'South Korea', code: 'KR', region: 'AP', aliases: ['korea', 'seoul'] },
    'HK': { name: 'Hong Kong', code: 'HK', region: 'AP', aliases: ['hong kong', 'hongkong'] },
    'NZ': { name: 'New Zealand', code: 'NZ', region: 'AP', aliases: ['new zealand'] },

    // Latin America
    'MX': { name: 'Mexico', code: 'MX', region: 'LA', aliases: ['mexico', 'mexico city'] },
    'BR': { name: 'Brazil', code: 'BR', region: 'LA', aliases: ['brazil', 'brasil', 'sao paulo'] },
    'AR': { name: 'Argentina', code: 'AR', region: 'LA', aliases: ['argentina', 'buenos aires'] },
    'CL': { name: 'Chile', code: 'CL', region: 'LA', aliases: ['chile', 'santiago'] },
    'CO': { name: 'Colombia', code: 'CO', region: 'LA', aliases: ['colombia', 'bogota'] },
    'CR': { name: 'Costa Rica', code: 'CR', region: 'LA', aliases: ['costa rica'] }
};

// ═══════════════════════════════════════════════════════════════════════════════
// IP ADDRESS RANGE TO LOCATION MAPPING (Common datacenter/cloud providers)
// ═══════════════════════════════════════════════════════════════════════════════
const IP_RANGES = {
    // Private/Internal (no geographic data)
    '10.': { region: null, note: 'Private network' },
    '172.16.': { region: null, note: 'Private network' },
    '192.168.': { region: null, note: 'Private network' },

    // Known datacenter ranges (examples - expand as needed)
    '156.24.': { city: 'West Greenwich', state: 'Rhode Island', stateCode: 'RI', region: 'US', confidence: 80 },
    '100.65.': { city: '', state: '', region: 'US', confidence: 50 } // Partial info
};

// ═══════════════════════════════════════════════════════════════════════════════
// KNOWN US CITIES DATABASE (for validation)
// ═══════════════════════════════════════════════════════════════════════════════
const US_CITIES = {
    'austin': { city: 'Austin', state: 'Texas', stateCode: 'TX' },
    'germantown': { city: 'Germantown', state: 'Maryland', stateCode: 'MD' },
    'west greenwich': { city: 'West Greenwich', state: 'Rhode Island', stateCode: 'RI' },
    'north las vegas': { city: 'North Las Vegas', state: 'Nevada', stateCode: 'NV' },
    'las vegas': { city: 'Las Vegas', state: 'Nevada', stateCode: 'NV' },
    'providence': { city: 'Providence', state: 'Rhode Island', stateCode: 'RI' },
    'st thomas': { city: 'St. Thomas', state: 'US Virgin Islands', stateCode: 'VI' }
    // Add more as needed
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPREHENSIVE GEOGRAPHIC ANALYZER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Analyze geographic data from multiple sources with SHEET NAME PRIORITY
 * Only returns data when confidence is HIGH
 *
 * NEW PRIORITY ORDER:
 * 1. Sheet Name (HIGHEST - ground truth)
 * 2. Hostname Correlation (validation boost)
 * 3. System Location (must agree or be ignored)
 * 4. Tenant field
 * 5. IP Address
 */
function analyzeGeographicLocation(device) {
    const sources = {
        sheetName: device.sheetName || '',
        deviceName: device.deviceName || device.hostname || '',
        systemLocation: device.systemLocation || device.location || '',
        tenant: device.tenant || '',
        ipAddress: device.managementIP || device.ipAddress || '',
        region: device.region || ''
    };

    console.log(`\n🌍 Analyzing geographic data for: ${sources.deviceName}`);
    console.log(`   Sources: Sheet="${sources.sheetName}", SystemLocation="${sources.systemLocation}", Tenant="${sources.tenant}"`);

    const results = [];

    // ANALYSIS 1: Sheet Name (HIGHEST PRIORITY - Ground Truth)
    const sheetResult = analyzeSheetName(sources.sheetName);
    if (sheetResult) {
        results.push(sheetResult);
        console.log(`   ✅ SHEET NAME: ${sheetResult.state} (confidence: ${sheetResult.confidence}% - GROUND TRUTH)`);

        // ANALYSIS 2: Hostname Correlation (validates/boosts sheet name)
        const correlationResult = analyzeHostnameCorrelation(sources.deviceName, sheetResult);
        if (correlationResult && correlationResult.correlation === 'positive') {
            // Replace sheet result with boosted version BUT KEEP SheetName source
            results[0] = { ...correlationResult, source: 'SheetName' };  // Preserve SheetName source!
            console.log(`   ⬆️  HOSTNAME MATCH: "${sources.deviceName}" correlates with ${sheetResult.state} (confidence: ${correlationResult.confidence}%)`);
        } else if (correlationResult && correlationResult.correlation === 'negative') {
            console.log(`   ⚠️  HOSTNAME CONFLICT: "${sources.deviceName}" suggests ${correlationResult.conflictState}, but sheet says ${sheetResult.state} (sheet wins)`);
        }
    }

    // ANALYSIS 3: System Location
    const locResult = analyzeSystemLocation(sources.systemLocation);
    if (locResult) {
        results.push({ ...locResult, source: 'SystemLocation' });
        console.log(`   ✓ SystemLocation: ${locResult.city || '(no city)'}, ${locResult.state || locResult.country} (confidence: ${locResult.confidence}%)`);
    }

    // ANALYSIS 4: Tenant/Region field
    const tenantResult = analyzeTenantRegion(sources.tenant || sources.region);
    if (tenantResult) {
        results.push({ ...tenantResult, source: 'Tenant' });
        console.log(`   ✓ Tenant: ${tenantResult.state || tenantResult.country} (confidence: ${tenantResult.confidence}%)`);
    }

    // ANALYSIS 5: IP Address
    const ipResult = analyzeIPAddress(sources.ipAddress);
    if (ipResult) {
        results.push({ ...ipResult, source: 'IPAddress' });
        console.log(`   ✓ IP: ${ipResult.city || ''}, ${ipResult.state || ipResult.country} (confidence: ${ipResult.confidence}%)`);
    }

    // CROSS-VALIDATION: Sheet name always wins conflicts
    const validated = crossValidateResults(results);

    if (validated) {
        console.log(`   ✅ VALIDATED: ${validated.city || '(no city)'}, ${validated.state || validated.country}, ${validated.worldRegion} (${validated.confidence}%)`);
        return validated;
    } else {
        console.log(`   ❌ REJECTED: Conflicting or low-confidence data`);
        return {
            country: '',
            state: '',
            stateCode: '',
            city: '',
            worldRegion: '',
            confidence: 0,
            validated: false
        };
    }
}

/**
 * Analyze System Location field with validation
 */
function analyzeSystemLocation(systemLocation) {
    if (!systemLocation || systemLocation === 'Unknown' || systemLocation.trim() === '') {
        return null;
    }

    const loc = systemLocation.trim();
    const locLower = loc.toLowerCase();

    // STRICT REJECTION RULES - Explicitly reject non-geographic data
    const rejectionPatterns = [
        /^cevChassis/i,          // Cisco chassis names
        /^ex\d{4}-/i,            // Juniper model numbers
        /^Model Type$/i,         // Generic placeholder
        /^UNKNOWNN?$/i,          // Unknown variations
        /^zeroDotZero$/i,        // OID placeholder
        /^\w{1,3}$/,             // Single/double/triple letters (NY, KY, GAS, WVS)
        /^Unknown \(edit/i,      // SNMP placeholder
        /chassis/i,              // Any chassis reference
        /^model/i,               // Model references
        /^'?-?\d+$/,             // Pure numbers: "1", "100", "1001", "'-1"
        /^-?\d+\.\d+/,           // Version numbers: "7.1.0.0", "-7.2.0.0"
        /^[A-Z]{2,}\d{5,}/,      // Serial numbers: "FG100D3G14824251", "FG100E4Q17024688"
        /component.*identifier/i,// Generic identifiers
        /^Single\s+Chassis/i,    // Chassis references
        /^\d{4}-\d{2}-\d{2}/,    // Dates: "2024-01-15"
        /^[\d.]+$/,              // Only numbers and dots: "1.2.3.4", "10.0.0.1"
        /^[A-F0-9]{8,}/i,        // Long hex strings (MACs, IDs)
        /^null$/i,               // Null values
        /^n\/a$/i,               // N/A values
        /^none$/i                // None values
    ];

    for (const pattern of rejectionPatterns) {
        if (pattern.test(loc)) {
            return null; // Explicitly reject
        }
    }

    // PATTERN 1: "City, STATE_CODE" (e.g., "Austin, TX", "Germantown, MD")
    const cityStateMatch = loc.match(/^([^,]+),\s*([A-Z]{2})\b/);
    if (cityStateMatch) {
        const city = cityStateMatch[1].trim();
        const stateCode = cityStateMatch[2];

        // Validate state code
        if (US_STATES[stateCode]) {
            return {
                city: city,
                state: US_STATES[stateCode].name,
                stateCode: stateCode,
                country: 'United States',
                worldRegion: US_STATES[stateCode].region,
                confidence: 95 // High confidence - explicit format
            };
        }
    }

    // PATTERN 1b: "City,STATE_CODE" (NO SPACE - e.g., "Austin,TX", "Austin,Texas")
    const cityStateNoSpaceMatch = loc.match(/^([^,]+),([A-Za-z]+)$/);
    if (cityStateNoSpaceMatch) {
        const city = cityStateNoSpaceMatch[1].trim();
        const stateOrCode = cityStateNoSpaceMatch[2];

        // Check if it's a 2-letter state code
        if (stateOrCode.length === 2 && US_STATES[stateOrCode.toUpperCase()]) {
            const stateCode = stateOrCode.toUpperCase();
            return {
                city: city,
                state: US_STATES[stateCode].name,
                stateCode: stateCode,
                country: 'United States',
                worldRegion: US_STATES[stateCode].region,
                confidence: 94
            };
        }

        // Check if it's a full state name
        const stateLower = stateOrCode.toLowerCase();
        for (const [code, stateData] of Object.entries(US_STATES)) {
            if (stateData.name.toLowerCase() === stateLower ||
                stateData.abbrev.includes(stateLower)) {
                return {
                    city: city,
                    state: stateData.name,
                    stateCode: code,
                    country: 'United States',
                    worldRegion: stateData.region,
                    confidence: 93
                };
            }
        }
    }

    // PATTERN 1c: "City, State Name" (FULL STATE NAME - e.g., "Madison, Wisconsin", "Columbia, South Carolina")
    const cityFullStateMatch = loc.match(/^([^,]+),\s+([A-Za-z\s]+)$/);
    if (cityFullStateMatch) {
        const city = cityFullStateMatch[1].trim();
        const stateName = cityFullStateMatch[2].trim();
        const stateLower = stateName.toLowerCase();

        // Check against full state names
        for (const [code, stateData] of Object.entries(US_STATES)) {
            if (stateData.name.toLowerCase() === stateLower ||
                stateData.abbrev.includes(stateLower)) {
                return {
                    city: city,
                    state: stateData.name,
                    stateCode: code,
                    country: 'United States',
                    worldRegion: stateData.region,
                    confidence: 92
                };
            }
        }
    }

    // PATTERN 2: "City_STATE_CODE" (e.g., "Austin_TX", "Germantown_MD")
    const cityStateUnderscoreMatch = loc.match(/^([^_]+(?:_[^_]+)*)_([A-Z]{2})$/);
    if (cityStateUnderscoreMatch) {
        const city = cityStateUnderscoreMatch[1].replace(/_/g, ' ').trim();
        const stateCode = cityStateUnderscoreMatch[2];

        // Validate state code
        if (US_STATES[stateCode]) {
            return {
                city: city,
                state: US_STATES[stateCode].name,
                stateCode: stateCode,
                country: 'United States',
                worldRegion: US_STATES[stateCode].region,
                confidence: 90
            };
        }
    }

    // PATTERN 3: "STATE_CODE_SITE" (e.g., "TX_DCA", "RI_Hub")
    const stateSiteMatch = loc.match(/^([A-Z]{2})_(.+)$/);
    if (stateSiteMatch) {
        const stateCode = stateSiteMatch[1];

        // Validate state code
        if (US_STATES[stateCode]) {
            return {
                city: '',
                state: US_STATES[stateCode].name,
                stateCode: stateCode,
                country: 'United States',
                worldRegion: US_STATES[stateCode].region,
                confidence: 85
            };
        }
    }

    // PATTERN 4: "STATE_CODE CITY_ABBREV" format (e.g., "RI WG" = Rhode Island, West Greenwich)
    // Common in complex location strings like "1833,NOC,DCA,F10,RI WG DCA2 nexus leaf 1"
    const stateCodeCityMatch = loc.match(/\b([A-Z]{2})\s+([A-Z]{2,})\b/);
    if (stateCodeCityMatch) {
        const stateCode = stateCodeCityMatch[1];
        const cityAbbrev = stateCodeCityMatch[2].toLowerCase();

        if (US_STATES[stateCode]) {
            // Try to match city abbreviation
            const cityMatch = Object.entries(US_CITIES).find(([key, data]) =>
                data.stateCode === stateCode &&
                (data.city.toLowerCase().startsWith(cityAbbrev) ||
                 data.city.toLowerCase().split(' ').some(word => word.startsWith(cityAbbrev)))
            );

            if (cityMatch) {
                return {
                    city: cityMatch[1].city,
                    state: US_STATES[stateCode].name,
                    stateCode: stateCode,
                    country: 'United States',
                    worldRegion: 'US',
                    confidence: 88
                };
            } else {
                // State code valid but city unknown - still return state
                return {
                    city: '',
                    state: US_STATES[stateCode].name,
                    stateCode: stateCode,
                    country: 'United States',
                    worldRegion: 'US',
                    confidence: 85 // Meets threshold for single-source validation
                };
            }
        }
    }

    // PATTERN 5: Check for known cities (full name or partial match)
    for (const [cityKey, cityData] of Object.entries(US_CITIES)) {
        if (locLower.includes(cityKey)) {
            return {
                city: cityData.city,
                state: cityData.state,
                stateCode: cityData.stateCode,
                country: 'United States',
                worldRegion: 'US',
                confidence: 80
            };
        }
    }

    // PATTERN 6: Check international locations
    for (const [code, locData] of Object.entries(INTERNATIONAL_LOCATIONS)) {
        for (const alias of locData.aliases) {
            if (locLower.includes(alias)) {
                return {
                    city: '',
                    state: '',
                    stateCode: '',
                    country: locData.name,
                    worldRegion: locData.region,
                    confidence: 75
                };
            }
        }
    }

    return null;
}

/**
 * Analyze Tenant/Region field
 */
function analyzeTenantRegion(tenant) {
    if (!tenant || typeof tenant !== 'string' || tenant === 'Default Tenant') {
        return null;
    }

    const tenantLower = tenant.toLowerCase();

    // Check if it's a state name or tenant pattern
    const stateMatch = tenant.match(/^([A-Za-z\s]+)(?:_Tenant)?$/);
    if (stateMatch) {
        const stateName = stateMatch[1].trim();

        // Check US states
        for (const [code, stateData] of Object.entries(US_STATES)) {
            if (stateData.name.toLowerCase() === stateName.toLowerCase() ||
                stateData.abbrev.includes(stateName.toLowerCase())) {
                return {
                    city: '',
                    state: stateData.name,
                    stateCode: code,
                    country: 'United States',
                    worldRegion: stateData.region,
                    confidence: 70
                };
            }
        }

        // Check international
        for (const [code, locData] of Object.entries(INTERNATIONAL_LOCATIONS)) {
            if (locData.name.toLowerCase() === stateName.toLowerCase() ||
                locData.aliases.includes(stateName.toLowerCase())) {
                return {
                    city: '',
                    state: '',
                    stateCode: '',
                    country: locData.name,
                    worldRegion: locData.region,
                    confidence: 70
                };
            }
        }
    }

    return null;
}

/**
 * Analyze IP Address for geographic hints
 */
function analyzeIPAddress(ipAddress) {
    if (!ipAddress) return null;

    // Check against known IP ranges
    for (const [range, data] of Object.entries(IP_RANGES)) {
        if (ipAddress.startsWith(range)) {
            if (data.region === null) {
                // Private network - no geographic data
                return null;
            }

            return {
                city: data.city || '',
                state: data.state || '',
                stateCode: data.stateCode || '',
                country: data.region === 'US' ? 'United States' : '',
                worldRegion: data.region || '',
                confidence: data.confidence || 50
            };
        }
    }

    return null;
}

/**
 * Analyze Sheet Name (HIGHEST PRIORITY - Ground Truth)
 * Excel sheet names represent the actual state/region
 */
function analyzeSheetName(sheetName) {
    if (!sheetName || typeof sheetName !== 'string') {
        return null;
    }

    // Clean sheet name: remove "_Tenant", "node-list-", etc.
    let cleanName = sheetName
        .replace(/_Tenant$/i, '')
        .replace(/^node-list-/i, '')
        .replace(/_/g, ' ')
        .trim();

    // Skip generic sheet names
    if (cleanName === 'Default' || cleanName === 'DCA Hosted Services' ||
        cleanName === 'NRC' || cleanName === 'Antilles') {
        return null;
    }

    const nameLower = cleanName.toLowerCase();

    // Check if it's a US state (full name or abbreviation)
    for (const [code, stateData] of Object.entries(US_STATES)) {
        if (stateData.name.toLowerCase() === nameLower ||
            stateData.abbrev.includes(nameLower) ||
            stateData.name.toLowerCase().replace(/\s+/g, '') === nameLower.replace(/\s+/g, '')) {
            return {
                city: '',
                state: stateData.name,
                stateCode: code,
                country: 'United States',
                worldRegion: stateData.region,
                confidence: 98, // VERY HIGH - sheet name is ground truth
                source: 'SheetName'
            };
        }
    }

    // Check international locations
    for (const [code, locData] of Object.entries(INTERNATIONAL_LOCATIONS)) {
        if (locData.name.toLowerCase() === nameLower ||
            locData.aliases.includes(nameLower)) {
            return {
                city: '',
                state: '',
                stateCode: '',
                country: locData.name,
                worldRegion: locData.region,
                confidence: 98,
                source: 'SheetName'
            };
        }
    }

    return null;
}

/**
 * Analyze Hostname for Correlation with Sheet Name
 * Provides VALIDATION BOOST when hostname matches expected pattern
 */
function analyzeHostnameCorrelation(deviceName, sheetResult) {
    if (!deviceName || !sheetResult || typeof deviceName !== 'string') {
        return null;
    }

    const nameLower = deviceName.toLowerCase();
    const expectedState = sheetResult.state;
    const expectedCode = sheetResult.stateCode;

    if (!expectedState) {
        return null;
    }

    // Define state-specific hostname patterns
    const correlationPatterns = {
        'New York': [/^nys-/i, /^ny-/i, /newyork/i],
        'California': [/^ca-/i, /^calif-/i, /california/i],
        'Texas': [/^tx-/i, /^texas-/i, /austin/i, /^aus/i],
        'Rhode Island': [/^ri-/i, /^ris-/i, /^risp/i, /rhodeisland/i],
        'Florida': [/^fl-/i, /^fla-/i, /florida/i],
        'Georgia': [/^ga-/i, /^geo-/i, /georgia/i],
        'Connecticut': [/^ct-/i, /^conn-/i, /connecticut/i],
        'Michigan': [/^mi-/i, /^mich-/i, /michigan/i],
        'Oregon': [/^or-/i, /^ore-/i, /oregon/i],
        'Virginia': [/^va-/i, /^virg-/i, /virginia/i],
        'Washington': [/^wa-/i, /^wash-/i, /washington/i],
        'Wisconsin': [/^wi-/i, /^wisc-/i, /wisconsin/i]
        // Add more as needed
    };

    const patterns = correlationPatterns[expectedState];
    if (!patterns) {
        // No patterns defined for this state - neutral
        return null;
    }

    // Check if hostname matches any expected pattern
    const hasMatch = patterns.some(pattern => pattern.test(nameLower));

    if (hasMatch) {
        // POSITIVE CORRELATION - hostname matches expected state
        return {
            ...sheetResult,
            confidence: Math.min(99, sheetResult.confidence + 5), // Boost confidence
            correlation: 'positive',
            source: 'HostnameCorrelation'
        };
    }

    // Check if hostname matches a DIFFERENT state (conflict)
    for (const [stateName, statePatterns] of Object.entries(correlationPatterns)) {
        if (stateName !== expectedState) {
            const conflictMatch = statePatterns.some(pattern => pattern.test(nameLower));
            if (conflictMatch) {
                // NEGATIVE CORRELATION - hostname suggests different state
                return {
                    ...sheetResult,
                    confidence: sheetResult.confidence - 10, // Reduce confidence
                    correlation: 'negative',
                    conflictState: stateName,
                    source: 'HostnameCorrelation'
                };
            }
        }
    }

    // No correlation found - neutral
    return null;
}

/**
 * Cross-validate results from multiple sources
 * PRIORITIZES SHEET NAME as ground truth
 */
function crossValidateResults(results) {
    if (results.length === 0) {
        return null;
    }

    // PRIORITY 1: Check for Sheet Name source (HIGHEST - Ground Truth)
    const sheetResult = results.find(r => r.source === 'SheetName');

    if (sheetResult) {
        // Sheet name exists - use it as ground truth
        const merged = { ...sheetResult, validated: true };

        // Check if other sources AGREE and can enhance (add city data)
        const otherSources = results.filter(r => r.source !== 'SheetName');

        for (const other of otherSources) {
            // If states match OR other has no state, can merge city data
            if (!other.state || other.state === sheetResult.state) {
                if (!merged.city && other.city) {
                    merged.city = other.city;
                    // Slight confidence boost for city data
                    merged.confidence = Math.min(99, merged.confidence + 2);
                }
            } else {
                // State CONFLICT - sheet name wins, ignore conflicting source
                console.log(`   ⚠️ Ignoring conflicting source: ${other.source} says "${other.state}", but sheet says "${sheetResult.state}"`);
            }
        }

        return merged;
    }

    // NO SHEET NAME - Use standard validation logic

    // If only one source, require high confidence
    if (results.length === 1) {
        if (results[0].confidence >= 85) {
            return { ...results[0], validated: true };
        }
        return null;
    }

    // Multiple sources - check for agreement
    const states = results.filter(r => r.state).map(r => r.state);
    const countries = results.filter(r => r.country).map(r => r.country);

    // Check if sources agree
    const stateAgreement = states.length > 0 && states.every(s => s === states[0]);
    const countryAgreement = countries.length > 0 && countries.every(c => c === countries[0]);

    // If there's disagreement WITHOUT sheet name, reject
    if (states.length > 1 && !stateAgreement) {
        console.warn(`   ⚠️ State disagreement: ${states.join(', ')}`);
        return null;
    }

    if (countries.length > 1 && !countryAgreement) {
        console.warn(`   ⚠️ Country disagreement: ${countries.join(', ')}`);
        return null;
    }

    // Sources agree - merge and use highest confidence values
    const merged = {
        city: '',
        state: '',
        stateCode: '',
        country: '',
        worldRegion: '',
        confidence: 0,
        validated: true
    };

    // Take the most complete data from highest confidence source
    results.sort((a, b) => b.confidence - a.confidence);

    for (const result of results) {
        if (!merged.city && result.city) merged.city = result.city;
        if (!merged.state && result.state) merged.state = result.state;
        if (!merged.stateCode && result.stateCode) merged.stateCode = result.stateCode;
        if (!merged.country && result.country) merged.country = result.country;
        if (!merged.worldRegion && result.worldRegion) merged.worldRegion = result.worldRegion;
    }

    // Calculate combined confidence (average of top 2)
    merged.confidence = Math.round(
        results.slice(0, 2).reduce((sum, r) => sum + r.confidence, 0) / Math.min(2, results.length)
    );

    // Require minimum confidence
    if (merged.confidence < 70) {
        console.warn(`   ⚠️ Low combined confidence: ${merged.confidence}%`);
        return null;
    }

    return merged;
}

// Export for use in NetAssets
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { analyzeGeographicLocation, US_STATES, INTERNATIONAL_LOCATIONS, WORLD_REGIONS };
}

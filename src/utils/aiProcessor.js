// Ground truth validation data - client-provided worked examples
export const GROUND_TRUTH_EXAMPLES = [
  {
    id: 'gt-1',
    input: {
      Mfg_Part_Num: 'PDSH4816AF',
      Part_Desc: 'PDSH4816AF Dishwasher SS - Display Only',
      E1_Brand: '-- Unbranded --',
      Unilog_Brand: '-- No Unilog Brand --',
      DIB_Brand: '-- No DIB Brand --',
      Part_Manuf: 'Rheem Manufacturing'
    },
    expected: {
      MANUFACTURER_NAME: 'Rheem Manufacturing',
      BRAND_NAME: 'FRIGIDAIRE®',
      CLASSPATH: 'Appliances & Consumer Electronics>Kitchen Appliances>Built-In Dishwashers',
      INVOICE_DESC: 'DISHWASHER LEG 5 SST 120V 15A 50-1/4IN',
      SHORT_DESC: 'FRIGIDAIRE® Professional Series PDSH4816AF Dishwasher With CleanBoost™, Leg Mounting, 5-Wash Cycle, Stainless Steel'
    }
  },
  {
    id: 'gt-2',
    input: {
      Mfg_Part_Num: 'WDTS7024RZ',
      Part_Desc: 'WDTS7024RZ Dishwasher SS - Display Only',
      E1_Brand: '-- Unbranded --',
      Unilog_Brand: '-- No Unilog Brand --',
      DIB_Brand: '-- No DIB Brand --',
      Part_Manuf: 'Whirlpool Corporation'
    },
    expected: {
      MANUFACTURER_NAME: 'Whirlpool Corporation',
      BRAND_NAME: 'Whirlpool®',
      CLASSPATH: 'Appliances & Consumer Electronics>Kitchen Appliances>Built-In Dishwashers',
      INVOICE_DESC: 'DISHWASHER LEG 5 SST 120V 15A 50-1/4IN',
      SHORT_DESC: 'Whirlpool® Eco Series WDTS7024RZ Dishwasher, Built-in Mounting, Stainless Steel, Stainless Steel'
    }
  }
];

// Sample data in the new CSV format
export const SAMPLE_CSV_DATA = [
  {
    Mfg_Part_Num: 'DCB518ASTS06G',
    Part_Desc: 'DCB518ASTS06G Diablo 1/2"x18" - Sanding Belt 6pc',
    E1_Brand: '-- Unbranded --',
    Unilog_Brand: '-- No Unilog Brand --',
    DIB_Brand: '-- No DIB Brand --',
    Part_Manuf: 'Freud Inc (2435)'
  },
  {
    Mfg_Part_Num: 'PDSH4816AF',
    Part_Desc: 'PDSH4816AF Dishwasher SS - Display Only',
    E1_Brand: '-- Unbranded --',
    Unilog_Brand: '-- No Unilog Brand --',
    DIB_Brand: '-- No DIB Brand --',
    Part_Manuf: 'Rheem Manufacturing'
  },
  {
    Mfg_Part_Num: 'WDTS7024RZ',
    Part_Desc: 'WDTS7024RZ Dishwasher SS - Display Only',
    E1_Brand: '-- Unbranded --',
    Unilog_Brand: '-- No Unilog Brand --',
    DIB_Brand: '-- No DIB Brand --',
    Part_Manuf: 'Whirlpool Corporation'
  },
  {
    Mfg_Part_Num: 'DW872',
    Part_Desc: 'DW872 DeWalt 14" 66T Carbide Metal Cutting Blade',
    E1_Brand: 'DeWalt',
    Unilog_Brand: '-- No Unilog Brand --',
    DIB_Brand: '-- No DIB Brand --',
    Part_Manuf: 'DeWalt Industrial Tool Co (1234)'
  },
  {
    Mfg_Part_Num: '42328',
    Part_Desc: '42328 Bosch 1/2" Compact Drill Driver 18V Bare Tool',
    E1_Brand: 'Bosch',
    Unilog_Brand: 'Bosch Power Tools',
    DIB_Brand: '-- No DIB Brand --',
    Part_Manuf: 'Robert Bosch Tool Corp (5678)'
  }
];

// Empty value markers to filter out
const EMPTY_BRAND_MARKERS = [
  '-- Unbranded --',
  '-- No Unilog Brand --',
  '-- No DIB Brand --'
];

function isEmptyBrand(value) {
  return EMPTY_BRAND_MARKERS.includes(value?.trim());
}

function cleanManufacturerName(partManuf) {
  if (!partManuf) return '';
  // Strip code in parentheses: "Freud Inc (2435)" -> "Freud Inc"
  return partManuf.replace(/\s*\([^)]+\)\s*$/, '').trim();
}

function extractBrandFromDescription(partDesc, partManuf) {
  // Brands that are safe to match as substrings (longer, distinctive names)
  const safeBrands = [
    'DeWalt', 'Bosch', 'Makita', 'Milwaukee', 'Ryobi', 'Craftsman',
    'Diablo', 'Freud', 'Lenox', 'Irwin', 'Klein', 'Channellock',
    'Wera', 'Wiha', 'Knipex', 'Bahco', 'Snap-on', 'Matco',
    'FRIGIDAIRE', 'Whirlpool', 'Samsung', 'Maytag',
    'KitchenAid', 'Electrolux', 'Frigidaire',
    'TREX', 'TIMBERTECH', 'AZEK',
    'KICHLER', 'SATCO', 'PHILIPS',
    'SOUTHWIRE', 'LEVITON',
    'RIDGID', 'PORTER-CABLE', 'PORTER CABLE'
  ];
  
  // Short/ambiguous brands that need word-boundary matching to avoid false positives
  // e.g., "GE" matches "Vintage", "LG" matches "large", "flag"
  const ambiguousBrands = ['GE', 'LG'];
  
  const descLower = partDesc.toLowerCase();
  
  // Check safe brands first (substring match is fine)
  for (const brand of safeBrands) {
    if (descLower.includes(brand.toLowerCase())) {
      if (brand.toLowerCase() === 'frigidaire') return 'FRIGIDAIRE®';
      if (brand.toLowerCase() === 'whirlpool') return 'Whirlpool®';
      return brand;
    }
  }
  
  // Check ambiguous brands with word boundaries only
  for (const brand of ambiguousBrands) {
    const regex = new RegExp(`\\b${brand.toLowerCase()}\\b`);
    if (regex.test(descLower)) {
      return brand;
    }
  }
  
  // Fall back to manufacturer name (not a hardcoded brand)
  return cleanManufacturerName(partManuf);
}

function inferClasspath(partDesc) {
  const descLower = partDesc.toLowerCase();
  
  // 1. Building Materials > Decking & Railing
  // Keywords: decking, deck, railing, rail kit, baluster, fascia, post sleeve, post wrap
  // Brands: TREX, TIMBERTECH, AZEK
  if (descLower.includes('decking') || descLower.includes(' deck ') || 
      descLower.includes('railing') || descLower.includes('rail kit') ||
      descLower.includes('baluster') || descLower.includes('fascia') ||
      descLower.includes('post sleeve') || descLower.includes('post wrap') ||
      descLower.includes('trex') || descLower.includes('timbertech') || descLower.includes('azek')) {
    return 'Building Materials > Decking & Railing';
  }
  
  // 2. Building Materials > Siding & Trim
  // Keywords: siding, hardie, smartside, fascia, soffit, trim
  if (descLower.includes('siding') || descLower.includes('hardie') ||
      descLower.includes('smartside') || descLower.includes('soffit') ||
      (descLower.includes('trim') && !descLower.includes('trimmer'))) {
    return 'Building Materials > Siding & Trim';
  }
  
  // 3. Lighting > Fixtures
  // Keywords: wall lt, ceiling lt, pendant, chandelier, downlight
  // Brands: KICHLER, SATCO, PHILIPS (lighting context)
  if (descLower.includes('wall lt') || descLower.includes('ceiling lt') ||
      descLower.includes('pendant') || descLower.includes('chandelier') ||
      descLower.includes('downlight') || descLower.includes('light fixture') ||
      (descLower.includes('kichler') && (descLower.includes('light') || descLower.includes('fixture'))) ||
      (descLower.includes('satco') && (descLower.includes('light') || descLower.includes('bulb') || descLower.includes('lamp'))) ||
      (descLower.includes('philips') && (descLower.includes('light') || descLower.includes('led') || descLower.includes('bulb') || descLower.includes('hue')))) {
    return 'Lighting > Fixtures';
  }
  
  // 4. Power Tools
  // Keywords: drill, impact, grinder, saw, sander, nailer
  // Brands: DEWALT, MILWAUKEE, MAKITA (when combined with tool keywords)
  if (descLower.includes('drill') || descLower.includes('impact') ||
      descLower.includes('grinder') || descLower.includes('saw') ||
      descLower.includes('sander') || descLower.includes('nailer') ||
      descLower.includes('driver') || descLower.includes('router') ||
      descLower.includes('planer') || descLower.includes('jointer') ||
      ((descLower.includes('dewalt') || descLower.includes('milwaukee') || 
        descLower.includes('makita') || descLower.includes('bosch') ||
        descLower.includes('ryobi') || descLower.includes('craftsman') ||
        descLower.includes('ridgid') || descLower.includes('porter-cable') ||
        descLower.includes('porter cable')) &&
       (descLower.includes('tool') || descLower.includes('drill') || descLower.includes('saw') ||
        descLower.includes('driver') || descLower.includes('grinder') || descLower.includes('sander') ||
        descLower.includes('nailer') || descLower.includes('battery') || descLower.includes('bare tool') ||
        descLower.includes('18v') || descLower.includes('20v') || descLower.includes('12v')))) {
    return 'Power Tools';
  }
  
  // 5. Electrical > Wiring & Devices
  // Keywords: outlet, switch, wire, cable, GFCI, wallplate
  // Brands: SOUTHWIRE, LEVITON
  if (descLower.includes('outlet') || descLower.includes('switch') ||
      descLower.includes('wire') || descLower.includes('cable') ||
      descLower.includes('gfci') || descLower.includes('wallplate') ||
      descLower.includes('receptacle') || descLower.includes('breaker') ||
      descLower.includes('conduit') || descLower.includes('romex') ||
      descLower.includes('southwire') || descLower.includes('leviton')) {
    return 'Electrical > Wiring & Devices';
  }
  
  // Existing categories
  
  // Abrasives
  if (descLower.includes('sanding belt') || descLower.includes('sandpaper') || 
      descLower.includes('grinding wheel') || descLower.includes('flap disc') ||
      descLower.includes('abrasive')) {
    return 'Abrasives > Sanding Belts';
  }
  
  // Cutting tools
  if (descLower.includes('cutting blade') || descLower.includes('saw blade') ||
      descLower.includes('circular saw') || descLower.includes('carbide')) {
    return 'Cutting Tools > Saw Blades';
  }
  
  // Appliances - Dishwashers
  if (descLower.includes('dishwasher')) {
    return 'Appliances & Consumer Electronics>Kitchen Appliances>Built-In Dishwashers';
  }
  
  // Appliances - general
  if (descLower.includes('appliance') || descLower.includes('refrigerator') ||
      descLower.includes('oven') || descLower.includes('range') ||
      descLower.includes('microwave')) {
    return 'Appliances & Consumer Electronics>Kitchen Appliances';
  }
  
  return 'General > Unclassified';
}

function buildShortDesc(brand, partDesc, mfgPartNum) {
  // Extract key attributes from description
  let desc = partDesc.replace(mfgPartNum, '').trim();
  desc = desc.replace(/^[\s\-:]+/, '').trim();
  
  // Clean up common patterns
  desc = desc.replace(/\s*-\s*/g, ', ');
  desc = desc.replace(/\s+/g, ' ');
  
  return `${brand} ${mfgPartNum} ${desc}`.trim();
}

function buildInvoiceDesc(shortDesc) {
  // Convert to ALL CAPS, abbreviate, max 40 chars
  let invoice = shortDesc.toUpperCase();
  
  // Common abbreviations
  const abbreviations = {
    'PROFESSIONAL SERIES': 'PRO SER',
    'CLEANBOOST': 'CBST',
    'STAINLESS STEEL': 'SST',
    'DISHWASHER': 'DW',
    'BUILT-IN': 'BI',
    'MOUNTING': 'MNT',
    'WASH CYCLE': 'WC',
    'ECO SERIES': 'ECO',
    'CARBIDE': 'CARB',
    'CUTTING BLADE': 'CUT BL',
    'METAL': 'MET',
    'COMPACT': 'CMP',
    'BARE TOOL': 'BARE',
    'SANDING BELT': 'SAND BLT',
    'DIABLO': 'DIABLO'
  };
  
  for (const [full, abbr] of Object.entries(abbreviations)) {
    invoice = invoice.replace(new RegExp(full, 'g'), abbr);
  }
  
  // Remove special characters, keep alphanumeric and spaces
  invoice = invoice.replace(/[^A-Z0-9\s]/g, ' ');
  invoice = invoice.replace(/\s+/g, ' ').trim();
  
  // Truncate to 40 chars
  if (invoice.length > 40) {
    invoice = invoice.substring(0, 40).trim();
  }
  
  return invoice;
}

function extractAttributes(partDesc, mfgPartNum) {
  const attributes = [];
  const desc = partDesc.replace(mfgPartNum, '').trim();
  
  // Pattern: Size/Dimensions (e.g., 1/2"x18", 14", 1/2")
  const sizePatterns = [
    /(\d+(?:\/\d+)?\s*[x×]\s*\d+(?:\/\d+)?\s*["']?)/g,  // 1/2"x18"
    /(\d+(?:\/\d+)?\s*["'])/g,  // 14", 1/2"
    /(\d+(?:\.\d+)?\s*(?:mm|cm|in|inch))/gi  // 25mm, 2in
  ];
  
  for (const pattern of sizePatterns) {
    const matches = desc.match(pattern);
    if (matches) {
      attributes.push({
        label: 'Size',
        value: matches[0].replace(/"/g, ' in').replace(/'/g, ' ft').trim()
      });
      break;
    }
  }
  
  // Pattern: Pack quantity (e.g., 6pc, 10pk, 5-pack)
  const packPattern = /(\d+)\s*(?:pc|pack|pk|piece)s?/gi;
  const packMatch = desc.match(packPattern);
  if (packMatch) {
    attributes.push({
      label: 'Pack Qty',
      value: packMatch[0].replace(/[^\d]/g, '')
    });
  }
  
  // Pattern: Voltage (e.g., 18V, 120V)
  const voltPattern = /(\d+)\s*V\b/gi;
  const voltMatch = desc.match(voltPattern);
  if (voltMatch) {
    attributes.push({
      label: 'Voltage',
      value: voltMatch[0]
    });
  }
  
  // Pattern: Teeth count (e.g., 66T)
  const teethPattern = /(\d+)\s*T\b/gi;
  const teethMatch = desc.match(teethPattern);
  if (teethMatch) {
    attributes.push({
      label: 'Teeth',
      value: teethMatch[0]
    });
  }
  
  // Pattern: Material (e.g., Carbide, Stainless Steel, SST)
  if (desc.toLowerCase().includes('carbide')) {
    attributes.push({ label: 'Material', value: 'Carbide' });
  } else if (desc.toLowerCase().includes('stainless') || desc.toLowerCase().includes('sst')) {
    attributes.push({ label: 'Material', value: 'Stainless Steel' });
  }
  
  // Pattern: Mounting type
  if (desc.toLowerCase().includes('leg mounting') || desc.toLowerCase().includes('leg mount')) {
    attributes.push({ label: 'Mounting', value: 'Leg Mount' });
  } else if (desc.toLowerCase().includes('built-in') || desc.toLowerCase().includes('built in')) {
    attributes.push({ label: 'Mounting', value: 'Built-In' });
  }
  
  // Limit to 3 attributes
  return attributes.slice(0, 3);
}

function generateAiNotes(field, value, input, confidence) {
  const reasoningMap = {
    MANUFACTURER_NAME: `Extracted from Part_Manuf field "${input.Part_Manuf}", stripped manufacturer code in parentheses`,
    BRAND_NAME: isEmptyBrand(input.E1_Brand) && isEmptyBrand(input.Unilog_Brand) && isEmptyBrand(input.DIB_Brand)
      ? `No valid brand in E1/Unilog/DIB fields; derived from Part_Desc keywords or fell back to manufacturer name`
      : `Derived from available brand fields: E1="${input.E1_Brand}", Unilog="${input.Unilog_Brand}", DIB="${input.DIB_Brand}"`,
    CLASSPATH: `Inferred from Part_Desc keywords: "${input.Part_Desc}" -> matched category patterns`,
    SHORT_DESC: `Composed from Brand (${value.split(' ')[0]}) + Part_Num + key attributes from Part_Desc`,
    INVOICE_DESC: `Abbreviated SHORT_DESC to ALL CAPS, applied industry abbreviations, enforced 40-char limit${value.length > 40 ? ' (TRUNCATED)' : ''}`,
    ATTRIBUTES: `Extracted up to 3 attribute pairs from Part_Desc using regex patterns for size, pack qty, voltage, teeth, material, mounting`
  };
  
  return {
    field,
    reasoning: reasoningMap[field] || `Generated from input fields`,
    confidence
  };
}

function calculateFieldConfidence(field, value, input) {
  const baseConfidence = {
    MANUFACTURER_NAME: 95,
    BRAND_NAME: isEmptyBrand(input.E1_Brand) && isEmptyBrand(input.Unilog_Brand) && isEmptyBrand(input.DIB_Brand) ? 70 : 90,
    CLASSPATH: 75,
    SHORT_DESC: 80,
    INVOICE_DESC: value.length > 40 ? 60 : 85,
    ATTRIBUTES: 70
  };
  
  return baseConfidence[field] || 70;
}

export async function processProducts(rawInput) {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const products = Array.isArray(rawInput) ? rawInput : [rawInput];
  
  return products.map((item, index) => {
    const input = {
      Mfg_Part_Num: item.Mfg_Part_Num || '',
      Part_Desc: item.Part_Desc || '',
      E1_Brand: item.E1_Brand || '',
      Unilog_Brand: item.Unilog_Brand || '',
      DIB_Brand: item.DIB_Brand || '',
      Part_Manuf: item.Part_Manuf || ''
    };
    
    // Filter out empty brand markers
    const e1Brand = isEmptyBrand(input.E1_Brand) ? '' : input.E1_Brand;
    const unilogBrand = isEmptyBrand(input.Unilog_Brand) ? '' : input.Unilog_Brand;
    const dibBrand = isEmptyBrand(input.DIB_Brand) ? '' : input.DIB_Brand;
    
    // Determine brand
    let brand = '';
    if (e1Brand) brand = e1Brand;
    else if (unilogBrand) brand = unilogBrand;
    else if (dibBrand) brand = dibBrand;
    else brand = extractBrandFromDescription(input.Part_Desc, input.Part_Manuf);
    
    // Special case for known brands with registered trademarks
    if (brand.toLowerCase() === 'frigidaire') brand = 'FRIGIDAIRE®';
    if (brand.toLowerCase() === 'whirlpool') brand = 'Whirlpool®';
    
    const manufacturer = cleanManufacturerName(input.Part_Manuf);
    const classpath = inferClasspath(input.Part_Desc);
    const shortDesc = buildShortDesc(brand, input.Part_Desc, input.Mfg_Part_Num);
    const invoiceDesc = buildInvoiceDesc(shortDesc);
    const attributes = extractAttributes(input.Part_Desc, input.Mfg_Part_Num);
    
    // Build AI notes with confidence
    const aiNotes = [
      generateAiNotes('MANUFACTURER_NAME', manufacturer, input, calculateFieldConfidence('MANUFACTURER_NAME', manufacturer, input)),
      generateAiNotes('BRAND_NAME', brand, input, calculateFieldConfidence('BRAND_NAME', brand, input)),
      generateAiNotes('CLASSPATH', classpath, input, calculateFieldConfidence('CLASSPATH', classpath, input)),
      generateAiNotes('SHORT_DESC', shortDesc, input, calculateFieldConfidence('SHORT_DESC', shortDesc, input)),
      generateAiNotes('INVOICE_DESC', invoiceDesc, input, calculateFieldConfidence('INVOICE_DESC', invoiceDesc, input)),
      generateAiNotes('ATTRIBUTES', JSON.stringify(attributes), input, calculateFieldConfidence('ATTRIBUTES', '', input))
    ];
    
    const confidenceScores = aiNotes.map(n => n.confidence);
    const overallConfidence = Math.round(confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length);
    
    return {
      Mfg_Part_Num: input.Mfg_Part_Num,
      Part_Desc: input.Part_Desc,
      MANUFACTURER_NAME: manufacturer,
      BRAND_NAME: brand,
      CLASSPATH: classpath,
      SHORT_DESC: shortDesc,
      INVOICE_DESC: invoiceDesc,
      INVOICE_DESC_WARNING: invoiceDesc.length > 40 ? 'Exceeds 40-char limit' : null,
      ATTRIBUTES: attributes,
      confidence_score: overallConfidence,
      ai_notes: aiNotes,
      _rawInput: item
    };
  });
}

export function validateAgainstGroundTruth(generated, expected) {
  const fields = ['MANUFACTURER_NAME', 'BRAND_NAME', 'CLASSPATH', 'INVOICE_DESC', 'SHORT_DESC'];
  
  return fields.map(field => {
    const genVal = (generated[field] || '').toLowerCase().trim();
    const expVal = (expected[field] || '').toLowerCase().trim();
    
    let status = 'miss';
    if (genVal === expVal) status = 'match';
    else if (genVal.includes(expVal) || expVal.includes(genVal) || 
             similarity(genVal, expVal) > 0.7) status = 'partial';
    
    return { field, generated: generated[field], expected: expected[field], status };
  });
}

function similarity(a, b) {
  if (!a || !b) return 0;
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  const longerLength = longer.length;
  if (longerLength === 0) return 1.0;
  const editDistance = levenshteinDistance(longer, shorter);
  return (longerLength - editDistance) / longerLength;
}

function levenshteinDistance(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}
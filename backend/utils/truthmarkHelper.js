const { nanoid } = require('nanoid');

// Map craft types to 3-letter prefixes for TruthMark codes
const craftCodes = {
  kolam:     'KLM',
  pashmina:  'PSH',
  madhubani: 'MDH',
  pottery:   'PTR',
  weaving:   'WVG',
  woodwork:  'WDW',
  metalwork: 'MTL',
  embroidery:'EMB',
  block_print:'BPR',
  lacquer:   'LCQ',
  bamboo:    'BMB',
  stone:     'STN',
  leather:   'LTH',
  silk:      'SLK',
  carpet:    'CPT'
};

/**
 * Generate a unique TruthMark code
 * Format: TM-{CRAFT_PREFIX}-{4_CHAR_ID}
 * Example: TM-KLM-A3K9
 */
const generateTruthMarkCode = (craftType) => {
  const prefix = craftCodes[craftType?.toLowerCase()] || 'ART';
  const id = nanoid(4).toUpperCase();
  return `TM-${prefix}-${id}`;
};

module.exports = { generateTruthMarkCode, craftCodes };

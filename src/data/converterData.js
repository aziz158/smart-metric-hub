// ─── All conversion categories ───────────────────────────────────────────────
// For linear categories, each unit has a `factor` = value in base unit.
// Convert: result = inputValue * fromFactor / toFactor
// Temperature is non-linear and handled separately.

export const CATEGORIES = [
  {
    id: 'length',
    label: 'Length',
    defaultFrom: 'km',
    defaultTo: 'mi',
    units: [
      { id: 'mm',  label: 'Millimeter',    symbol: 'mm',  factor: 0.001 },
      { id: 'cm',  label: 'Centimeter',    symbol: 'cm',  factor: 0.01 },
      { id: 'm',   label: 'Meter',         symbol: 'm',   factor: 1 },
      { id: 'km',  label: 'Kilometer',     symbol: 'km',  factor: 1000 },
      { id: 'in',  label: 'Inch',          symbol: 'in',  factor: 0.0254 },
      { id: 'ft',  label: 'Foot',          symbol: 'ft',  factor: 0.3048 },
      { id: 'yd',  label: 'Yard',          symbol: 'yd',  factor: 0.9144 },
      { id: 'mi',  label: 'Mile',          symbol: 'mi',  factor: 1609.344 },
      { id: 'nmi', label: 'Nautical Mile', symbol: 'nmi', factor: 1852 },
    ],
  },
  {
    id: 'weight',
    label: 'Weight',
    defaultFrom: 'kg',
    defaultTo: 'lb',
    units: [
      { id: 'mg', label: 'Milligram',   symbol: 'mg', factor: 1e-6 },
      { id: 'g',  label: 'Gram',        symbol: 'g',  factor: 0.001 },
      { id: 'kg', label: 'Kilogram',    symbol: 'kg', factor: 1 },
      { id: 't',  label: 'Metric Ton',  symbol: 't',  factor: 1000 },
      { id: 'oz', label: 'Ounce',       symbol: 'oz', factor: 0.0283495 },
      { id: 'lb', label: 'Pound',       symbol: 'lb', factor: 0.453592 },
      { id: 'st', label: 'Stone',       symbol: 'st', factor: 6.35029 },
    ],
  },
  {
    id: 'speed',
    label: 'Speed',
    defaultFrom: 'kmh',
    defaultTo: 'mph',
    units: [
      { id: 'ms',  label: 'Meter/second',    symbol: 'm/s',  factor: 1 },
      { id: 'kmh', label: 'Kilometer/hour',  symbol: 'km/h', factor: 1 / 3.6 },
      { id: 'mph', label: 'Mile/hour',       symbol: 'mph',  factor: 0.44704 },
      { id: 'kn',  label: 'Knot',            symbol: 'kn',   factor: 0.514444 },
      { id: 'fts', label: 'Foot/second',     symbol: 'ft/s', factor: 0.3048 },
    ],
  },
  {
    id: 'temperature',
    label: 'Temperature',
    special: true,
    defaultFrom: 'c',
    defaultTo: 'f',
    units: [
      { id: 'c', label: 'Celsius',    symbol: '°C' },
      { id: 'f', label: 'Fahrenheit', symbol: '°F' },
      { id: 'k', label: 'Kelvin',     symbol: 'K'  },
    ],
  },
  {
    id: 'time',
    label: 'Time',
    defaultFrom: 'h',
    defaultTo: 'min',
    units: [
      { id: 'ns',  label: 'Nanosecond',  symbol: 'ns',  factor: 1e-9 },
      { id: 'ms',  label: 'Millisecond', symbol: 'ms',  factor: 0.001 },
      { id: 's',   label: 'Second',      symbol: 's',   factor: 1 },
      { id: 'min', label: 'Minute',      symbol: 'min', factor: 60 },
      { id: 'h',   label: 'Hour',        symbol: 'h',   factor: 3600 },
      { id: 'd',   label: 'Day',         symbol: 'd',   factor: 86400 },
      { id: 'wk',  label: 'Week',        symbol: 'wk',  factor: 604800 },
      { id: 'mo',  label: 'Month',       symbol: 'mo',  factor: 2592000 },
      { id: 'yr',  label: 'Year',        symbol: 'yr',  factor: 31536000 },
    ],
  },
  {
    id: 'area',
    label: 'Area',
    defaultFrom: 'm2',
    defaultTo: 'ft2',
    units: [
      { id: 'mm2', label: 'Sq. Millimeter', symbol: 'mm²', factor: 1e-6 },
      { id: 'cm2', label: 'Sq. Centimeter', symbol: 'cm²', factor: 1e-4 },
      { id: 'm2',  label: 'Sq. Meter',      symbol: 'm²',  factor: 1 },
      { id: 'km2', label: 'Sq. Kilometer',  symbol: 'km²', factor: 1e6 },
      { id: 'ha',  label: 'Hectare',        symbol: 'ha',  factor: 10000 },
      { id: 'ac',  label: 'Acre',           symbol: 'ac',  factor: 4046.86 },
      { id: 'ft2', label: 'Sq. Foot',       symbol: 'ft²', factor: 0.092903 },
      { id: 'yd2', label: 'Sq. Yard',       symbol: 'yd²', factor: 0.836127 },
      { id: 'mi2', label: 'Sq. Mile',       symbol: 'mi²', factor: 2589988.11 },
    ],
  },
  {
    id: 'power',
    label: 'Power',
    defaultFrom: 'kw',
    defaultTo: 'hp',
    units: [
      { id: 'w',   label: 'Watt',      symbol: 'W',     factor: 1 },
      { id: 'kw',  label: 'Kilowatt',  symbol: 'kW',    factor: 1000 },
      { id: 'mw',  label: 'Megawatt',  symbol: 'MW',    factor: 1e6 },
      { id: 'hp',  label: 'Horsepower',symbol: 'hp',    factor: 745.7 },
      { id: 'btu', label: 'BTU/hour',  symbol: 'BTU/h', factor: 0.293071 },
    ],
  },
  {
    id: 'volume',
    label: 'Volume',
    defaultFrom: 'l',
    defaultTo: 'gal',
    units: [
      { id: 'ml',   label: 'Milliliter',    symbol: 'mL',    factor: 0.001 },
      { id: 'l',    label: 'Liter',         symbol: 'L',     factor: 1 },
      { id: 'm3',   label: 'Cubic Meter',   symbol: 'm³',    factor: 1000 },
      { id: 'gal',  label: 'Gallon (US)',   symbol: 'gal',   factor: 3.78541 },
      { id: 'qt',   label: 'Quart (US)',    symbol: 'qt',    factor: 0.946353 },
      { id: 'pt',   label: 'Pint (US)',     symbol: 'pt',    factor: 0.473176 },
      { id: 'cup',  label: 'Cup (US)',      symbol: 'cup',   factor: 0.236588 },
      { id: 'floz', label: 'Fl. Ounce',    symbol: 'fl oz', factor: 0.0295735 },
      { id: 'in3',  label: 'Cubic Inch',   symbol: 'in³',   factor: 0.0163871 },
      { id: 'ft3',  label: 'Cubic Foot',   symbol: 'ft³',   factor: 28.3168 },
    ],
  },
  {
    id: 'pressure',
    label: 'Pressure',
    defaultFrom: 'bar',
    defaultTo: 'psi',
    units: [
      { id: 'pa',   label: 'Pascal',      symbol: 'Pa',   factor: 1 },
      { id: 'kpa',  label: 'Kilopascal',  symbol: 'kPa',  factor: 1000 },
      { id: 'mpa',  label: 'Megapascal',  symbol: 'MPa',  factor: 1e6 },
      { id: 'bar',  label: 'Bar',         symbol: 'bar',  factor: 100000 },
      { id: 'atm',  label: 'Atmosphere',  symbol: 'atm',  factor: 101325 },
      { id: 'psi',  label: 'PSI',         symbol: 'psi',  factor: 6894.76 },
      { id: 'mmhg', label: 'mmHg',        symbol: 'mmHg', factor: 133.322 },
    ],
  },
]

// ─── Conversion logic ─────────────────────────────────────────────────────────

function convertTemperature(value, from, to) {
  if (from === to) return value
  let celsius
  if (from === 'c')      celsius = value
  else if (from === 'f') celsius = (value - 32) * 5 / 9
  else                   celsius = value - 273.15
  if (to === 'c') return celsius
  if (to === 'f') return celsius * 9 / 5 + 32
  return celsius + 273.15
}

export function convertValue(value, fromId, toId, category) {
  if (fromId === toId) return value
  if (category.special) return convertTemperature(value, fromId, toId)
  const from = category.units.find((u) => u.id === fromId)
  const to   = category.units.find((u) => u.id === toId)
  if (!from || !to || to.factor === 0) return null
  return value * from.factor / to.factor
}

// ─── Number formatting ────────────────────────────────────────────────────────

export function formatValue(num) {
  if (num === null || num === undefined || isNaN(num) || !isFinite(num)) return '—'
  if (num === 0) return '0'
  const abs = Math.abs(num)
  if (abs >= 1e12 || (abs < 1e-6 && abs > 0)) return num.toExponential(4)
  if (abs >= 1e6)  return num.toLocaleString('en-US', { maximumFractionDigits: 2 })
  if (abs >= 1000) return parseFloat(num.toPrecision(8)).toLocaleString('en-US', { maximumFractionDigits: 4 })
  if (abs >= 1)    return parseFloat(num.toPrecision(8)).toString()
  return parseFloat(num.toPrecision(6)).toString()
}

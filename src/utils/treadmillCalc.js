// ─── Unit conversions ─────────────────────────────────────────────────────────
export const mphToKmh  = (v) => v * 1.60934
export const kmhToMph  = (v) => v / 1.60934
export const milesToKm = (v) => v * 1.60934
export const kmToMiles = (v) => v / 1.60934
export const lbsToKg   = (v) => v * 0.453592
export const kgToLbs   = (v) => v / 0.453592

// ─── Duration helpers ──────────────────────────────────────────────────────────
export function toSeconds(h, m, s) {
  return (Number(h) || 0) * 3600 + (Number(m) || 0) * 60 + (Number(s) || 0)
}

export function secToHms(totalSec) {
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = Math.round(totalSec % 60)
  return { h, m, s }
}

export function fmtDuration(totalSec) {
  if (!totalSec || totalSec <= 0) return '—'
  const { h, m, s } = secToHms(Math.round(totalSec))
  const parts = []
  if (h) parts.push(`${h}h`)
  if (m || h) parts.push(`${m}m`)
  parts.push(`${s}s`)
  return parts.join(' ')
}

// ─── Pace ─────────────────────────────────────────────────────────────────────
// Returns "M:SS" string given seconds-per-unit-distance
export function fmtPace(secPerUnit) {
  if (!secPerUnit || !isFinite(secPerUnit) || secPerUnit <= 0) return '—'
  const m = Math.floor(secPerUnit / 60)
  const s = Math.round(secPerUnit % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

// ─── Calorie calculation (MET-based with incline adjustment) ──────────────────
function getMET(speedMph) {
  const pts = [
    [0, 2.5], [2, 2.8], [3, 3.5], [3.5, 4.3], [4, 5.0], [4.5, 6.3],
    [5, 8.3], [5.5, 9.0], [6, 9.8], [6.5, 10.5], [7, 11.0], [7.5, 11.5],
    [8, 11.8], [8.5, 12.3], [9, 12.8], [10, 14.5], [12, 16.0], [14, 19.0],
  ]
  if (speedMph <= pts[0][0])   return pts[0][1]
  if (speedMph >= pts.at(-1)[0]) return pts.at(-1)[1]
  for (let i = 0; i < pts.length - 1; i++) {
    if (speedMph >= pts[i][0] && speedMph <= pts[i + 1][0]) {
      const t = (speedMph - pts[i][0]) / (pts[i + 1][0] - pts[i][0])
      return pts[i][1] + t * (pts[i + 1][1] - pts[i][1])
    }
  }
  return 8
}

export function calcCalories(weightKg, speedMph, durationSec, inclinePct = 0) {
  if (!weightKg || !speedMph || !durationSec) return null
  const met = getMET(speedMph) + inclinePct * speedMph * 0.09
  return Math.round(met * weightKg * (durationSec / 3600))
}

// ─── Activity type ────────────────────────────────────────────────────────────
export function getActivity(speedMph) {
  if (!speedMph || speedMph <= 0) return null
  if (speedMph < 3.5)  return { label: 'Walking',    cls: 'bg-sky-100 text-sky-700 border-sky-200' }
  if (speedMph < 5.0)  return { label: 'Power Walk', cls: 'bg-indigo-100 text-indigo-700 border-indigo-200' }
  if (speedMph < 7.0)  return { label: 'Jogging',    cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' }
  if (speedMph < 9.0)  return { label: 'Running',    cls: 'bg-orange-100 text-orange-700 border-orange-200' }
  return                        { label: 'Sprinting',  cls: 'bg-red-100 text-red-700 border-red-200' }
}

// ─── Intensity (0–100) for display bar ───────────────────────────────────────
export function getIntensity(speedMph, inclinePct = 0) {
  const base = Math.min((speedMph / 14) * 80, 80)
  const inc  = Math.min(inclinePct * 1.5, 20)
  return Math.round(base + inc)
}

// ─── Workout presets ──────────────────────────────────────────────────────────
export const PRESETS = [
  { label: 'Easy Walk',    speedMph: 3.0,  incline: 0 },
  { label: 'Brisk Walk',  speedMph: 3.8,  incline: 3 },
  { label: 'Light Jog',   speedMph: 5.0,  incline: 0 },
  { label: 'Moderate Run', speedMph: 6.5, incline: 1 },
  { label: 'Fast Run',    speedMph: 8.5,  incline: 1 },
  { label: 'Sprint',      speedMph: 11.0, incline: 0 },
]

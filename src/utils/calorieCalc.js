// Calories = MET × weight(kg) × duration(hours)
export function calcCaloriesBurned(met, weightKg, durationHours) {
  if (!met || !weightKg || !durationHours) return null
  return Math.round(met * weightKg * durationHours)
}

export function durationToHours(hours, minutes) {
  return (Number(hours) || 0) + (Number(minutes) || 0) / 60
}

export function formatDurationLabel(hours, minutes) {
  const h = Number(hours) || 0
  const m = Number(minutes) || 0
  const parts = []
  if (h) parts.push(`${h}h`)
  if (m) parts.push(`${m}m`)
  return parts.length ? parts.join(' ') : null
}

// Calories per km or per mile from total calories + distance
export function caloriesPerDistanceUnit(totalCals, distance) {
  if (!totalCals || !distance || distance <= 0) return null
  return Math.round(totalCals / distance)
}

// Intensity-to-MET: pull the right MET from an activity's met object
export function getMET(activity, intensity) {
  return activity?.met?.[intensity] ?? null
}

// Human-friendly intensity label + colour
export const INTENSITIES = [
  { id: 'light',    label: 'Light',    desc: 'Easy effort',        color: 'emerald' },
  { id: 'moderate', label: 'Moderate', desc: 'Conversational pace', color: 'blue' },
  { id: 'intense',  label: 'Intense',  desc: 'Hard effort',         color: 'red' },
]

export const INTENSITY_COLORS = {
  light:    { btn: 'border-emerald-400 bg-emerald-50 text-emerald-700',    badge: 'bg-emerald-100 text-emerald-700' },
  moderate: { btn: 'border-blue-400 bg-blue-50 text-blue-700',             badge: 'bg-blue-100 text-blue-700' },
  intense:  { btn: 'border-red-400 bg-red-50 text-red-700',                badge: 'bg-red-100 text-red-700' },
}

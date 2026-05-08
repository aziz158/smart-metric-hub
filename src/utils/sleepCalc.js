export const CYCLE_MINUTES  = 90   // one sleep cycle
export const FALL_ASLEEP    = 15   // average time to fall asleep (buffer)
export const CYCLE_OPTIONS  = [4, 5, 6]  // recommended cycle counts

// ─── Quality per cycle count ──────────────────────────────────────────────────
export const CYCLE_QUALITY = {
  4: { label: 'Minimum', sub: '6h of sleep',     color: 'amber'   },
  5: { label: 'Good',    sub: '7h 30m of sleep', color: 'blue'    },
  6: { label: 'Optimal', sub: '9h of sleep',     color: 'emerald' },
}

// ─── Colour classes per quality ───────────────────────────────────────────────
export const QUALITY_COLORS = {
  amber:   { card: 'bg-amber-50 border-amber-200',   badge: 'bg-amber-100 text-amber-700',   time: 'text-amber-700' },
  blue:    { card: 'bg-blue-50 border-blue-200',     badge: 'bg-blue-100 text-blue-700',     time: 'text-blue-700' },
  emerald: { card: 'bg-emerald-50 border-emerald-200', badge: 'bg-emerald-100 text-emerald-700', time: 'text-emerald-700' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** "HH:MM" string from <input type="time"> → total minutes from midnight */
export function timeToMinutes(str) {
  if (!str) return null
  const [h, m] = str.split(':').map(Number)
  return h * 60 + m
}

/** Minutes from midnight → "HH:MM" string (for setting <input type="time">) */
export function minutesToTimeInput(min) {
  const h = Math.floor(((min % 1440) + 1440) % 1440 / 60)
  const m = ((min % 1440) + 1440) % 1440 % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** Format minutes from midnight as display string */
export function formatTime(min, fmt = '12h') {
  const total = ((min % 1440) + 1440) % 1440
  const h     = Math.floor(total / 60)
  const m     = total % 60
  const mm    = String(m).padStart(2, '0')
  if (fmt === '24h') return `${String(h).padStart(2, '0')}:${mm}`
  const period = h >= 12 ? 'PM' : 'AM'
  const hour   = h % 12 || 12
  return `${hour}:${mm} ${period}`
}

/** Format total minutes as "Xh Ym" */
export function formatDuration(min) {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

/** Current time as "HH:MM" */
export function nowString() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// ─── Core calculations ────────────────────────────────────────────────────────

/**
 * Given a desired wake-up time (minutes), return recommended bedtimes.
 * bedtime = wakeUp - buffer - cycles*90
 */
export function calcBedtimes(wakeUpMinutes) {
  return CYCLE_OPTIONS.map((cycles) => {
    const sleepMins = cycles * CYCLE_MINUTES
    const bedtime   = wakeUpMinutes - FALL_ASLEEP - sleepMins
    return { cycles, time: bedtime, duration: sleepMins }
  })
}

/**
 * Given a bedtime (minutes), return recommended wake-up times.
 * wakeUp = bedtime + buffer + cycles*90
 */
export function calcWakeUpTimes(bedtimeMinutes) {
  return CYCLE_OPTIONS.map((cycles) => {
    const sleepMins = cycles * CYCLE_MINUTES
    const wakeUp    = bedtimeMinutes + FALL_ASLEEP + sleepMins
    return { cycles, time: wakeUp, duration: sleepMins }
  })
}

/**
 * Given start and wake times, return total duration and completed cycles.
 */
export function calcDuration(startMinutes, wakeMinutes) {
  const duration   = ((wakeMinutes - startMinutes) + 1440) % 1440
  const cycles     = Math.floor(duration / CYCLE_MINUTES)
  const remainder  = duration % CYCLE_MINUTES
  return { duration, cycles, remainder }
}

// Sleep tip content
export const SLEEP_TIPS = [
  { icon: '🌙', title: 'Stick to a schedule',   body: 'Go to bed and wake up at the same time every day, even on weekends.' },
  { icon: '📵', title: 'Limit screen time',      body: 'Avoid phones and screens at least 30 minutes before bed to reduce blue-light exposure.' },
  { icon: '🌡️', title: 'Cool your room',         body: 'Keep your bedroom between 60–67°F (15–19°C) for optimal sleep quality.' },
  { icon: '☕', title: 'Watch caffeine intake',  body: 'Avoid caffeine after 2 PM as it can linger in your system for 5–6 hours.' },
]

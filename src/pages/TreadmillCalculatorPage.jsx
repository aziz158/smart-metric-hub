import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiArrowLeft, HiLightningBolt,
} from 'react-icons/hi'
import {
  TbRun, TbFlame, TbRulerMeasure, TbClock,
  TbArrowsRightLeft, TbWalk, TbMeterSquare,
} from 'react-icons/tb'
import {
  mphToKmh, kmhToMph, milesToKm, kmToMiles, lbsToKg, kgToLbs,
  toSeconds, fmtDuration, fmtPace, secToHms,
  calcCalories, getActivity, getIntensity, PRESETS,
} from '../utils/treadmillCalc'
import PageTransition from '../components/PageTransition'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pos(val) {
  if (val === '' || val === null) return null
  const n = parseFloat(val)
  return !isNaN(n) && n > 0 ? n : undefined
}

function posOrZero(val) {
  if (val === '' || val === null) return null
  const n = parseFloat(val)
  return !isNaN(n) && n >= 0 ? n : undefined
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function Field({ label, name, value, onChange, unit, placeholder, error }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-semibold text-gray-700">{label}</label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type="number"
          min="0"
          step="any"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`input-field pr-14 ${error ? 'input-field-error' : ''}`}
        />
        {unit && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400 pointer-events-none">
            {unit}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  )
}

function DurInput({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <div className="flex items-center gap-2">
        {[
          { key: 'h', placeholder: '0', unit: 'h', max: 23 },
          { key: 'm', placeholder: '00', unit: 'm', max: 59 },
          { key: 's', placeholder: '00', unit: 's', max: 59 },
        ].map(({ key, placeholder, unit, max }) => (
          <div key={key} className="relative flex-1">
            <input
              type="number"
              min="0"
              max={max}
              step="1"
              value={value[key]}
              onChange={(e) => onChange({ ...value, [key]: e.target.value })}
              placeholder={placeholder}
              className="input-field pr-7 text-center"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400 pointer-events-none">
              {unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Metric({ icon: Icon, label, primary, secondary, iconColor = 'text-blue-500' }) {
  return (
    <div className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-2 border border-gray-100">
      <div className="flex items-center gap-2">
        <Icon className={`text-lg ${iconColor}`} />
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-extrabold text-gray-900 leading-tight">
        {primary ?? <span className="text-gray-300">—</span>}
      </p>
      {secondary && <p className="text-xs text-gray-400 font-medium">{secondary}</p>}
    </div>
  )
}

function UnitToggle({ value, onChange }) {
  return (
    <div className="flex rounded-xl border border-gray-200 overflow-hidden w-fit">
      {['imperial', 'metric'].map((u) => (
        <button
          key={u}
          onClick={() => onChange(u)}
          className={`px-5 py-2 text-sm font-semibold capitalize transition-colors ${
            value === u ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
          }`}
        >
          {u}
        </button>
      ))}
    </div>
  )
}

function TabBtn({ id, label, active, onClick }) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`px-4 py-2.5 text-sm font-semibold rounded-xl whitespace-nowrap transition-all duration-150 ${
        active
          ? 'bg-blue-600 text-white shadow-sm'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
      }`}
    >
      {label}
    </button>
  )
}

// ─── Tab 1: Workout Summary ───────────────────────────────────────────────────

function WorkoutTab() {
  const [unit, setUnit]     = useState('imperial')
  const [weight, setWeight] = useState('')
  const [speed, setSpeed]   = useState('')
  const [incline, setIncline] = useState(0)
  const [dur, setDur]       = useState({ h: '', m: '', s: '' })

  const isMetric = unit === 'metric'

  function applyPreset(p) {
    setSpeed(isMetric ? mphToKmh(p.speedMph).toFixed(1) : String(p.speedMph))
    setIncline(p.incline)
  }

  const computed = useMemo(() => {
    const speedVal  = pos(speed)
    const weightVal = pos(weight)
    const durSec    = toSeconds(dur.h, dur.m, dur.s)

    if (!speedVal)  return null

    const speedMph  = isMetric ? kmhToMph(speedVal) : speedVal
    const weightKg  = weightVal ? (isMetric ? weightVal : lbsToKg(weightVal)) : null
    const distMiles = durSec > 0 ? speedMph * (durSec / 3600) : null
    const distKm    = distMiles != null ? milesToKm(distMiles) : null
    const paceSecPerMile = distMiles && durSec ? durSec / distMiles : null
    const paceSecPerKm   = distKm   && durSec ? durSec / distKm   : null
    const cals = weightKg && durSec > 0
      ? calcCalories(weightKg, speedMph, durSec, incline)
      : null
    const activity  = getActivity(speedMph)
    const intensity = getIntensity(speedMph, incline)

    return {
      speedMph,
      speedKmh: mphToKmh(speedMph),
      distMiles,
      distKm,
      paceSecPerMile,
      paceSecPerKm,
      cals,
      activity,
      intensity,
      durSec,
    }
  }, [speed, weight, dur, incline, isMetric])

  const distPrimary = computed
    ? isMetric
      ? computed.distKm != null ? `${computed.distKm.toFixed(2)} km` : null
      : computed.distMiles != null ? `${computed.distMiles.toFixed(2)} mi` : null
    : null

  const distSecondary = computed
    ? isMetric
      ? computed.distMiles != null ? `${computed.distMiles.toFixed(2)} mi` : null
      : computed.distKm != null ? `${computed.distKm.toFixed(2)} km` : null
    : null

  const pacePrimary = computed
    ? isMetric
      ? fmtPace(computed.paceSecPerKm) !== '—' ? `${fmtPace(computed.paceSecPerKm)} /km` : null
      : fmtPace(computed.paceSecPerMile) !== '—' ? `${fmtPace(computed.paceSecPerMile)} /mi` : null
    : null

  const paceSecondary = computed
    ? isMetric
      ? fmtPace(computed.paceSecPerMile) !== '—' ? `${fmtPace(computed.paceSecPerMile)} /mi` : null
      : fmtPace(computed.paceSecPerKm) !== '—' ? `${fmtPace(computed.paceSecPerKm)} /km` : null
    : null

  const speedPrimary = computed
    ? isMetric
      ? `${computed.speedKmh.toFixed(1)} km/h`
      : `${computed.speedMph.toFixed(1)} mph`
    : null

  const speedSecondary = computed
    ? isMetric
      ? `${computed.speedMph.toFixed(1)} mph`
      : `${computed.speedKmh.toFixed(1)} km/h`
    : null

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
          Quick Presets
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              className="shrink-0 px-3.5 py-2 text-xs font-semibold rounded-xl border border-gray-200
                         bg-white text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50
                         transition-all duration-150"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Unit toggle */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-gray-700">Units</span>
        <UnitToggle value={unit} onChange={setUnit} />
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field
          label="Your Weight"
          name="weight"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          unit={isMetric ? 'kg' : 'lbs'}
          placeholder={isMetric ? 'e.g. 70' : 'e.g. 154'}
        />
        <Field
          label="Speed"
          name="speed"
          value={speed}
          onChange={(e) => setSpeed(e.target.value)}
          unit={isMetric ? 'km/h' : 'mph'}
          placeholder={isMetric ? 'e.g. 9.7' : 'e.g. 6.0'}
        />
      </div>

      {/* Incline */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-700">Incline</label>
          <span className="text-sm font-bold text-blue-600 tabular-nums">{incline}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="15"
          step="0.5"
          value={incline}
          onChange={(e) => setIncline(Number(e.target.value))}
          className="treadmill-range"
        />
        <div className="flex justify-between text-xs text-gray-400 font-medium">
          <span>0% Flat</span>
          <span>5% Moderate</span>
          <span>15% Steep</span>
        </div>
      </div>

      <DurInput label="Duration" value={dur} onChange={setDur} />

      {/* Results */}
      <AnimatePresence>
      {computed && (
        <motion.div
          key="workout-results"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-4 pt-2 border-t border-gray-100"
        >
          {/* Activity badge + intensity */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            {computed.activity && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold border ${computed.activity.cls}`}>
                <TbRun className="text-base" />
                {computed.activity.label}
              </span>
            )}
            <div className="flex items-center gap-2 flex-1 min-w-[160px]">
              <span className="text-xs text-gray-400 font-medium shrink-0">Intensity</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${computed.intensity}%`,
                    background: `linear-gradient(90deg, #34d399 0%, #fbbf24 60%, #f87171 100%)`,
                  }}
                />
              </div>
              <span className="text-xs font-bold text-gray-600 tabular-nums shrink-0">{computed.intensity}%</span>
            </div>
          </div>

          {/* Metrics grid */}
          <div className="grid grid-cols-2 gap-3">
            <Metric
              icon={TbRulerMeasure}
              label="Distance"
              primary={distPrimary}
              secondary={distSecondary}
              iconColor="text-blue-500"
            />
            <Metric
              icon={TbRun}
              label="Pace"
              primary={pacePrimary}
              secondary={paceSecondary}
              iconColor="text-indigo-500"
            />
            <Metric
              icon={TbArrowsRightLeft}
              label="Speed"
              primary={speedPrimary}
              secondary={speedSecondary}
              iconColor="text-emerald-500"
            />
            <Metric
              icon={TbFlame}
              label="Calories"
              primary={computed.cals != null ? `${computed.cals} kcal` : null}
              secondary={computed.cals ? 'Estimated burn' : 'Enter weight for calories'}
              iconColor="text-orange-500"
            />
          </div>

          {!computed.durSec && (
            <p className="text-xs text-gray-400 text-center">
              Enter a duration to see distance, pace, and calorie results.
            </p>
          )}
        </motion.div>
      )}
      </AnimatePresence>

      {!computed && (
        <div className="py-8 text-center text-gray-400 text-sm">
          Enter your speed to see live results.
        </div>
      )}
    </div>
  )
}

// ─── Tab 2: Pace & Speed ──────────────────────────────────────────────────────

function PaceTab() {
  const [unit, setUnit]         = useState('imperial')
  const [distance, setDistance] = useState('')
  const [dur, setDur]           = useState({ h: '', m: '', s: '' })
  const [distErr, setDistErr]   = useState(null)

  const isMetric = unit === 'metric'

  const computed = useMemo(() => {
    const distVal = pos(distance)
    const durSec  = toSeconds(dur.h, dur.m, dur.s)
    if (!distVal || !durSec) return null

    const distMiles = isMetric ? distVal / 1.60934 : distVal
    const distKm    = milesToKm(distMiles)
    const speedMph  = distMiles / (durSec / 3600)
    const paceSecPerMile = durSec / distMiles
    const paceSecPerKm   = durSec / distKm

    return { speedMph, speedKmh: mphToKmh(speedMph), paceSecPerMile, paceSecPerKm }
  }, [distance, dur, isMetric])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-gray-700">Distance unit</span>
        <div className="flex rounded-xl border border-gray-200 overflow-hidden w-fit">
          {[['imperial', 'Miles'], ['metric', 'Kilometers']].map(([u, lbl]) => (
            <button key={u} onClick={() => setUnit(u)}
              className={`px-4 py-2 text-sm font-semibold transition-colors ${
                unit === u ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              {lbl}
            </button>
          ))}
        </div>
      </div>

      <Field
        label={`Distance (${isMetric ? 'km' : 'miles'})`}
        name="distance"
        value={distance}
        onChange={(e) => { setDistance(e.target.value); setDistErr(null) }}
        unit={isMetric ? 'km' : 'mi'}
        placeholder={isMetric ? 'e.g. 5.0' : 'e.g. 3.1'}
        error={distErr}
      />
      <DurInput label="Time to Complete" value={dur} onChange={setDur} />

      {computed ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }} className="space-y-3 pt-2 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-3">
            <Metric icon={TbRun}            label="Pace / Mile"  primary={`${fmtPace(computed.paceSecPerMile)} /mi`} secondary={`${fmtPace(computed.paceSecPerKm)} /km`} iconColor="text-indigo-500" />
            <Metric icon={TbArrowsRightLeft} label="Avg Speed"   primary={`${computed.speedMph.toFixed(2)} mph`}    secondary={`${computed.speedKmh.toFixed(2)} km/h`}   iconColor="text-emerald-500" />
          </div>
        </motion.div>
      ) : (
        <div className="py-8 text-center text-gray-400 text-sm">Enter distance and time to calculate pace.</div>
      )}
    </div>
  )
}

// ─── Tab 3: Distance ──────────────────────────────────────────────────────────

function DistanceTab() {
  const [unit, setUnit]   = useState('imperial')
  const [speed, setSpeed] = useState('')
  const [dur, setDur]     = useState({ h: '', m: '', s: '' })

  const isMetric = unit === 'metric'

  const computed = useMemo(() => {
    const speedVal = pos(speed)
    const durSec   = toSeconds(dur.h, dur.m, dur.s)
    if (!speedVal || !durSec) return null

    const speedMph  = isMetric ? kmhToMph(speedVal) : speedVal
    const distMiles = speedMph * (durSec / 3600)
    return { distMiles, distKm: milesToKm(distMiles) }
  }, [speed, dur, isMetric])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-gray-700">Speed unit</span>
        <UnitToggle value={unit} onChange={setUnit} />
      </div>

      <Field
        label={`Speed (${isMetric ? 'km/h' : 'mph'})`}
        name="speed"
        value={speed}
        onChange={(e) => setSpeed(e.target.value)}
        unit={isMetric ? 'km/h' : 'mph'}
        placeholder={isMetric ? 'e.g. 9.7' : 'e.g. 6.0'}
      />
      <DurInput label="Duration" value={dur} onChange={setDur} />

      {computed ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }} className="space-y-3 pt-2 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-3">
            <Metric icon={TbRulerMeasure} label="Miles"      primary={`${computed.distMiles.toFixed(2)} mi`} iconColor="text-blue-500" />
            <Metric icon={TbRulerMeasure} label="Kilometers" primary={`${computed.distKm.toFixed(2)} km`}   iconColor="text-indigo-500" />
          </div>
        </motion.div>
      ) : (
        <div className="py-8 text-center text-gray-400 text-sm">Enter speed and duration to calculate distance.</div>
      )}
    </div>
  )
}

// ─── Tab 4: Duration ──────────────────────────────────────────────────────────

function DurationTab() {
  const [unit, setUnit]         = useState('imperial')
  const [speed, setSpeed]       = useState('')
  const [distance, setDistance] = useState('')

  const isMetric = unit === 'metric'

  const computed = useMemo(() => {
    const speedVal = pos(speed)
    const distVal  = pos(distance)
    if (!speedVal || !distVal) return null

    const speedMph  = isMetric ? kmhToMph(speedVal) : speedVal
    const distMiles = isMetric ? distVal / 1.60934 : distVal
    const durSec    = (distMiles / speedMph) * 3600
    if (!isFinite(durSec)) return null
    return { durSec }
  }, [speed, distance, isMetric])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-gray-700">Units</span>
        <UnitToggle value={unit} onChange={setUnit} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field
          label={`Speed (${isMetric ? 'km/h' : 'mph'})`}
          name="speed"
          value={speed}
          onChange={(e) => setSpeed(e.target.value)}
          unit={isMetric ? 'km/h' : 'mph'}
          placeholder={isMetric ? 'e.g. 9.7' : 'e.g. 6.0'}
        />
        <Field
          label={`Distance (${isMetric ? 'km' : 'miles'})`}
          name="distance"
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
          unit={isMetric ? 'km' : 'mi'}
          placeholder={isMetric ? 'e.g. 5.0' : 'e.g. 3.1'}
        />
      </div>

      {computed ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }} className="pt-2 border-t border-gray-100">
          <Metric icon={TbClock} label="Time Needed" primary={fmtDuration(computed.durSec)} secondary="to complete the distance" iconColor="text-blue-500" />
        </motion.div>
      ) : (
        <div className="py-8 text-center text-gray-400 text-sm">Enter speed and distance to estimate your duration.</div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'workout',  label: 'Workout Summary', icon: TbRun },
  { id: 'pace',     label: 'Pace & Speed',    icon: TbWalk },
  { id: 'distance', label: 'Distance',        icon: TbRulerMeasure },
  { id: 'duration', label: 'Duration',        icon: TbClock },
]

export default function TreadmillCalculatorPage() {
  const [activeTab, setActiveTab] = useState('workout')

  return (
    <PageTransition>
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-8 group"
      >
        <HiArrowLeft className="group-hover:-translate-x-0.5 transition-transform" />
        Back to Home
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <TbRun className="text-2xl text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Treadmill Calculator</h1>
        </div>
        <p className="text-gray-500">
          Calculate pace, speed, distance, duration, and calories burned from your treadmill workout.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-6 no-scrollbar">
        {TABS.map(({ id, label }) => (
          <TabBtn key={id} id={id} label={label} active={activeTab === id} onClick={setActiveTab} />
        ))}
      </div>

      {/* Tab content */}
      <div className="card overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {activeTab === 'workout'  && <WorkoutTab />}
            {activeTab === 'pace'     && <PaceTab />}
            {activeTab === 'distance' && <DistanceTab />}
            {activeTab === 'duration' && <DurationTab />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Info footer */}
      <p className="mt-6 text-xs text-gray-400 text-center leading-relaxed">
        Calorie estimates are based on MET values adjusted for speed and incline. Results are approximations
        and may vary based on individual fitness level and treadmill calibration.
      </p>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .treadmill-range {
          -webkit-appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 9999px;
          background: linear-gradient(90deg, #3b82f6 0%, #6366f1 100%);
          outline: none;
          cursor: pointer;
        }
        .treadmill-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
          transition: transform 0.15s ease;
        }
        .treadmill-range::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }
        .treadmill-range::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
    </PageTransition>
  )
}

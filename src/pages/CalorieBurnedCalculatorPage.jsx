import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { HiArrowLeft, HiSearch, HiX } from 'react-icons/hi'
import { TbFlame, TbClock, TbScale, TbRulerMeasure, TbActivity } from 'react-icons/tb'
import { ACTIVITIES, CATEGORIES, COLOR_CLASSES } from '../data/activities'
import {
  calcCaloriesBurned, durationToHours, formatDurationLabel,
  caloriesPerDistanceUnit, getMET,
  INTENSITIES, INTENSITY_COLORS,
} from '../utils/calorieCalc'
import { lbsToKg, milesToKm, kmToMiles } from '../utils/treadmillCalc'

// ─── Shared UI ────────────────────────────────────────────────────────────────

function Field({ label, name, value, onChange, unit, placeholder, error }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-semibold text-gray-700">{label}</label>
      <div className="relative">
        <input
          id={name} name={name} type="number" min="0" step="any"
          value={value} onChange={onChange} placeholder={placeholder}
          className={`input-field ${unit ? 'pr-14' : ''} ${error ? 'input-field-error' : ''}`}
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

function SmallToggle({ options, value, onChange }) {
  return (
    <div className="flex rounded-lg border border-gray-200 overflow-hidden w-fit">
      {options.map(([val, lbl]) => (
        <button key={val} type="button" onClick={() => onChange(val)}
          className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
            value === val ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
          }`}
        >
          {lbl}
        </button>
      ))}
    </div>
  )
}

// ─── Activity grid card ───────────────────────────────────────────────────────

function ActivityCard({ activity, selected, onClick }) {
  const c   = COLOR_CLASSES[activity.color] ?? COLOR_CLASSES.blue
  const Icon = activity.icon
  return (
    <button
      type="button"
      onClick={() => onClick(activity)}
      className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-150 text-center
        ${selected
          ? `${c.active} ring-2 ${c.ring} shadow-sm`
          : `border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm`
        }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.bg}`}>
        <Icon className={`text-xl ${c.icon}`} />
      </div>
      <span className={`text-xs font-semibold leading-tight ${selected ? '' : 'text-gray-700'}`}>
        {activity.label}
      </span>
    </button>
  )
}

// ─── Result stat card ─────────────────────────────────────────────────────────

function Stat({ icon: Icon, label, value, sub, iconColor = 'text-blue-500' }) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <Icon className={`text-base ${iconColor}`} />
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</span>
      </div>
      <p className="text-xl font-extrabold text-gray-900">{value ?? <span className="text-gray-300">—</span>}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CalorieBurnedCalculatorPage() {
  const [search, setSearch]             = useState('')
  const [category, setCategory]         = useState('All')
  const [activity, setActivity]         = useState(null)
  const [weightUnit, setWeightUnit]     = useState('imperial')
  const [weight, setWeight]             = useState('')
  const [durH, setDurH]                 = useState('')
  const [durM, setDurM]                 = useState('')
  const [intensity, setIntensity]       = useState('moderate')
  const [distUnit, setDistUnit]         = useState('miles')
  const [distance, setDistance]         = useState('')
  const [weightErr, setWeightErr]       = useState(null)
  const [durErr, setDurErr]             = useState(null)

  // ─── Filtered activities ───────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return ACTIVITIES.filter((a) => {
      const matchCat = category === 'All' || a.category === category
      const matchQ   = !q || a.label.toLowerCase().includes(q) || a.category.toLowerCase().includes(q)
      return matchCat && matchQ
    })
  }, [search, category])

  // ─── Live calculation ──────────────────────────────────────────────────────
  const computed = useMemo(() => {
    if (!activity) return null
    const met      = getMET(activity, intensity)
    const wKg      = weightUnit === 'metric' ? Number(weight) : Number(weight) * 0.453592
    const durHrs   = durationToHours(durH, durM)
    const dLabel   = formatDurationLabel(durH, durM)

    if (!weight || !wKg || wKg <= 0 || !durHrs || durHrs <= 0) return { met, partial: true }

    const calories = calcCaloriesBurned(met, wKg, durHrs)
    const perMin   = durHrs > 0 ? Math.round(calories / (durHrs * 60)) : null

    let calPerDist = null
    if (activity.needsDistance && distance && Number(distance) > 0) {
      const distVal = distUnit === 'miles' ? Number(distance) : kmToMiles(Number(distance))
      calPerDist = {
        perMile: caloriesPerDistanceUnit(calories, distVal),
        perKm:   caloriesPerDistanceUnit(calories, milesToKm(distVal)),
      }
    }

    return { calories, perMin, met, wKg, dLabel, calPerDist }
  }, [activity, weight, weightUnit, durH, durM, intensity, distance, distUnit])

  function handleActivitySelect(a) {
    setActivity(a)
    setDistance('')
  }

  const ic = activity ? (INTENSITY_COLORS[intensity] ?? INTENSITY_COLORS.moderate) : null
  const activityColor = activity ? (COLOR_CLASSES[activity.color] ?? COLOR_CLASSES.blue) : null
  const ActivityIcon  = activity?.icon

  const hasResult = computed && !computed.partial && computed.calories != null

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-8 group">
        <HiArrowLeft className="group-hover:-translate-x-0.5 transition-transform" />
        Back to Home
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <TbFlame className="text-2xl text-orange-500" />
          <h1 className="text-3xl font-bold text-gray-900">Calorie Burned Calculator</h1>
        </div>
        <p className="text-gray-500">
          Estimate calories burned during 17 activities using MET-based calculations.
        </p>
      </div>

      {/* ── Activity selector ─────────────────────────────────────────────── */}
      <div className="card space-y-4 mb-5">
        <h2 className="text-base font-semibold text-gray-800">1. Choose an Activity</h2>

        {/* Search */}
        <div className="relative">
          <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activities..."
            className="input-field pl-10 pr-10"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <HiX />
            </button>
          )}
        </div>

        {/* Category tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((c) => (
            <button key={c} type="button" onClick={() => setCategory(c)}
              className={`shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-150 ${
                category === c
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Activity grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
            {filtered.map((a) => (
              <ActivityCard key={a.id} activity={a} selected={activity?.id === a.id} onClick={handleActivitySelect} />
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-gray-400 py-6">No activities match &ldquo;{search}&rdquo;.</p>
        )}

        {activity && (
          <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium ${activityColor.active}`}>
            <ActivityIcon className={`text-base ${activityColor.icon}`} />
            <span>{activity.label} selected</span>
          </div>
        )}
      </div>

      {/* ── Calculator inputs ─────────────────────────────────────────────── */}
      <div className="card space-y-6 mb-5">
        <h2 className="text-base font-semibold text-gray-800">2. Enter Your Details</h2>

        {/* Weight */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-700">Body Weight</label>
            <SmallToggle options={[['imperial','lbs'],['metric','kg']]} value={weightUnit} onChange={setWeightUnit} />
          </div>
          <div className="relative">
            <input
              type="number" min="0" step="any"
              value={weight}
              onChange={(e) => { setWeight(e.target.value); setWeightErr(null) }}
              placeholder={weightUnit === 'metric' ? 'e.g. 70' : 'e.g. 154'}
              className={`input-field pr-14 ${weightErr ? 'input-field-error' : ''}`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400 pointer-events-none">
              {weightUnit === 'metric' ? 'kg' : 'lbs'}
            </span>
          </div>
          {weightErr && <p className="text-xs text-red-500 font-medium">{weightErr}</p>}
        </div>

        {/* Duration */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">Duration</label>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <input type="number" min="0" max="23" value={durH}
                onChange={(e) => { setDurH(e.target.value); setDurErr(null) }}
                placeholder="0"
                className={`input-field pr-10 text-center ${durErr ? 'input-field-error' : ''}`} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400 pointer-events-none">h</span>
            </div>
            <div className="relative">
              <input type="number" min="0" max="59" value={durM}
                onChange={(e) => { setDurM(e.target.value); setDurErr(null) }}
                placeholder="30"
                className={`input-field pr-10 text-center ${durErr ? 'input-field-error' : ''}`} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400 pointer-events-none">m</span>
            </div>
          </div>
          {durErr && <p className="text-xs text-red-500 font-medium">{durErr}</p>}
        </div>

        {/* Intensity */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Intensity</label>
          <div className="grid grid-cols-3 gap-2.5">
            {INTENSITIES.map((lvl) => (
              <button key={lvl.id} type="button" onClick={() => setIntensity(lvl.id)}
                className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 transition-all duration-150 ${
                  intensity === lvl.id
                    ? INTENSITY_COLORS[lvl.id].btn
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                <span className="text-sm font-bold">{lvl.label}</span>
                <span className="text-[11px] text-gray-400 leading-tight">{lvl.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Optional distance */}
        {activity?.needsDistance && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700">
                Distance <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <SmallToggle options={[['miles','mi'],['km','km']]} value={distUnit} onChange={setDistUnit} />
            </div>
            <div className="relative">
              <input
                type="number" min="0" step="any"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                placeholder={distUnit === 'miles' ? 'e.g. 3.1' : 'e.g. 5.0'}
                className="input-field pr-14"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400 pointer-events-none">
                {distUnit}
              </span>
            </div>
            <p className="text-xs text-gray-400">Add distance to see calories per {distUnit === 'miles' ? 'mile & km' : 'km & mile'}.</p>
          </div>
        )}
      </div>

      {/* ── Live results ──────────────────────────────────────────────────── */}
      {!activity && (
        <div className="card text-center py-10 text-gray-400">
          <TbActivity className="text-4xl mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-medium">Select an activity above to see your results.</p>
        </div>
      )}

      {activity && !hasResult && (
        <div className="card text-center py-8 text-gray-400 text-sm">
          Enter your weight and duration to calculate calories burned.
        </div>
      )}

      {hasResult && (
        <div className="card space-y-5" style={{ animation: 'fadeSlideUp 0.3s ease-out' }}>
          {/* Hero */}
          <div className={`rounded-2xl p-5 border ${activityColor.active}`}>
            <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Estimated Calories Burned</p>
                <p className={`text-5xl font-extrabold ${activityColor.icon}`}>
                  {computed.calories.toLocaleString()}
                  <span className="text-xl font-bold ml-1 text-gray-600">kcal</span>
                </p>
              </div>
              <div className="flex flex-col gap-1.5 items-end">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${activityColor.active}`}>
                  {ActivityIcon && <ActivityIcon className={`text-sm ${activityColor.icon}`} />}
                  {activity.label}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${INTENSITY_COLORS[intensity].badge}`}>
                  {INTENSITIES.find(i => i.id === intensity)?.label} intensity
                </span>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <Stat icon={TbClock}    label="Duration"    value={computed.dLabel}                         iconColor="text-blue-500" />
            <Stat icon={TbFlame}    label="Per Minute"  value={computed.perMin ? `${computed.perMin} kcal` : null} sub="calories / min" iconColor="text-orange-500" />
            <Stat icon={TbScale}    label="Body Weight" value={`${computed.wKg.toFixed(1)} kg`}         sub={`${(computed.wKg / 0.453592).toFixed(1)} lbs`} iconColor="text-indigo-500" />
            <Stat icon={TbActivity} label="MET Value"   value={computed.met?.toFixed(1)}                sub="metabolic equivalent" iconColor="text-emerald-500" />
          </div>

          {/* Calories per distance */}
          {computed.calPerDist && (
            <div className="grid grid-cols-2 gap-3">
              <Stat icon={TbRulerMeasure} label="Per Mile" value={`${computed.calPerDist.perMile} kcal`} iconColor="text-purple-500" />
              <Stat icon={TbRulerMeasure} label="Per km"   value={`${computed.calPerDist.perKm} kcal`}   iconColor="text-pink-500" />
            </div>
          )}

          {/* MET explanation */}
          <p className="text-xs text-gray-400 leading-relaxed bg-gray-50 rounded-xl p-3 border border-gray-100">
            Calculated using: MET ({computed.met?.toFixed(1)}) × {computed.wKg.toFixed(1)} kg × {computed.dLabel}.
            MET values sourced from the Compendium of Physical Activities. Individual results vary by fitness level and effort.
          </p>
        </div>
      )}

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}

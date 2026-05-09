import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiArrowLeft, HiCheck, HiChevronDown, HiChevronUp,
} from 'react-icons/hi'
import {
  TbFlame, TbMeat, TbBread, TbDroplet, TbScale,
  TbTrendingDown, TbTrendingUp, TbCalculator, TbInfoCircle,
} from 'react-icons/tb'
import { GiWaterDrop } from 'react-icons/gi'
import {
  calcBMR, calcTDEE, calcMacros, calcWater,
  ACTIVITY_LEVELS, GOALS, MACRO_PRESETS,
} from '../utils/mealCalc'
import { lbsToKg, kmToMiles } from '../utils/treadmillCalc'
import PageTransition from '../components/PageTransition'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function feetInchesToCm(ft, inch) {
  return (Number(ft) * 30.48) + (Number(inch) * 2.54)
}

function validate(form) {
  const errs = {}
  const age = Number(form.age)
  if (!form.age)           errs.age = 'Age is required.'
  else if (age < 13)       errs.age = 'Minimum age is 13.'
  else if (age > 100)      errs.age = 'Maximum age is 100.'

  if (form.unit === 'metric') {
    if (!form.heightCm)           errs.height = 'Height is required.'
    else if (Number(form.heightCm) <= 0) errs.height = 'Height must be positive.'
    if (!form.weightKg)           errs.weight = 'Weight is required.'
    else if (Number(form.weightKg) <= 0) errs.weight = 'Weight must be positive.'
  } else {
    if (!form.heightFt && !form.heightIn) errs.height = 'Height is required.'
    if (!form.weightLbs)          errs.weight = 'Weight is required.'
    else if (Number(form.weightLbs) <= 0) errs.weight = 'Weight must be positive.'
  }
  return errs
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function Field({ label, name, value, onChange, unit, placeholder, error, type = 'number', min, max }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-semibold text-gray-700">{label}</label>
      <div className="relative">
        <input
          id={name} name={name} type={type} min={min} max={max} step="any"
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

function UnitToggle({ value, onChange }) {
  return (
    <div className="flex rounded-xl border border-gray-200 overflow-hidden w-fit">
      {['imperial', 'metric'].map((u) => (
        <button key={u} type="button" onClick={() => onChange(u)}
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

// ─── Macro distribution bar ───────────────────────────────────────────────────

function MacroBar({ protein, carbs, fat }) {
  const total = protein + carbs + fat
  const pct = (v) => ((v / total) * 100).toFixed(1)
  return (
    <div className="space-y-2">
      <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
        <div style={{ width: `${pct(protein)}%` }} className="bg-violet-500 transition-all duration-500" />
        <div style={{ width: `${pct(carbs)}%`   }} className="bg-blue-500   transition-all duration-500" />
        <div style={{ width: `${pct(fat)}%`     }} className="bg-amber-400  transition-all duration-500" />
      </div>
      <div className="flex gap-4 text-xs font-medium text-gray-500">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-violet-500 inline-block" />Protein {pct(protein)}%</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500   inline-block" />Carbs {pct(carbs)}%</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400  inline-block" />Fat {pct(fat)}%</span>
      </div>
    </div>
  )
}

// ─── Macro card ───────────────────────────────────────────────────────────────

function MacroCard({ icon: Icon, label, grams, kcal, color }) {
  const colors = {
    violet: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100', icon: 'text-violet-500' },
    blue:   { bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-100',   icon: 'text-blue-500' },
    amber:  { bg: 'bg-amber-50',  text: 'text-amber-600',  border: 'border-amber-100',  icon: 'text-amber-500' },
    cyan:   { bg: 'bg-cyan-50',   text: 'text-cyan-600',   border: 'border-cyan-100',   icon: 'text-cyan-500' },
  }
  const c = colors[color]
  return (
    <div className={`rounded-2xl border p-4 ${c.bg} ${c.border}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`text-lg ${c.icon}`} />
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
      </div>
      <p className={`text-2xl font-extrabold ${c.text}`}>{grams}<span className="text-base font-bold">g</span></p>
      {kcal && <p className="text-xs text-gray-400 mt-0.5">{kcal} kcal</p>}
    </div>
  )
}

// ─── Results section ──────────────────────────────────────────────────────────

function ResultSection({ result, onRecalculate }) {
  const { bmr, tdee, goal, calories, macros, water, activity } = result
  const [showCustom, setShowCustom]         = useState(false)
  const [macroPreset, setMacroPreset]       = useState('goal')
  const [customProtein, setCustomProtein]   = useState(Math.round(goal.protein * 100))
  const [customCarbs, setCustomCarbs]       = useState(Math.round(goal.carbs * 100))

  const customFat = 100 - customProtein - customCarbs
  const fatWarning = customFat < 15 || customFat > 55

  const activeMacros = useMemo(() => {
    if (macroPreset === 'goal') return macros
    if (macroPreset === 'custom') {
      return calcMacros(calories, customProtein / 100, customCarbs / 100, customFat / 100)
    }
    const preset = MACRO_PRESETS.find((p) => p.id === macroPreset)
    return preset ? calcMacros(calories, preset.protein, preset.carbs, preset.fat) : macros
  }, [macroPreset, customProtein, customCarbs, customFat, calories, macros, goal])

  const goalColorMap = {
    rose:    { bg: 'bg-rose-50',    text: 'text-rose-600',    border: 'border-rose-200',    badge: 'bg-rose-100 text-rose-700' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700' },
    blue:    { bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-200',    badge: 'bg-blue-100 text-blue-700' },
  }
  const gc = goalColorMap[goal.color]

  const GoalIcon = goal.id === 'lose' ? TbTrendingDown : goal.id === 'gain' ? TbTrendingUp : TbScale

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.25, 0.1, 0.25, 1] }}
      className="space-y-5 mt-6"
    >
      {/* Hero calorie card */}
      <div className={`rounded-2xl border p-6 ${gc.bg} ${gc.border}`}>
        <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Daily Calorie Target</p>
            <p className={`text-5xl font-extrabold ${gc.text}`}>
              {calories.toLocaleString()}
              <span className="text-xl font-bold ml-1">kcal</span>
            </p>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold border ${gc.badge}`}>
            <GoalIcon className="text-base" />
            {goal.label}
          </span>
        </div>

        {/* BMR → TDEE → Target flow */}
        <div className="flex items-center gap-2 flex-wrap text-sm">
          <div className="bg-white/70 rounded-xl px-3 py-2 text-center">
            <p className="text-xs text-gray-400 font-medium">BMR</p>
            <p className="font-bold text-gray-700">{bmr.toLocaleString()}</p>
          </div>
          <span className="text-gray-300 font-bold text-lg">→</span>
          <div className="bg-white/70 rounded-xl px-3 py-2 text-center">
            <p className="text-xs text-gray-400 font-medium">TDEE</p>
            <p className="font-bold text-gray-700">{tdee.toLocaleString()}</p>
          </div>
          <span className="text-gray-300 font-bold text-lg">→</span>
          <div className={`rounded-xl px-3 py-2 text-center border ${gc.border} bg-white/80`}>
            <p className="text-xs text-gray-400 font-medium">
              {goal.adjust > 0 ? `+${goal.adjust}` : goal.adjust === 0 ? '±0' : goal.adjust} kcal
            </p>
            <p className={`font-bold ${gc.text}`}>{calories.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Macro cards */}
      <div>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h3 className="text-base font-semibold text-gray-800">Daily Macronutrients</h3>
          <button
            type="button"
            onClick={() => setShowCustom((v) => !v)}
            className="flex items-center gap-1.5 text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors"
          >
            Adjust ratios
            {showCustom ? <HiChevronUp /> : <HiChevronDown />}
          </button>
        </div>

        {/* Macro preset buttons */}
        {showCustom && (
          <div className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-100 space-y-4">
            <div className="flex gap-2 flex-wrap">
              {MACRO_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setMacroPreset(p.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    macroPreset === p.id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {macroPreset === 'custom' && (
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                    <span>Protein</span><span className="text-violet-600">{customProtein}%</span>
                  </div>
                  <input type="range" min="15" max="55" step="5" value={customProtein}
                    onChange={(e) => setCustomProtein(Number(e.target.value))}
                    className="treadmill-range" />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                    <span>Carbohydrates</span><span className="text-blue-600">{customCarbs}%</span>
                  </div>
                  <input type="range" min="15" max="65" step="5" value={customCarbs}
                    onChange={(e) => setCustomCarbs(Number(e.target.value))}
                    className="treadmill-range" />
                </div>
                <div className="flex justify-between text-xs font-semibold text-gray-600">
                  <span>Fat (auto)</span>
                  <span className={fatWarning ? 'text-red-500' : 'text-amber-600'}>{customFat}%</span>
                </div>
                {fatWarning && (
                  <p className="text-xs text-red-500">Fat should be between 15–55% for a balanced diet.</p>
                )}
              </div>
            )}
          </div>
        )}

        <MacroBar
          protein={activeMacros.protein * 4}
          carbs={activeMacros.carbs * 4}
          fat={activeMacros.fat * 9}
        />

        <div className="grid grid-cols-3 gap-3 mt-3">
          <MacroCard icon={TbMeat}  label="Protein"   grams={activeMacros.protein} kcal={activeMacros.protein * 4}  color="violet" />
          <MacroCard icon={TbBread} label="Carbs"     grams={activeMacros.carbs}   kcal={activeMacros.carbs * 4}    color="blue" />
          <MacroCard icon={TbFlame} label="Fat"       grams={activeMacros.fat}     kcal={activeMacros.fat * 9}      color="amber" />
        </div>
      </div>

      {/* Water + activity summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center shrink-0">
            <GiWaterDrop className="text-2xl text-cyan-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Daily Water</p>
            <p className="text-xl font-extrabold text-gray-900">
              {water >= 1000 ? `${(water / 1000).toFixed(1)} L` : `${water} ml`}
            </p>
            <p className="text-xs text-gray-400">≈ {Math.round(water / 237)} cups</p>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
            <TbCalculator className="text-2xl text-gray-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Activity Level</p>
            <p className="text-base font-bold text-gray-900">{activity.label}</p>
            <p className="text-xs text-gray-400">×{activity.multiplier} multiplier</p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex gap-2 p-4 rounded-xl bg-gray-50 border border-gray-100">
        <TbInfoCircle className="text-gray-400 shrink-0 mt-0.5 text-lg" />
        <p className="text-xs text-gray-500 leading-relaxed">
          These are estimates based on the Mifflin-St Jeor equation. Individual needs vary. Consult a registered
          dietitian for a personalised nutrition plan.
        </p>
      </div>

      <button type="button" onClick={onRecalculate}
        className="btn-secondary w-full">
        Adjust Inputs &amp; Recalculate
      </button>

      <style>{`
        .treadmill-range {
          -webkit-appearance: none; width: 100%; height: 6px;
          border-radius: 9999px;
          background: linear-gradient(90deg, #3b82f6 0%, #6366f1 100%);
          outline: none; cursor: pointer;
        }
        .treadmill-range::-webkit-slider-thumb {
          -webkit-appearance: none; width: 18px; height: 18px;
          border-radius: 50%; background: #2563eb; cursor: pointer;
          border: 3px solid white; box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        }
        .treadmill-range::-moz-range-thumb {
          width: 18px; height: 18px; border-radius: 50%; background: #2563eb;
          cursor: pointer; border: 3px solid white;
        }
      `}</style>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const GOAL_ICONS = { lose: TbTrendingDown, maintain: TbScale, gain: TbTrendingUp }
const GOAL_COLORS = {
  lose:    { idle: 'border-gray-200 bg-white hover:border-rose-300 hover:bg-rose-50',    active: 'border-rose-400 bg-rose-50 ring-2 ring-rose-200',    icon: 'bg-rose-100 text-rose-600',    label: 'text-rose-700' },
  maintain:{ idle: 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50', active: 'border-emerald-400 bg-emerald-50 ring-2 ring-emerald-200', icon: 'bg-emerald-100 text-emerald-600', label: 'text-emerald-700' },
  gain:    { idle: 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50',    active: 'border-blue-400 bg-blue-50 ring-2 ring-blue-200',    icon: 'bg-blue-100 text-blue-600',    label: 'text-blue-700' },
}

export default function MealIntakeCalculatorPage() {
  const [unit, setUnit] = useState('imperial')

  const [form, setForm] = useState({
    age: '', gender: 'male',
    heightCm: '', heightFt: '', heightIn: '',
    weightKg: '', weightLbs: '',
    activity: 'moderate', goal: 'maintain',
  })
  const [errors, setErrors]   = useState({})
  const [result, setResult]   = useState(null)
  const [showForm, setShowForm] = useState(true)

  function set(field) {
    return (e) => {
      setForm((f) => ({ ...f, [field]: e.target.value }))
      setErrors((err) => ({ ...err, [field.replace(/[A-Z]/g, '_$&').toLowerCase()]: null }))
    }
  }

  function handleCalculate(e) {
    e.preventDefault()
    const merged = { ...form, unit }
    const errs   = validate(merged)
    if (Object.keys(errs).length) { setErrors(errs); return }

    const weightKg = unit === 'metric'
      ? Number(form.weightKg)
      : Number(form.weightLbs) * 0.453592

    const heightCm = unit === 'metric'
      ? Number(form.heightCm)
      : feetInchesToCm(form.heightFt || 0, form.heightIn || 0)

    const bmr      = calcBMR(weightKg, heightCm, Number(form.age), form.gender)
    const activity = ACTIVITY_LEVELS.find((a) => a.id === form.activity)
    const goal     = GOALS.find((g) => g.id === form.goal)
    const tdee     = calcBMR ? Math.round(bmr * activity.multiplier) : 0
    const calories = tdee + goal.adjust
    const macros   = calcMacros(calories, goal.protein, goal.carbs, goal.fat)
    const water    = calcWater(weightKg)

    setResult({ bmr, tdee, goal, calories, macros, water, activity })
    setShowForm(false)
    setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  const isMetric = unit === 'metric'

  return (
    <PageTransition>
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-8 group">
        <HiArrowLeft className="group-hover:-translate-x-0.5 transition-transform" />
        Back to Home
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <TbFlame className="text-2xl text-orange-500" />
          <h1 className="text-3xl font-bold text-gray-900">Meal Intake Calculator</h1>
        </div>
        <p className="text-gray-500">
          Get your personalised daily calorie target and macronutrient breakdown based on your body and goals.
        </p>
      </div>

      {/* Form */}
      {showForm ? (
        <form onSubmit={handleCalculate} noValidate className="card space-y-7">
          {/* Unit toggle */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-700">Units</span>
            <UnitToggle value={unit} onChange={(u) => { setUnit(u); setErrors({}) }} />
          </div>

          {/* Age + Gender */}
          <div className="grid grid-cols-2 gap-5">
            <Field
              label="Age" name="age" value={form.age} onChange={set('age')}
              unit="yrs" placeholder="28" min={13} max={100} error={errors.age}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Gender</label>
              <div className="flex rounded-xl border border-gray-200 overflow-hidden h-[50px]">
                {[['male', 'Male'], ['female', 'Female']].map(([v, lbl]) => (
                  <button key={v} type="button" onClick={() => setForm((f) => ({ ...f, gender: v }))}
                    className={`flex-1 text-sm font-semibold transition-colors ${
                      form.gender === v ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Height */}
          {isMetric ? (
            <Field label="Height" name="heightCm" value={form.heightCm} onChange={set('heightCm')}
              unit="cm" placeholder="e.g. 175" error={errors.height} />
          ) : (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Height</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <input type="number" min="0" placeholder="ft" value={form.heightFt}
                    onChange={set('heightFt')}
                    className={`input-field pr-10 ${errors.height ? 'input-field-error' : ''}`} />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">ft</span>
                </div>
                <div className="relative">
                  <input type="number" min="0" max="11" placeholder="in" value={form.heightIn}
                    onChange={set('heightIn')}
                    className={`input-field pr-10 ${errors.height ? 'input-field-error' : ''}`} />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">in</span>
                </div>
              </div>
              {errors.height && <p className="text-xs text-red-500 font-medium">{errors.height}</p>}
            </div>
          )}

          {/* Weight */}
          {isMetric ? (
            <Field label="Weight" name="weightKg" value={form.weightKg} onChange={set('weightKg')}
              unit="kg" placeholder="e.g. 70" error={errors.weight} />
          ) : (
            <Field label="Weight" name="weightLbs" value={form.weightLbs} onChange={set('weightLbs')}
              unit="lbs" placeholder="e.g. 154" error={errors.weight} />
          )}

          {/* Activity level */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2.5">Activity Level</label>
            <div className="space-y-2">
              {ACTIVITY_LEVELS.map((a) => {
                const active = form.activity === a.id
                return (
                  <button key={a.id} type="button" onClick={() => setForm((f) => ({ ...f, activity: a.id }))}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all duration-150 ${
                      active
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      active ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}>
                      {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm font-semibold block ${active ? 'text-blue-700' : 'text-gray-700'}`}>{a.label}</span>
                      <span className="text-xs text-gray-400">{a.desc}</span>
                    </div>
                    {active && <HiCheck className="text-blue-500 shrink-0" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Fitness goal */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2.5">Fitness Goal</label>
            <div className="grid grid-cols-3 gap-3">
              {GOALS.map((g) => {
                const Icon = GOAL_ICONS[g.id]
                const c    = GOAL_COLORS[g.id]
                const active = form.goal === g.id
                return (
                  <button key={g.id} type="button" onClick={() => setForm((f) => ({ ...f, goal: g.id }))}
                    className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl border-2 transition-all duration-150 ${
                      active ? c.active : c.idle
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.icon}`}>
                      <Icon className="text-xl" />
                    </div>
                    <span className={`text-xs font-bold text-center leading-tight ${active ? c.label : 'text-gray-600'}`}>
                      {g.label}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">{g.tagline}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <button type="submit" className="btn-primary w-full py-4 text-base">
            <TbCalculator className="text-lg" />
            Calculate My Nutrition Plan
          </button>
        </form>
      ) : (
        <div className="card">
          <button type="button" onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors">
            <HiChevronDown className="rotate-90" />
            Edit Inputs
          </button>
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div id="results"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ResultSection result={result} onRecalculate={() => { setShowForm(true); setResult(null) }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </PageTransition>
  )
}

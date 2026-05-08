import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HiArrowLeft, HiRefresh, HiCalculator } from 'react-icons/hi'
import BMIGauge from '../components/BMIGauge'
import PageTransition from '../components/PageTransition'

// ─── BMI logic ────────────────────────────────────────────────────────────────

function calcBMIMetric(weightKg, heightCm) {
  const heightM = heightCm / 100
  return weightKg / (heightM * heightM)
}

function calcBMIImperial(weightLbs, heightFt, heightIn) {
  const totalInches = heightFt * 12 + heightIn
  return (weightLbs * 703) / (totalInches * totalInches)
}

function getCategory(bmi) {
  if (bmi < 18.5) return 'Underweight'
  if (bmi < 25)   return 'Normal'
  if (bmi < 30)   return 'Overweight'
  return 'Obese'
}

const CATEGORY_STYLES = {
  Underweight: { bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-700' },
  Normal:      { bg: 'bg-green-50',  text: 'text-green-600',  border: 'border-green-200',  badge: 'bg-green-100 text-green-700' },
  Overweight:  { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-700' },
  Obese:       { bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-200',    badge: 'bg-red-100 text-red-700' },
}

const CATEGORY_INFO = {
  Underweight: 'Your BMI is below the healthy range. Consider consulting a healthcare professional about healthy weight gain strategies.',
  Normal:      'Great news! Your BMI is within the healthy range. Maintain your current lifestyle with balanced nutrition and regular exercise.',
  Overweight:  'Your BMI is above the healthy range. Small lifestyle changes like a balanced diet and regular exercise can help.',
  Obese:       'Your BMI indicates obesity. Speaking with a healthcare provider can help you develop a safe and effective plan.',
}

// ─── Validation helpers ───────────────────────────────────────────────────────

function validatePositive(val, label) {
  if (val === '' || val === null || val === undefined) return `${label} is required.`
  const n = Number(val)
  if (isNaN(n) || n <= 0) return `${label} must be a positive number.`
  return null
}

// ─── Component ────────────────────────────────────────────────────────────────

const INITIAL_METRIC = { weightKg: '', heightCm: '' }
const INITIAL_IMPERIAL = { weightLbs: '', heightFt: '', heightIn: '' }

export default function BMICalculatorPage() {
  const [unit, setUnit] = useState('metric')
  const [metric, setMetric] = useState(INITIAL_METRIC)
  const [imperial, setImperial] = useState(INITIAL_IMPERIAL)
  const [errors, setErrors] = useState({})
  const [result, setResult] = useState(null)

  const handleUnitSwitch = (newUnit) => {
    setUnit(newUnit)
    setErrors({})
    setResult(null)
  }

  const handleMetricChange = (e) => {
    setMetric((p) => ({ ...p, [e.target.name]: e.target.value }))
    setErrors((p) => ({ ...p, [e.target.name]: null }))
    setResult(null)
  }

  const handleImperialChange = (e) => {
    setImperial((p) => ({ ...p, [e.target.name]: e.target.value }))
    setErrors((p) => ({ ...p, [e.target.name]: null }))
    setResult(null)
  }

  const handleReset = useCallback(() => {
    setMetric(INITIAL_METRIC)
    setImperial(INITIAL_IMPERIAL)
    setErrors({})
    setResult(null)
  }, [])

  const handleCalculate = () => {
    const newErrors = {}
    let bmi

    if (unit === 'metric') {
      newErrors.weightKg = validatePositive(metric.weightKg, 'Weight')
      newErrors.heightCm = validatePositive(metric.heightCm, 'Height')
      if (!newErrors.weightKg && !newErrors.heightCm) {
        bmi = calcBMIMetric(Number(metric.weightKg), Number(metric.heightCm))
      }
    } else {
      newErrors.weightLbs = validatePositive(imperial.weightLbs, 'Weight')
      newErrors.heightFt  = validatePositive(imperial.heightFt, 'Feet')
      const inVal = Number(imperial.heightIn)
      if (imperial.heightIn !== '' && (isNaN(inVal) || inVal < 0)) {
        newErrors.heightIn = 'Inches must be 0 or more.'
      }
      if (!newErrors.weightLbs && !newErrors.heightFt && !newErrors.heightIn) {
        bmi = calcBMIImperial(
          Number(imperial.weightLbs),
          Number(imperial.heightFt),
          Number(imperial.heightIn || 0),
        )
      }
    }

    const filtered = Object.fromEntries(Object.entries(newErrors).filter(([, v]) => v))
    setErrors(filtered)

    if (Object.keys(filtered).length === 0 && bmi !== undefined) {
      const category = getCategory(bmi)
      setResult({ bmi: Math.round(bmi * 10) / 10, category })
    }
  }

  const styles = result ? CATEGORY_STYLES[result.category] : null

  return (
    <PageTransition>
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Back link */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-8 group"
      >
        <HiArrowLeft className="group-hover:-translate-x-0.5 transition-transform" />
        Back to Home
      </Link>

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">BMI Calculator</h1>
        <p className="mt-2 text-gray-500">
          Calculate your Body Mass Index (BMI) using your height and weight.
        </p>
      </div>

      <div className="card space-y-7">
        {/* Unit toggle */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Unit System</label>
          <div className="flex rounded-xl border border-gray-200 overflow-hidden w-fit">
            {['metric', 'imperial'].map((u) => (
              <button
                key={u}
                onClick={() => handleUnitSwitch(u)}
                className={`px-6 py-2.5 text-sm font-semibold capitalize transition-colors ${
                  unit === u
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        {/* Metric inputs */}
        {unit === 'metric' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputField
              label="Weight"
              name="weightKg"
              value={metric.weightKg}
              onChange={handleMetricChange}
              unit="kg"
              placeholder="e.g. 70"
              error={errors.weightKg}
            />
            <InputField
              label="Height"
              name="heightCm"
              value={metric.heightCm}
              onChange={handleMetricChange}
              unit="cm"
              placeholder="e.g. 175"
              error={errors.heightCm}
            />
          </div>
        )}

        {/* Imperial inputs */}
        {unit === 'imperial' && (
          <div className="space-y-5">
            <InputField
              label="Weight"
              name="weightLbs"
              value={imperial.weightLbs}
              onChange={handleImperialChange}
              unit="lbs"
              placeholder="e.g. 154"
              error={errors.weightLbs}
            />
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Height — Feet"
                name="heightFt"
                value={imperial.heightFt}
                onChange={handleImperialChange}
                unit="ft"
                placeholder="e.g. 5"
                error={errors.heightFt}
              />
              <InputField
                label="Height — Inches"
                name="heightIn"
                value={imperial.heightIn}
                onChange={handleImperialChange}
                unit="in"
                placeholder="e.g. 9"
                error={errors.heightIn}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button onClick={handleCalculate} className="btn-primary flex-1 py-3.5 text-base">
            <HiCalculator />
            Calculate BMI
          </button>
          <button
            onClick={handleReset}
            className="btn-secondary px-4"
            title="Reset"
            aria-label="Reset"
          >
            <HiRefresh className="text-lg" />
          </button>
        </div>
      </div>

      {/* Result */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={result.category}
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.25, 0.1, 0.25, 1] }}
            className={`mt-6 rounded-2xl border p-6 space-y-5 ${styles.bg} ${styles.border}`}
          >
            <motion.div
              className="flex items-start justify-between flex-wrap gap-4"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            >
              <div>
                <p className="text-sm font-medium text-gray-500">Your BMI</p>
                <p className={`text-6xl font-extrabold mt-1 ${styles.text}`}>{result.bmi}</p>
              </div>
              <span className={`text-lg font-bold px-4 py-2 rounded-xl ${styles.badge}`}>
                {result.category}
              </span>
            </motion.div>

            <BMIGauge bmi={result.bmi} category={result.category} />

            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }}
              className="text-sm text-gray-600 leading-relaxed bg-white/60 rounded-xl p-4 border border-white"
            >
              {CATEGORY_INFO[result.category]}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reference table */}
      <div className="mt-8 card">
        <h2 className="text-base font-semibold text-gray-800 mb-4">BMI Categories Reference</h2>
        <div className="space-y-2">
          {[
            { range: 'Below 18.5', label: 'Underweight', style: CATEGORY_STYLES.Underweight },
            { range: '18.5 – 24.9', label: 'Normal weight', style: CATEGORY_STYLES.Normal },
            { range: '25 – 29.9', label: 'Overweight', style: CATEGORY_STYLES.Overweight },
            { range: '30 and above', label: 'Obese', style: CATEGORY_STYLES.Obese },
          ].map(({ range, label, style }) => (
            <div
              key={label}
              className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-gray-50"
            >
              <span className="text-sm text-gray-600 font-medium">{range}</span>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${style.badge}`}>
                {label}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-gray-400">
          BMI is a screening tool, not a diagnostic measure. Consult a healthcare provider for a thorough assessment.
        </p>
      </div>

    </div>
    </PageTransition>
  )
}

// ─── InputField sub-component ─────────────────────────────────────────────────

function InputField({ label, name, value, onChange, unit, placeholder, error }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-semibold text-gray-700">
        {label}
      </label>
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
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400 pointer-events-none">
          {unit}
        </span>
      </div>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  )
}

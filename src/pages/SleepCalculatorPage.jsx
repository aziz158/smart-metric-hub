import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HiArrowLeft } from 'react-icons/hi'
import { TbMoon, TbSun, TbClock, TbAlarm, TbZzz } from 'react-icons/tb'
import {
  calcBedtimes, calcWakeUpTimes, calcDuration,
  timeToMinutes, formatTime, formatDuration, nowString,
  CYCLE_QUALITY, QUALITY_COLORS, SLEEP_TIPS,
  FALL_ASLEEP, CYCLE_MINUTES,
} from '../utils/sleepCalc'
import PageTransition from '../components/PageTransition'
import ScrollFade from '../components/ScrollFade'

// ─── Shared UI ────────────────────────────────────────────────────────────────

function TimeInput({ label, value, onChange, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field text-lg font-semibold [color-scheme:light]"
      />
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  )
}

function FormatToggle({ value, onChange }) {
  return (
    <div className="flex rounded-lg border border-gray-200 overflow-hidden w-fit">
      {[['12h', '12h'], ['24h', '24h']].map(([val, lbl]) => (
        <button key={val} type="button" onClick={() => onChange(val)}
          className={`px-3 py-1.5 text-xs font-bold transition-colors ${
            value === val ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
          }`}
        >
          {lbl}
        </button>
      ))}
    </div>
  )
}

// ─── Result card for a single recommended time ────────────────────────────────

function TimeCard({ time, cycles, duration, type, fmt, index }) {
  const q  = CYCLE_QUALITY[cycles]
  const c  = QUALITY_COLORS[q.color]
  const Icon = type === 'bedtime' ? TbMoon : TbSun

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
      className={`rounded-2xl border p-4 flex items-center justify-between gap-4 ${c.card}`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          type === 'bedtime' ? 'bg-indigo-100' : 'bg-amber-100'
        }`}>
          <Icon className={`text-xl ${type === 'bedtime' ? 'text-indigo-600' : 'text-amber-600'}`} />
        </div>
        <div>
          <p className={`text-2xl font-extrabold leading-tight ${c.time}`}>
            {formatTime(time, fmt)}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{formatDuration(duration)} of sleep</p>
        </div>
      </div>
      <div className="text-right shrink-0">
        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${c.badge}`}>
          {q.label}
        </span>
        <p className="text-xs text-gray-400 mt-1">{cycles} cycles</p>
      </div>
    </motion.div>
  )
}

// ─── Tab 1: Bedtime Calculator (enter wake-up → get bedtimes) ─────────────────

function BedtimeTab({ fmt }) {
  const [wakeUp, setWakeUp] = useState('')

  const results = useMemo(() => {
    const min = timeToMinutes(wakeUp)
    if (min === null) return null
    return calcBedtimes(min)
  }, [wakeUp])

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm text-gray-500 leading-relaxed">
          Enter the time you need to wake up and we'll tell you exactly when to go to sleep
          to complete full 90-minute sleep cycles.
        </p>
      </div>

      <TimeInput
        label="I want to wake up at"
        value={wakeUp}
        onChange={setWakeUp}
        hint="Includes a 15-minute fall-asleep buffer"
      />

      <AnimatePresence mode="wait">
        {results ? (
          <motion.div
            key="bedtime-results"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">Recommended bedtimes</p>
              <span className="text-xs text-gray-400">latest → earliest</span>
            </div>
            {[...results].reverse().map((r, i) => (
              <TimeCard key={r.cycles} {...r} type="bedtime" fmt={fmt} index={i} />
            ))}
            <p className="text-xs text-gray-400 text-center pt-1">
              Aim to be in bed by these times — not just turning off the lights.
            </p>
          </motion.div>
        ) : (
          <div className="py-10 text-center text-gray-400">
            <TbMoon className="text-4xl mx-auto mb-3 text-indigo-200" />
            <p className="text-sm">Enter a wake-up time to see your ideal bedtimes.</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Tab 2: Wake-Up Calculator (enter bedtime → get wake-up times) ────────────

function WakeUpTab({ fmt }) {
  const [bedtime, setBedtime] = useState('')

  function sleepNow() {
    setBedtime(nowString())
  }

  const results = useMemo(() => {
    const min = timeToMinutes(bedtime)
    if (min === null) return null
    return calcWakeUpTimes(min)
  }, [bedtime])

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500 leading-relaxed">
        Enter the time you plan to go to sleep and we'll calculate the best times to wake up
        so you finish a complete sleep cycle feeling refreshed.
      </p>

      <div className="space-y-3">
        <TimeInput
          label="I plan to sleep at"
          value={bedtime}
          onChange={setBedtime}
          hint="Includes a 15-minute fall-asleep buffer"
        />
        <button type="button" onClick={sleepNow}
          className="flex items-center gap-2 text-sm font-semibold text-indigo-600
                     hover:text-indigo-700 transition-colors"
        >
          <TbZzz className="text-base" />
          Set to right now (falling asleep immediately)
        </button>
      </div>

      <AnimatePresence mode="wait">
        {results ? (
          <motion.div
            key="wakeup-results"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">Recommended wake-up times</p>
              <span className="text-xs text-gray-400">earliest → latest</span>
            </div>
            {results.map((r, i) => (
              <TimeCard key={r.cycles} {...r} type="wakeup" fmt={fmt} index={i} />
            ))}
            <p className="text-xs text-gray-400 text-center pt-1">
              Try to wake up at the end of a cycle — you'll feel much more alert.
            </p>
          </motion.div>
        ) : (
          <div className="py-10 text-center text-gray-400">
            <TbSun className="text-4xl mx-auto mb-3 text-amber-200" />
            <p className="text-sm">Enter a bedtime to see your best wake-up times.</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Tab 3: Sleep Duration ────────────────────────────────────────────────────

function DurationTab({ fmt }) {
  const [start, setStart]   = useState('')
  const [wakeUp, setWakeUp] = useState('')

  const result = useMemo(() => {
    const s = timeToMinutes(start)
    const w = timeToMinutes(wakeUp)
    if (s === null || w === null) return null
    return calcDuration(s, w)
  }, [start, wakeUp])

  const quality = result
    ? result.cycles >= 6 ? 'Optimal'
    : result.cycles >= 5 ? 'Good'
    : result.cycles >= 4 ? 'Fair'
    : 'Low'
    : null

  const qualityColor = { Optimal: 'text-emerald-600', Good: 'text-blue-600', Fair: 'text-amber-600', Low: 'text-red-500' }

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500 leading-relaxed">
        Enter when you fell asleep and when you woke up to see how many sleep cycles
        you completed and how restful your sleep was.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <TimeInput label="I fell asleep at" value={start}  onChange={setStart}  />
        <TimeInput label="I woke up at"     value={wakeUp} onChange={setWakeUp} />
      </div>

      <AnimatePresence mode="wait">
        {result ? (
          <motion.div
            key="duration-result"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="space-y-3"
          >
            {/* Big duration display */}
            <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-6 text-center">
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide mb-2">Total Sleep</p>
              <p className="text-5xl font-extrabold text-indigo-700">{formatDuration(result.duration)}</p>
              <p className={`mt-2 text-base font-bold ${qualityColor[quality]}`}>{quality} sleep</p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 text-center">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Cycles</p>
                <p className="text-3xl font-extrabold text-gray-800">{result.cycles}</p>
                <p className="text-xs text-gray-400 mt-0.5">complete cycles</p>
              </div>
              <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 text-center">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Remainder</p>
                <p className="text-3xl font-extrabold text-gray-800">{result.remainder}<span className="text-lg">m</span></p>
                <p className="text-xs text-gray-400 mt-0.5">into next cycle</p>
              </div>
            </div>

            {result.remainder > 0 && result.remainder < 30 && (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
                You woke up {result.remainder} minutes into your last cycle — this may explain morning grogginess.
              </p>
            )}
          </motion.div>
        ) : (
          <div className="py-10 text-center text-gray-400">
            <TbClock className="text-4xl mx-auto mb-3 text-gray-200" />
            <p className="text-sm">Enter both times to calculate your sleep duration.</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'bedtime', label: 'Bedtime',      icon: TbMoon,  hint: 'I know my wake-up time' },
  { id: 'wakeup',  label: 'Wake-Up',      icon: TbSun,   hint: 'I know my bedtime' },
  { id: 'duration',label: 'Sleep Duration', icon: TbClock, hint: 'How long did I sleep?' },
]

export default function SleepCalculatorPage() {
  const [activeTab, setActiveTab]     = useState('bedtime')
  const [timeFormat, setTimeFormat]   = useState('12h')

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <Link to="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-8 group"
        >
          <HiArrowLeft className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <TbMoon className="text-2xl text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">Sleep Calculator</h1>
          </div>
          <p className="text-gray-500">
            Find your ideal bedtime or wake-up time based on 90-minute sleep cycles.
          </p>
        </div>

        {/* Tabs + format toggle */}
        <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" onClick={() => setActiveTab(id)}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-xl
                            transition-all duration-150 ${
                  activeTab === id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                <Icon className="text-base" />
                {label}
              </button>
            ))}
          </div>
          <FormatToggle value={timeFormat} onChange={setTimeFormat} />
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
              {activeTab === 'bedtime'  && <BedtimeTab  fmt={timeFormat} />}
              {activeTab === 'wakeup'   && <WakeUpTab   fmt={timeFormat} />}
              {activeTab === 'duration' && <DurationTab fmt={timeFormat} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sleep cycle info */}
        <ScrollFade className="mt-5">
          <div className="card bg-indigo-50 border-indigo-100 space-y-2">
            <p className="text-sm font-semibold text-indigo-800">How sleep cycles work</p>
            <p className="text-xs text-indigo-600 leading-relaxed">
              Each sleep cycle lasts approximately <strong>90 minutes</strong> and includes light sleep,
              deep sleep, and REM. Waking mid-cycle can leave you feeling groggy. The calculator
              adds a <strong>15-minute fall-asleep buffer</strong> to all times.
            </p>
            <div className="flex gap-3 pt-1 flex-wrap">
              {[
                { cycles: 4, label: '6h — Minimum' },
                { cycles: 5, label: '7h 30m — Good' },
                { cycles: 6, label: '9h — Optimal' },
              ].map(({ cycles, label }) => (
                <span key={cycles}
                  className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700"
                >
                  {cycles} cycles · {label}
                </span>
              ))}
            </div>
          </div>
        </ScrollFade>

        {/* Sleep tips */}
        <ScrollFade className="mt-5" delay={0.08}>
          <div className="card space-y-4">
            <h2 className="text-base font-semibold text-gray-800">Sleep Quality Tips</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SLEEP_TIPS.map(({ icon, title, body }) => (
                <div key={title} className="flex gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-xl shrink-0 mt-0.5">{icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollFade>

        <style>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </div>
    </PageTransition>
  )
}

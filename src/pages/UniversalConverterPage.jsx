import { useState, useMemo, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HiArrowLeft, HiClipboard, HiCheck, HiChevronLeft, HiChevronRight } from 'react-icons/hi'
import {
  TbRuler, TbWeight, TbGauge, TbTemperature, TbClock,
  TbSquare, TbBolt, TbDroplet, TbWind, TbArrowsRightLeft,
} from 'react-icons/tb'
import { CATEGORIES, convertValue, formatValue } from '../data/converterData'
import PageTransition from '../components/PageTransition'
import ScrollFade from '../components/ScrollFade'

// ─── Icon map ─────────────────────────────────────────────────────────────────

const CAT_ICONS = {
  length:      TbRuler,
  weight:      TbWeight,
  speed:       TbGauge,
  temperature: TbTemperature,
  time:        TbClock,
  area:        TbSquare,
  power:       TbBolt,
  volume:      TbDroplet,
  pressure:    TbWind,
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function UnitSelect({ value, onChange, units, className = '' }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`input-field cursor-pointer ${className}`}
    >
      {units.map((u) => (
        <option key={u.id} value={u.id}>
          {u.label} ({u.symbol})
        </option>
      ))}
    </select>
  )
}

function CopyButton({ text, unitId, copiedId, onCopy }) {
  const done = copiedId === unitId
  return (
    <button
      type="button"
      onClick={() => onCopy(text, unitId)}
      title="Copy value"
      className={`shrink-0 p-2 rounded-lg transition-all duration-150 ${
        done
          ? 'bg-green-100 text-green-600'
          : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
      }`}
    >
      {done ? <HiCheck className="text-sm" /> : <HiClipboard className="text-sm" />}
    </button>
  )
}

// ─── Category scroller with arrow buttons ────────────────────────────────────

function CategoryScroller({ categoryId, onSelect }) {
  const railRef = useRef(null)
  const [canLeft,  setCanLeft]  = useState(false)
  const [canRight, setCanRight] = useState(true)

  function sync() {
    const el = railRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 2)
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2)
  }

  useEffect(() => {
    const el = railRef.current
    if (!el) return
    sync()
    el.addEventListener('scroll', sync, { passive: true })
    window.addEventListener('resize', sync)
    return () => {
      el.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
    }
  }, [])

  function scrollBy(dir) {
    railRef.current?.scrollBy({ left: dir * 200, behavior: 'smooth' })
  }

  return (
    <div className="relative mb-5">
      {/* Left arrow + fade */}
      <AnimatePresence>
        {canLeft && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-0 bottom-0 z-10 flex items-center"
          >
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent pointer-events-none" />
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              className="relative z-10 w-7 h-7 flex items-center justify-center rounded-full
                         bg-white border border-gray-200 shadow-sm text-gray-500
                         hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              <HiChevronLeft className="text-sm" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scrollable rail */}
      <div
        ref={railRef}
        className="flex gap-2 overflow-x-auto no-scrollbar px-1"
        style={{ scrollbarWidth: 'none' }}
      >
        {/* Padding so chips don't hide behind arrows */}
        {canLeft  && <div className="shrink-0 w-6" />}

        {CATEGORIES.map((cat) => {
          const Icon   = CAT_ICONS[cat.id]
          const active = cat.id === categoryId
          return (
            <motion.button
              key={cat.id}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(cat.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold
                          border transition-all duration-150 ${
                active
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              <Icon className="text-base" />
              {cat.label}
            </motion.button>
          )
        })}

        {canRight && <div className="shrink-0 w-6" />}
      </div>

      {/* Right arrow + fade */}
      <AnimatePresence>
        {canRight && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-0 bottom-0 z-10 flex items-center justify-end"
          >
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none" />
            <button
              type="button"
              onClick={() => scrollBy(1)}
              className="relative z-10 w-7 h-7 flex items-center justify-center rounded-full
                         bg-white border border-gray-200 shadow-sm text-gray-500
                         hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              <HiChevronRight className="text-sm" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UniversalConverterPage() {
  const [categoryId, setCategoryId] = useState('length')
  const [inputValue, setInputValue] = useState('1')
  const [fromUnit,   setFromUnit]   = useState('km')
  const [toUnit,     setToUnit]     = useState('mi')
  const [copiedId,   setCopiedId]   = useState(null)
  const [inputError, setInputError] = useState(null)

  const category = CATEGORIES.find((c) => c.id === categoryId)

  // Switch category → reset units and input
  function handleCategoryChange(id) {
    const cat = CATEGORIES.find((c) => c.id === id)
    setCategoryId(id)
    setFromUnit(cat.defaultFrom)
    setToUnit(cat.defaultTo)
    setInputValue('1')
    setInputError(null)
  }

  // Swap from ↔ to, and update input to current result
  function handleSwap() {
    const num = parseFloat(inputValue)
    if (!isNaN(num) && isFinite(num)) {
      const res = convertValue(num, fromUnit, toUnit, category)
      if (res !== null) setInputValue(formatValue(res))
    }
    setFromUnit(toUnit)
    setToUnit(fromUnit)
  }

  function handleInput(val) {
    setInputValue(val)
    if (val === '' || val === '-') {
      setInputError(null)
      return
    }
    const n = parseFloat(val)
    setInputError(isNaN(n) ? 'Enter a valid number.' : null)
  }

  async function handleCopy(text, unitId) {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // fallback — do nothing visible
    }
    setCopiedId(unitId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Live primary result
  const primaryResult = useMemo(() => {
    const num = parseFloat(inputValue)
    if (isNaN(num) || !isFinite(num) || inputValue === '') return null
    return convertValue(num, fromUnit, toUnit, category)
  }, [inputValue, fromUnit, toUnit, category])

  // All-units breakdown
  const allResults = useMemo(() => {
    const num = parseFloat(inputValue)
    if (isNaN(num) || !isFinite(num) || inputValue === '') return []
    return category.units.map((u) => ({
      unit:  u,
      value: convertValue(num, fromUnit, u.id, category),
    }))
  }, [inputValue, fromUnit, category])

  const fromUnitObj = category.units.find((u) => u.id === fromUnit)
  const toUnitObj   = category.units.find((u) => u.id === toUnit)
  const resultStr   = primaryResult !== null ? formatValue(primaryResult) : '—'

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <Link to="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-8 group"
        >
          <HiArrowLeft className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <TbArrowsRightLeft className="text-2xl text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Universal Converter</h1>
          </div>
          <p className="text-gray-500">
            Instantly convert between units across 9 categories — length, weight, speed, and more.
          </p>
        </div>

        {/* Category selector */}
        <CategoryScroller categoryId={categoryId} onSelect={handleCategoryChange} />

        {/* Main converter card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={categoryId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="card space-y-4"
          >
            {/* FROM row */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">From</label>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="number"
                    value={inputValue}
                    onChange={(e) => handleInput(e.target.value)}
                    placeholder="Enter value"
                    className={`input-field text-xl font-bold [appearance:textfield]
                                [&::-webkit-outer-spin-button]:appearance-none
                                [&::-webkit-inner-spin-button]:appearance-none
                                ${inputError ? 'input-field-error' : ''}`}
                  />
                  {inputError && (
                    <p className="absolute -bottom-5 left-0 text-xs text-red-500">{inputError}</p>
                  )}
                </div>
                <UnitSelect
                  value={fromUnit}
                  onChange={setFromUnit}
                  units={category.units}
                  className="w-44 shrink-0"
                />
              </div>
            </div>

            {/* Swap button */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-gray-100" />
              <motion.button
                type="button"
                whileTap={{ rotate: 180, scale: 0.9 }}
                transition={{ duration: 0.25 }}
                onClick={handleSwap}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200
                           bg-white text-gray-500 text-sm font-semibold
                           hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50
                           transition-colors duration-150"
              >
                <TbArrowsRightLeft className="text-base" />
                Swap
              </motion.button>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* TO row */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">To</label>
              <div className="flex gap-3">
                {/* Result display */}
                <div className="flex-1 relative flex items-center gap-2">
                  <div className={`flex-1 px-4 py-3 rounded-xl border text-xl font-bold
                                   transition-colors duration-200 select-all cursor-text
                                   ${primaryResult !== null
                                     ? 'bg-blue-50 border-blue-200 text-blue-700'
                                     : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                    {resultStr}
                  </div>
                  <CopyButton
                    text={`${resultStr} ${toUnitObj?.symbol}`}
                    unitId="primary"
                    copiedId={copiedId}
                    onCopy={handleCopy}
                  />
                </div>
                <UnitSelect
                  value={toUnit}
                  onChange={setToUnit}
                  units={category.units}
                  className="w-44 shrink-0"
                />
              </div>
            </div>

            {/* Inline summary */}
            {primaryResult !== null && !inputError && (
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-sm text-gray-500 text-center pt-1 border-t border-gray-100"
              >
                {inputValue} {fromUnitObj?.symbol} = {resultStr} {toUnitObj?.symbol}
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* All conversions */}
        <ScrollFade className="mt-5">
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">All {category.label} Conversions</h2>
              {fromUnitObj && (
                <span className="text-xs text-gray-400">
                  {inputValue || '0'} {fromUnitObj.symbol}
                </span>
              )}
            </div>

            <div className="divide-y divide-gray-50">
              {allResults.map(({ unit, value }) => {
                const formatted = value !== null ? formatValue(value) : '—'
                const isActive  = unit.id === toUnit
                return (
                  <div
                    key={unit.id}
                    className={`flex items-center justify-between py-2.5 px-3 -mx-3 rounded-xl
                                transition-colors ${isActive ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`text-xs font-bold w-12 shrink-0 tabular-nums
                                       ${isActive ? 'text-blue-500' : 'text-gray-400'}`}>
                        {unit.symbol}
                      </span>
                      <span className="text-sm text-gray-500 truncate">{unit.label}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className={`text-sm font-bold tabular-nums
                                       ${isActive ? 'text-blue-700' : 'text-gray-800'}`}>
                        {formatted}
                      </span>
                      <CopyButton
                        text={`${formatted} ${unit.symbol}`}
                        unitId={unit.id}
                        copiedId={copiedId}
                        onCopy={handleCopy}
                      />
                    </div>
                  </div>
                )
              })}
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

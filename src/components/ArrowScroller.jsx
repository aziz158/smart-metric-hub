import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi'

/**
 * ArrowScroller — two modes:
 *
 * NAV MODE  (items + value + getId + onChange + renderItem)
 *   Shows only the active item between the arrows — no scroll, no drag.
 *   Left/right arrows navigate one item at a time with a slide animation.
 *   Arrows are gray/disabled when already at the first or last item.
 *
 * SCROLL MODE  (children only — e.g. Treadmill presets)
 *   All children shown in a scrollable row.
 *   Arrows appear only when content overflows, disabled at scroll edges.
 */
export default function ArrowScroller({
  children,
  items,
  value,
  getId,
  onChange,
  renderItem,
  className = '',
}) {
  const isNav     = !!(items && onChange && renderItem)
  const activeIdx = isNav ? items.findIndex((item) => getId(item) === value) : -1
  const dirRef    = useRef(0) // slide direction: 1 = forward, -1 = backward

  // ── Scroll-mode state ────────────────────────────────────────────────────
  const railRef               = useRef(null)
  const [fits,     setFits]   = useState(true)
  const [canLeft,  setCanLeft]  = useState(false)
  const [canRight, setCanRight] = useState(false)

  function sync() {
    const el = railRef.current
    if (!el) return
    setFits(el.scrollWidth <= el.clientWidth + 4)
    setCanLeft(el.scrollLeft > 2)
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2)
  }

  useEffect(() => {
    if (isNav) return
    const el = railRef.current
    if (!el) return
    const t = setTimeout(sync, 60)
    el.addEventListener('scroll', sync, { passive: true })
    window.addEventListener('resize', sync)
    return () => { clearTimeout(t); el.removeEventListener('scroll', sync); window.removeEventListener('resize', sync) }
  }, [isNav])

  useEffect(() => { if (!isNav) setTimeout(sync, 60) }, [children, isNav])

  // ── Shared arrow styles ──────────────────────────────────────────────────
  const base = 'shrink-0 w-7 h-7 flex items-center justify-center rounded-full border transition-colors duration-150'
  const on   = 'bg-white border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600 cursor-pointer'
  const off  = 'bg-gray-50 border-gray-200 text-gray-300 cursor-default'

  // ── NAV MODE: single-item picker ─────────────────────────────────────────
  if (isNav) {
    const leftOff  = activeIdx <= 0
    const rightOff = activeIdx >= items.length - 1

    function handleLeft() {
      if (leftOff) return
      dirRef.current = -1
      onChange(getId(items[activeIdx - 1]))
    }
    function handleRight() {
      if (rightOff) return
      dirRef.current = 1
      onChange(getId(items[activeIdx + 1]))
    }

    const slideVariants = {
      enter:  (dir) => ({ opacity: 0, x: dir * 14 }),
      center: { opacity: 1, x: 0 },
      exit:   (dir) => ({ opacity: 0, x: dir * -14 }),
    }

    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <button type="button" disabled={leftOff} onClick={handleLeft}
          className={`${base} ${leftOff ? off : on}`} aria-label="Previous"
        >
          <HiChevronLeft className="text-sm" />
        </button>

        <div className="flex-1 flex justify-center min-w-0 overflow-hidden">
          <AnimatePresence mode="wait" custom={dirRef.current}>
            <motion.div
              key={String(value)}
              custom={dirRef.current}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {activeIdx >= 0 && renderItem(items[activeIdx], true)}
            </motion.div>
          </AnimatePresence>
        </div>

        <button type="button" disabled={rightOff} onClick={handleRight}
          className={`${base} ${rightOff ? off : on}`} aria-label="Next"
        >
          <HiChevronRight className="text-sm" />
        </button>
      </div>
    )
  }

  // ── SCROLL MODE: scrollable row, arrows only when overflowing ────────────
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {!fits && (
        <button type="button" disabled={!canLeft} onClick={() => railRef.current?.scrollBy({ left: -200, behavior: 'smooth' })}
          className={`${base} ${canLeft ? on : off}`} aria-label="Scroll left"
        >
          <HiChevronLeft className="text-sm" />
        </button>
      )}

      <div ref={railRef} className="flex-1 min-w-0 flex gap-2 overflow-x-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>

      {!fits && (
        <button type="button" disabled={!canRight} onClick={() => railRef.current?.scrollBy({ left: 200, behavior: 'smooth' })}
          className={`${base} ${canRight ? on : off}`} aria-label="Scroll right"
        >
          <HiChevronRight className="text-sm" />
        </button>
      )}
    </div>
  )
}

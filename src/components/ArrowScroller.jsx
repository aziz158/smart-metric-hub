import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi'

// ─── Shared arrow button ──────────────────────────────────────────────────────

function Btn({ dir, disabled, onClick }) {
  const base = 'shrink-0 w-7 h-7 flex items-center justify-center rounded-full border transition-colors duration-150'
  const on   = 'bg-white border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600 cursor-pointer'
  const off  = 'bg-gray-50 border-gray-200 text-gray-300 cursor-default'
  return (
    <button type="button" disabled={disabled} onClick={onClick}
      className={`${base} ${disabled ? off : on}`}
      aria-label={dir === 'left' ? 'Previous' : 'Next'}
    >
      {dir === 'left'
        ? <HiChevronLeft className="text-sm" />
        : <HiChevronRight className="text-sm" />}
    </button>
  )
}

// ─── Slide variants for nav-mode item transitions ─────────────────────────────

const slide = {
  enter:  (d) => ({ opacity: 0, x: d * 14 }),
  center: { opacity: 1, x: 0 },
  exit:   (d) => ({ opacity: 0, x: d * -14 }),
}

/**
 * ArrowScroller — two modes:
 *
 * NAV MODE  (items + value + getId + onChange + renderItem)
 *   • If all items fit:  renders them all as a normal row — no arrows.
 *   • If they overflow:  shows only the active item between two arrows;
 *     clicking an arrow selects the prev/next item with a slide animation.
 *   Arrows are gray/disabled at the first and last item.
 *
 * SCROLL MODE  (children only — e.g. Treadmill presets)
 *   • If children fit:   renders them as a normal row — no arrows.
 *   • If they overflow:  shows arrows that scroll the row by 200 px;
 *     arrows are gray/disabled at the respective scroll edge.
 *
 * Both modes use a ResizeObserver so measurement reacts to layout changes
 * (e.g. when a tab becomes visible inside an animated parent).
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
  const isNav = !!(items && onChange && renderItem)
  const dirRef = useRef(0)   // slide direction: 1 = forward, -1 = backward

  // Nav mode refs
  const containerRef = useRef(null)   // outer wrapper — needed for available width
  const measureRef   = useRef(null)   // hidden div that always holds ALL items

  // Scroll mode ref
  const railRef = useRef(null)

  const [fits,     setFits]     = useState(true)
  const [canLeft,  setCanLeft]  = useState(false)
  const [canRight, setCanRight] = useState(false)

  const activeIdx = isNav ? items.findIndex((item) => getId(item) === value) : -1

  // ── Measurement ─────────────────────────────────────────────────────────
  function sync() {
    if (isNav) {
      const m = measureRef.current
      const c = containerRef.current
      if (!m || !c) return
      // Compare natural total width of all chips vs available container width
      setFits(m.scrollWidth <= c.clientWidth + 4)
    } else {
      const el = railRef.current
      if (!el) return
      setFits(el.scrollWidth <= el.clientWidth + 4)
      setCanLeft(el.scrollLeft > 2)
      setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2)
    }
  }

  useEffect(() => {
    const target = isNav ? measureRef.current : railRef.current
    if (!target) return

    const ro = new ResizeObserver(() => sync())
    ro.observe(target)
    if (!isNav) target.addEventListener('scroll', sync, { passive: true })
    window.addEventListener('resize', sync)
    const t = setTimeout(sync, 80)

    return () => {
      ro.disconnect()
      clearTimeout(t)
      if (!isNav) target.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNav])

  // Re-measure when content changes
  useEffect(() => { setTimeout(sync, 80) }, [children, items])

  // ── NAV MODE ─────────────────────────────────────────────────────────────
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

    return (
      <div ref={containerRef} className={className}>

        {/* Hidden measurement div — fixed off-screen so it never causes page scroll */}
        <div
          ref={measureRef}
          aria-hidden="true"
          style={{
            position: 'fixed',
            top: 0,
            left: '-9999px',
            visibility: 'hidden',
            pointerEvents: 'none',
            display: 'flex',
            gap: '8px',
            whiteSpace: 'nowrap',
          }}
        >
          {items.map((item) => (
            <div key={getId(item)} style={{ flexShrink: 0 }}>
              {renderItem(item, false)}
            </div>
          ))}
        </div>

        {fits ? (
          /* All items fit → show normally, no arrows */
          <div className="flex gap-2 flex-wrap">
            {items.map((item) => renderItem(item, getId(item) === value))}
          </div>
        ) : (
          /* Overflow → single-item picker with arrows */
          <div className="flex items-center gap-2">
            <Btn dir="left"  disabled={leftOff}  onClick={handleLeft} />

            <div className="flex-1 flex justify-center overflow-hidden">
              <AnimatePresence mode="wait" custom={dirRef.current}>
                <motion.div
                  key={String(value)}
                  custom={dirRef.current}
                  variants={slide}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  {activeIdx >= 0 && renderItem(items[activeIdx], true)}
                </motion.div>
              </AnimatePresence>
            </div>

            <Btn dir="right" disabled={rightOff} onClick={handleRight} />
          </div>
        )}
      </div>
    )
  }

  // ── SCROLL MODE ───────────────────────────────────────────────────────────
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {!fits && <Btn dir="left"  disabled={!canLeft}  onClick={() => railRef.current?.scrollBy({ left: -200, behavior: 'smooth' })} />}

      <div
        ref={railRef}
        className="flex-1 min-w-0 flex gap-2 overflow-x-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>

      {!fits && <Btn dir="right" disabled={!canRight} onClick={() => railRef.current?.scrollBy({ left: 200, behavior: 'smooth' })} />}
    </div>
  )
}

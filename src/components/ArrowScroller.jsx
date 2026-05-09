import { useRef, useState, useEffect } from 'react'
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi'

/**
 * ArrowScroller — two modes:
 *
 * NAV MODE  (pass items + value + getId + onChange + renderItem)
 *   Arrows navigate to prev/next item; active item auto-scrolls into view.
 *   Arrows only appear when the chips overflow the container.
 *   Left/right disabled (gray) at the first/last item.
 *
 * SCROLL MODE  (just pass children)
 *   Arrows scroll the rail by 200 px.
 *   Arrows only appear when content overflows.
 *   Left/right disabled when already at the scroll edge.
 */
export default function ArrowScroller({
  children,
  // nav-mode props (all required together)
  items,
  value,
  getId,
  onChange,
  renderItem,
  className = '',
}) {
  const railRef             = useRef(null)
  const [fits,     setFits]     = useState(true)
  const [canLeft,  setCanLeft]  = useState(false)
  const [canRight, setCanRight] = useState(false)

  const isNav     = !!(items && onChange && renderItem)
  const activeIdx = isNav ? items.findIndex((item) => getId(item) === value) : -1

  function sync() {
    const el = railRef.current
    if (!el) return
    setFits(el.scrollWidth <= el.clientWidth + 4)
    setCanLeft(el.scrollLeft > 2)
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2)
  }

  useEffect(() => {
    const el = railRef.current
    if (!el) return
    const t = setTimeout(sync, 60)
    el.addEventListener('scroll', sync, { passive: true })
    window.addEventListener('resize', sync)
    return () => {
      clearTimeout(t)
      el.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
    }
  }, [])

  // Re-measure when content changes
  useEffect(() => { setTimeout(sync, 60) }, [children, items])

  // Auto-scroll active item into view (nav mode, only when overflowing)
  useEffect(() => {
    if (!isNav || activeIdx < 0 || fits) return
    const rail = railRef.current
    if (!rail) return
    const chip = Array.from(rail.children)[activeIdx]
    if (!chip) return
    const left   = chip.offsetLeft
    const right  = left + chip.offsetWidth
    const scroll = rail.scrollLeft
    const railW  = rail.clientWidth
    if (left < scroll + 4) {
      rail.scrollTo({ left: left - 8, behavior: 'smooth' })
    } else if (right > scroll + railW - 4) {
      rail.scrollTo({ left: right - railW + 8, behavior: 'smooth' })
    }
  }, [value, activeIdx, isNav, fits])

  function handleLeft() {
    if (isNav) {
      if (activeIdx > 0) onChange(getId(items[activeIdx - 1]))
    } else {
      railRef.current?.scrollBy({ left: -200, behavior: 'smooth' })
    }
  }

  function handleRight() {
    if (isNav) {
      if (activeIdx < items.length - 1) onChange(getId(items[activeIdx + 1]))
    } else {
      railRef.current?.scrollBy({ left: 200, behavior: 'smooth' })
    }
  }

  const leftOff  = isNav ? activeIdx <= 0                    : !canLeft
  const rightOff = isNav ? activeIdx >= (items?.length ?? 1) - 1 : !canRight

  const base = 'shrink-0 w-7 h-7 flex items-center justify-center rounded-full border transition-colors duration-150'
  const on   = 'bg-white border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600 cursor-pointer'
  const off  = 'bg-gray-50 border-gray-200 text-gray-300 cursor-default'

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {!fits && (
        <button type="button" disabled={leftOff} onClick={handleLeft}
          className={`${base} ${leftOff ? off : on}`} aria-label="Previous"
        >
          <HiChevronLeft className="text-sm" />
        </button>
      )}

      <div
        ref={railRef}
        className="flex-1 min-w-0 flex gap-2 overflow-x-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {isNav ? items.map((item) => renderItem(item, getId(item) === value)) : children}
      </div>

      {!fits && (
        <button type="button" disabled={rightOff} onClick={handleRight}
          className={`${base} ${rightOff ? off : on}`} aria-label="Next"
        >
          <HiChevronRight className="text-sm" />
        </button>
      )}
    </div>
  )
}

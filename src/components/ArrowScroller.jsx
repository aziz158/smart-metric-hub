import { useRef, useState, useEffect } from 'react'
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi'

/**
 * Wraps a horizontal row of chips/tabs with left/right arrow buttons.
 * Arrows are always visible but gray/disabled when at the respective edge.
 * Touch-scroll still works normally on mobile.
 */
export default function ArrowScroller({ children, className = '' }) {
  const railRef               = useRef(null)
  const [canLeft,  setCanLeft]  = useState(false)
  const [canRight, setCanRight] = useState(false)

  function sync() {
    const el = railRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 2)
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2)
  }

  useEffect(() => {
    const el = railRef.current
    if (!el) return
    const t = setTimeout(sync, 60)          // wait for layout paint
    el.addEventListener('scroll', sync, { passive: true })
    window.addEventListener('resize', sync)
    return () => {
      clearTimeout(t)
      el.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
    }
  }, [])

  // Re-sync whenever children change (e.g. category filter narrows the list)
  useEffect(() => { setTimeout(sync, 60) }, [children])

  function shift(dir) {
    railRef.current?.scrollBy({ left: dir * 200, behavior: 'smooth' })
  }

  const base = 'shrink-0 w-7 h-7 flex items-center justify-center rounded-full border transition-colors duration-150'
  const on   = 'bg-white border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600 cursor-pointer'
  const off  = 'bg-gray-50 border-gray-200 text-gray-300 cursor-default'

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button type="button" disabled={!canLeft} onClick={() => shift(-1)}
        className={`${base} ${canLeft ? on : off}`} aria-label="Scroll left"
      >
        <HiChevronLeft className="text-sm" />
      </button>

      <div
        ref={railRef}
        className="flex-1 flex gap-2 overflow-x-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>

      <button type="button" disabled={!canRight} onClick={() => shift(1)}
        className={`${base} ${canRight ? on : off}`} aria-label="Scroll right"
      >
        <HiChevronRight className="text-sm" />
      </button>
    </div>
  )
}

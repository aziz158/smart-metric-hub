const CATEGORIES = [
  { label: 'Underweight', range: '< 18.5', color: '#60a5fa', min: 10, max: 18.5 },
  { label: 'Normal',      range: '18.5 – 24.9', color: '#34d399', min: 18.5, max: 25 },
  { label: 'Overweight',  range: '25 – 29.9', color: '#fbbf24', min: 25, max: 30 },
  { label: 'Obese',       range: '≥ 30', color: '#f87171', min: 30, max: 45 },
]

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max)
}

function bmiToPercent(bmi) {
  const MIN = 10
  const MAX = 45
  return ((clamp(bmi, MIN, MAX) - MIN) / (MAX - MIN)) * 100
}

export default function BMIGauge({ bmi, category }) {
  const percent = bmiToPercent(bmi)
  const cat = CATEGORIES.find((c) => c.label === category) || CATEGORIES[1]

  return (
    <div className="w-full space-y-3">
      {/* Bar */}
      <div className="relative h-5 rounded-full overflow-hidden flex">
        {CATEGORIES.map((c) => {
          const width = ((c.max - c.min) / (45 - 10)) * 100
          return (
            <div
              key={c.label}
              style={{ width: `${width}%`, backgroundColor: c.color }}
              className="h-full opacity-30"
            />
          )
        })}
        {/* Needle */}
        <div
          className="absolute top-0 bottom-0 w-1 rounded-full bg-gray-800 shadow-md transition-all duration-700 ease-out"
          style={{ left: `calc(${percent}% - 2px)` }}
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs text-gray-400 font-medium">
        <span>10</span>
        <span>18.5</span>
        <span>25</span>
        <span>30</span>
        <span>45+</span>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2 mt-1">
        {CATEGORIES.map((c) => (
          <span
            key={c.label}
            className="px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200"
            style={{
              backgroundColor: c.label === category ? cat.color : undefined,
              color: c.label === category ? '#fff' : '#9ca3af',
              border: `1.5px solid ${c.label === category ? cat.color : '#e5e7eb'}`,
            }}
          >
            {c.label} ({c.range})
          </span>
        ))}
      </div>
    </div>
  )
}

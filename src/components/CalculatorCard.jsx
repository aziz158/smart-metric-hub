import { Link } from 'react-router-dom'
import { HiArrowRight, HiLockClosed } from 'react-icons/hi'

export default function CalculatorCard({ icon: Icon, title, description, to, available = true }) {
  if (!available) {
    return (
      <div className="card flex flex-col gap-4 opacity-60 cursor-not-allowed select-none">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
            <Icon className="text-2xl text-gray-400" />
          </div>
          <span className="flex items-center gap-1 text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
            <HiLockClosed className="text-xs" />
            Coming soon
          </span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-500">{title}</h3>
          <p className="mt-1 text-sm text-gray-400">{description}</p>
        </div>
      </div>
    )
  }

  return (
    <Link
      to={to}
      className="card flex flex-col gap-4 group hover:shadow-md hover:border-blue-100
                 transition-all duration-200 ease-in-out cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center
                        group-hover:bg-blue-100 transition-colors">
          <Icon className="text-2xl text-blue-600" />
        </div>
        <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
          Available
        </span>
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
      <div className="flex items-center gap-1 text-sm font-medium text-blue-600
                      group-hover:gap-2 transition-all duration-200">
        Open Calculator
        <HiArrowRight />
      </div>
    </Link>
  )
}

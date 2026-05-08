import { Link } from 'react-router-dom'
import { TbMathFunction } from 'react-icons/tb'

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <TbMathFunction className="text-xl" />
            <span>Smart Metric Hub</span>
          </Link>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Smart Metric Hub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

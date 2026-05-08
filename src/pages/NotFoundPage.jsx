import { Link } from 'react-router-dom'
import { HiHome } from 'react-icons/hi'

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <p className="text-7xl font-extrabold text-blue-100">404</p>
      <h1 className="mt-4 text-2xl font-bold text-gray-900">Page Not Found</h1>
      <p className="mt-2 text-gray-500 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link to="/" className="btn-primary mt-8">
        <HiHome />
        Back to Home
      </Link>
    </div>
  )
}

import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import BMICalculatorPage from './pages/BMICalculatorPage'
import TreadmillCalculatorPage from './pages/TreadmillCalculatorPage'
import MealIntakeCalculatorPage from './pages/MealIntakeCalculatorPage'
import CalorieBurnedCalculatorPage from './pages/CalorieBurnedCalculatorPage'
import SleepCalculatorPage from './pages/SleepCalculatorPage'
import NotFoundPage from './pages/NotFoundPage'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/bmi-calculator" element={<BMICalculatorPage />} />
        <Route path="/treadmill-calculator" element={<TreadmillCalculatorPage />} />
        <Route path="/meal-intake-calculator" element={<MealIntakeCalculatorPage />} />
        <Route path="/calorie-burned-calculator" element={<CalorieBurnedCalculatorPage />} />
        <Route path="/sleep-calculator" element={<SleepCalculatorPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <AnimatedRoutes />
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

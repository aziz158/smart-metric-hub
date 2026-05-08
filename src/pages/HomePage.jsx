import { Link } from 'react-router-dom'
import { TbRulerMeasure, TbWalk, TbSalad, TbDroplet, TbFlame, TbArrowRight } from 'react-icons/tb'
import { GiMuscleUp } from 'react-icons/gi'
import { MdStraighten } from 'react-icons/md'
import { HiSparkles } from 'react-icons/hi'
import CalculatorCard from '../components/CalculatorCard'

const calculators = [
  {
    icon: TbRulerMeasure,
    title: 'BMI Calculator',
    description: 'Calculate your Body Mass Index using height and weight. Understand your weight category instantly.',
    to: '/bmi-calculator',
    available: true,
  },
  {
    icon: TbWalk,
    title: 'Treadmill Calculator',
    description: 'Estimate calories burned and distance covered during treadmill workouts.',
    to: '/treadmill-calculator',
    available: true,
  },
  {
    icon: TbSalad,
    title: 'Meal Intake Calculator',
    description: 'Plan your daily meal intake based on your nutritional goals and dietary needs.',
    to: '/meal-intake-calculator',
    available: true,
  },
  {
    icon: GiMuscleUp,
    title: 'Macro Calculator',
    description: 'Calculate your daily macronutrient targets for protein, carbs, and fats.',
    to: '/macro-calculator',
    available: false,
  },
  {
    icon: TbFlame,
    title: 'Calorie Burned Calculator',
    description: 'Estimate calories burned during 17 activities using MET-based calculations.',
    to: '/calorie-burned-calculator',
    available: true,
  },
  {
    icon: TbDroplet,
    title: 'Water Intake Calculator',
    description: 'Determine your optimal daily water intake based on body weight and activity.',
    to: '/water-intake-calculator',
    available: false,
  },
]

const stats = [
  { value: '8+', label: 'Calculators' },
  { value: '100%', label: 'Free to Use' },
  { value: '0', label: 'Sign-ups Needed' },
]

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20
                          text-white text-sm font-medium px-4 py-2 rounded-full mb-6">
            <HiSparkles />
            All-in-one metric platform
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6">
            Your Smart Hub for
            <br />
            <span className="text-blue-200">Health & Fitness Metrics</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-blue-100 leading-relaxed mb-10">
            Your all-in-one smart calculator platform for health, fitness, and daily metrics.
            Fast, accurate, and completely free — no sign-up required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/bmi-calculator" className="btn-primary bg-white text-blue-700 hover:bg-blue-50 text-base px-8 py-4">
              Try BMI Calculator
              <TbArrowRight className="text-lg" />
            </Link>
            <a
              href="#calculators"
              className="btn-secondary bg-white/10 text-white border border-white/20 hover:bg-white/20 text-base px-8 py-4"
            >
              Browse All Tools
            </a>
          </div>

          {/* Stats */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mt-16">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-extrabold text-white">{value}</div>
                <div className="text-sm text-blue-200 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Calculators grid */}
      <section id="calculators" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Calculator Tools</h2>
          <p className="mt-3 text-gray-500 text-lg max-w-xl mx-auto">
            Choose a calculator to get started. New tools are added regularly.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {calculators.map((calc) => (
            <CalculatorCard key={calc.title} {...calc} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Choose a Calculator', desc: 'Pick a tool from the homepage that matches your health or fitness need.' },
              { step: '2', title: 'Enter Your Details', desc: 'Fill in your measurements using metric or imperial units — your choice.' },
              { step: '3', title: 'Get Instant Results', desc: 'Receive accurate calculations with clear health insights in seconds.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white text-xl font-bold flex items-center justify-center shadow-lg shadow-blue-200">
                  {step}
                </div>
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

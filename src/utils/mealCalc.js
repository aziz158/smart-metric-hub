// ─── BMR — Mifflin-St Jeor ────────────────────────────────────────────────────
export function calcBMR(weightKg, heightCm, age, gender) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  return Math.round(gender === 'male' ? base + 5 : base - 161)
}

// ─── TDEE ─────────────────────────────────────────────────────────────────────
export function calcTDEE(bmr, multiplier) {
  return Math.round(bmr * multiplier)
}

// ─── Macros (protein/carbs @ 4 kcal/g, fat @ 9 kcal/g) ──────────────────────
export function calcMacros(calories, proteinPct, carbsPct, fatPct) {
  return {
    protein: Math.round((calories * proteinPct) / 4),
    carbs:   Math.round((calories * carbsPct)   / 4),
    fat:     Math.round((calories * fatPct)     / 9),
  }
}

// ─── Water recommendation (35 ml per kg body weight) ─────────────────────────
export function calcWater(weightKg) {
  return Math.round(weightKg * 35)
}

// ─── Activity levels ──────────────────────────────────────────────────────────
export const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Sedentary',          desc: 'Little or no exercise',       multiplier: 1.2   },
  { id: 'light',     label: 'Lightly Active',     desc: 'Light exercise 1–3 days/wk',  multiplier: 1.375 },
  { id: 'moderate',  label: 'Moderately Active',  desc: 'Moderate exercise 3–5 days/wk', multiplier: 1.55 },
  { id: 'very',      label: 'Very Active',        desc: 'Hard exercise 6–7 days/wk',   multiplier: 1.725 },
  { id: 'extreme',   label: 'Extremely Active',   desc: 'Physical job + daily training', multiplier: 1.9  },
]

// ─── Fitness goals ────────────────────────────────────────────────────────────
export const GOALS = [
  {
    id: 'lose',
    label: 'Lose Weight',
    tagline: 'Calorie deficit',
    adjust: -400,
    protein: 0.40,
    carbs:   0.30,
    fat:     0.30,
    color: 'rose',
  },
  {
    id: 'maintain',
    label: 'Maintain Weight',
    tagline: 'Calorie balance',
    adjust: 0,
    protein: 0.30,
    carbs:   0.40,
    fat:     0.30,
    color: 'emerald',
  },
  {
    id: 'gain',
    label: 'Gain Muscle',
    tagline: 'Calorie surplus',
    adjust: +350,
    protein: 0.30,
    carbs:   0.45,
    fat:     0.25,
    color: 'blue',
  },
]

// ─── Macro presets (label → { protein, carbs, fat } as fractions) ─────────────
export const MACRO_PRESETS = [
  { id: 'goal',       label: 'Goal Default' },
  { id: 'highprotein',label: 'High Protein',  protein: 0.40, carbs: 0.35, fat: 0.25 },
  { id: 'balanced',   label: 'Balanced',      protein: 0.30, carbs: 0.40, fat: 0.30 },
  { id: 'highcarb',   label: 'High Carb',     protein: 0.25, carbs: 0.50, fat: 0.25 },
  { id: 'custom',     label: 'Custom' },
]

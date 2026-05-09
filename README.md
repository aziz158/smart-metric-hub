# Smart Metric Hub

A modern, mobile-first React web application that brings together health, fitness, and everyday metric tools in one clean platform. Built for speed and simplicity — no sign-up, no tracking, just fast and accurate calculations.

---

## Live Tools

| Calculator | Route | Description |
|---|---|---|
| BMI Calculator | `/bmi-calculator` | Body Mass Index with colour-coded result gauge |
| Treadmill Calculator | `/treadmill-calculator` | Pace, speed, distance, duration & calories |
| Meal Intake Calculator | `/meal-intake-calculator` | Daily calories, macros & water via BMR/TDEE |
| Sleep Calculator | `/sleep-calculator` | Ideal bedtime and wake-up times via sleep cycles |
| Calorie Burned Calculator | `/calorie-burned-calculator` | MET-based burn estimates across 17 activities |
| Universal Converter | `/universal-converter` | Unit conversion across 9 categories |

---

## Features

- **Real-time results** — calculations update instantly as you type
- **Metric & Imperial support** — every calculator respects your preferred unit system
- **Responsive design** — optimised for mobile (320 px) through desktop
- **Smooth animations** — page transitions, scroll-triggered fade-ins and result reveals powered by Framer Motion
- **Adaptive navigation** — ArrowScroller automatically shows all tabs when space allows and switches to a single-item picker with directional slide animation when space is tight
- **No account required** — open the URL and start calculating

---

## Tech Stack

| Layer | Library / Tool |
|---|---|
| Framework | [React 18](https://react.dev) |
| Build tool | [Vite 5](https://vitejs.dev) |
| Routing | [React Router DOM 6](https://reactrouter.com) |
| Styling | [Tailwind CSS 3](https://tailwindcss.com) |
| Animations | [Framer Motion 12](https://www.framer.com/motion) |
| Icons | [React Icons 5](https://react-icons.github.io/react-icons) |

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm 9 or later

### Installation

```bash
# Clone the repository
git clone https://github.com/aziz158/smart-metric-hub.git
cd smart-metric-hub

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be running at **http://localhost:5173**.

### Available Scripts

```bash
npm run dev      # Start development server with hot reload
npm run build    # Build optimised production bundle
npm run preview  # Preview the production build locally
```

---

## Project Structure

```
smart-metric-hub/
├── public/
│   └── favicon.svg
└── src/
    ├── components/              # Shared UI components
    │   ├── ArrowScroller.jsx    # Responsive tab/chip navigator
    │   ├── BMIGauge.jsx         # Colour-coded BMI progress bar
    │   ├── CalculatorCard.jsx   # Homepage tool card with hover animation
    │   ├── Footer.jsx
    │   ├── Header.jsx           # Sticky nav with mobile hamburger menu
    │   ├── PageTransition.jsx   # Route-level fade + slide wrapper
    │   └── ScrollFade.jsx       # Scroll-triggered in/out fade wrapper
    ├── data/
    │   ├── activities.js        # 17 activities with MET values and icons
    │   └── converterData.js     # 9 unit categories, factors and formatter
    ├── pages/
    │   ├── HomePage.jsx
    │   ├── BMICalculatorPage.jsx
    │   ├── TreadmillCalculatorPage.jsx
    │   ├── MealIntakeCalculatorPage.jsx
    │   ├── SleepCalculatorPage.jsx
    │   ├── CalorieBurnedCalculatorPage.jsx
    │   ├── UniversalConverterPage.jsx
    │   └── NotFoundPage.jsx
    ├── utils/
    │   ├── treadmillCalc.js     # Pace, speed, distance, MET helpers
    │   ├── mealCalc.js          # BMR, TDEE, macro and water calculations
    │   ├── sleepCalc.js         # Sleep cycle timing logic
    │   └── calorieCalc.js       # MET-based calorie burn and intensity
    ├── App.jsx                  # Router + AnimatePresence setup
    ├── main.jsx
    └── index.css                # Tailwind directives + global utilities
```

---

## Calculator Details

### BMI Calculator
Calculates Body Mass Index using the standard WHO formula for both metric and imperial inputs. Results include a colour-coded category gauge (Underweight / Normal / Overweight / Obese) with a health interpretation, and an animated BMI needle that updates on each calculation.

### Treadmill Calculator
Four tabs covering every treadmill metric:
- **Workout Summary** — enter speed, duration, incline, and body weight to get distance, pace, speed in both units, calories burned, and a workout intensity bar. Includes six quick-start presets.
- **Pace & Speed** — distance + time to pace per mile and per km, average speed.
- **Distance** — speed + time to distance in miles and km.
- **Duration** — speed + distance to time needed.

Calorie estimation uses MET values adjusted for treadmill incline.

### Meal Intake Calculator
Estimates daily nutrition targets using the **Mifflin-St Jeor** equation:

1. BMR from age, gender, height, and weight
2. TDEE via activity multiplier (Sedentary to Extremely Active)
3. Calorie target adjusted for goal (-400 kcal lose / 0 maintain / +350 kcal gain)
4. Macros split by goal (Lose Weight: 40% protein / 30% carbs / 30% fat)

Macro ratios are fully adjustable with preset profiles (High Protein, Balanced, High Carb, Custom sliders). Water intake recommendation included.

### Sleep Calculator
Three modes based on 90-minute sleep cycle science:
- **Bedtime** — enter your wake-up time; receive three colour-coded bedtime options (4 / 5 / 6 cycles = Minimum / Good / Optimal) with a 15-minute fall-asleep buffer.
- **Wake-Up** — enter your bedtime (or tap Sleep Now); receive recommended alarm times.
- **Sleep Duration** — enter sleep start and wake-up time; shows total sleep, completed cycles, and a mid-cycle grogginess warning.

Supports both 12-hour (AM/PM) and 24-hour display formats with a custom time input that updates immediately when the format toggle is changed.

### Calorie Burned Calculator
Estimates calories burned using the **Compendium of Physical Activities** MET values, adjusted for intensity:
- **17 activities** across Cardio, Strength, Outdoor, Sports, and Mind & Body categories
- **3 intensity levels** (Light / Moderate / Intense) each mapped to a distinct MET value
- Optional **distance input** for running, walking, and cycling adds calories-per-mile and calories-per-km breakdown
- Searchable activity grid with category filter

### Universal Converter
Instant real-time conversion across **9 categories** — all results update as you type:

| Category | Notable units |
|---|---|
| Length | mm, cm, m, km, in, ft, yd, mi, nmi |
| Weight | mg, g, kg, t, oz, lb, st |
| Speed | m/s, km/h, mph, knots, ft/s |
| Temperature | Celsius, Fahrenheit, Kelvin (non-linear formula) |
| Time | ns, ms, s, min, h, d, wk, mo, yr |
| Area | mm2 to mi2, hectare, acre |
| Power | W, kW, MW, hp, BTU/h |
| Volume | mL, L, m3, gal, qt, pt, cup, fl oz |
| Pressure | Pa, kPa, MPa, bar, atm, psi, mmHg |

The Swap button exchanges From/To units and seeds the result as the new input value. An All Conversions panel shows every unit at once with one-click copy.

---

## Roadmap

- [ ] Macro Calculator
- [ ] Water Intake Calculator
- [ ] Pace Calculator
- [ ] Save workout and calculation history to local storage
- [ ] Dark mode
- [ ] Weekly analytics dashboard

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

## License

This project is open source and available under the [MIT License](LICENSE).
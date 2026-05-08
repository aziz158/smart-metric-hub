import {
  TbRun, TbWalk, TbBike, TbMountain, TbStairs,
  TbBarbell, TbFlame, TbMusic,
} from 'react-icons/tb'
import {
  MdPool, MdRowing, MdSportsBasketball,
  MdSportsSoccer, MdSportsTennis, MdFitnessCenter,
} from 'react-icons/md'
import { GiJumpingRope, GiMeditation, GiBoxingGlove } from 'react-icons/gi'

// MET values per intensity level (light / moderate / intense)
// Source: Compendium of Physical Activities (Ainsworth et al.)
export const ACTIVITIES = [
  // ── Cardio ────────────────────────────────────────────────────────────────
  {
    id: 'running', label: 'Running', category: 'Cardio',
    icon: TbRun, color: 'red',
    met: { light: 8.3, moderate: 10.5, intense: 12.8 },
    needsDistance: true,
  },
  {
    id: 'walking', label: 'Walking', category: 'Cardio',
    icon: TbWalk, color: 'green',
    met: { light: 2.5, moderate: 3.8, intense: 5.0 },
    needsDistance: true,
  },
  {
    id: 'cycling', label: 'Cycling', category: 'Cardio',
    icon: TbBike, color: 'blue',
    met: { light: 4.0, moderate: 7.5, intense: 12.0 },
    needsDistance: true,
  },
  {
    id: 'swimming', label: 'Swimming', category: 'Cardio',
    icon: MdPool, color: 'cyan',
    met: { light: 5.0, moderate: 8.0, intense: 10.0 },
    needsDistance: false,
  },
  {
    id: 'jumprope', label: 'Jump Rope', category: 'Cardio',
    icon: GiJumpingRope, color: 'orange',
    met: { light: 8.8, moderate: 11.8, intense: 14.0 },
    needsDistance: false,
  },
  {
    id: 'hiit', label: 'HIIT', category: 'Cardio',
    icon: TbFlame, color: 'rose',
    met: { light: 7.0, moderate: 10.0, intense: 14.0 },
    needsDistance: false,
  },
  {
    id: 'stairclimbing', label: 'Stair Climbing', category: 'Cardio',
    icon: TbStairs, color: 'amber',
    met: { light: 4.0, moderate: 8.8, intense: 12.0 },
    needsDistance: false,
  },
  {
    id: 'rowing', label: 'Rowing', category: 'Cardio',
    icon: MdRowing, color: 'sky',
    met: { light: 4.5, moderate: 7.0, intense: 11.0 },
    needsDistance: false,
  },
  // ── Strength ──────────────────────────────────────────────────────────────
  {
    id: 'weightlifting', label: 'Weight Lifting', category: 'Strength',
    icon: TbBarbell, color: 'indigo',
    met: { light: 3.5, moderate: 5.0, intense: 7.0 },
    needsDistance: false,
  },
  // ── Outdoor ───────────────────────────────────────────────────────────────
  {
    id: 'hiking', label: 'Hiking', category: 'Outdoor',
    icon: TbMountain, color: 'emerald',
    met: { light: 5.3, moderate: 6.5, intense: 8.0 },
    needsDistance: false,
  },
  // ── Mind & Body ───────────────────────────────────────────────────────────
  {
    id: 'yoga', label: 'Yoga', category: 'Mind & Body',
    icon: GiMeditation, color: 'purple',
    met: { light: 2.5, moderate: 3.5, intense: 5.0 },
    needsDistance: false,
  },
  {
    id: 'pilates', label: 'Pilates', category: 'Mind & Body',
    icon: MdFitnessCenter, color: 'pink',
    met: { light: 2.5, moderate: 3.8, intense: 5.0 },
    needsDistance: false,
  },
  {
    id: 'dancing', label: 'Dancing', category: 'Mind & Body',
    icon: TbMusic, color: 'fuchsia',
    met: { light: 3.0, moderate: 5.5, intense: 8.0 },
    needsDistance: false,
  },
  // ── Sports ────────────────────────────────────────────────────────────────
  {
    id: 'basketball', label: 'Basketball', category: 'Sports',
    icon: MdSportsBasketball, color: 'orange',
    met: { light: 5.0, moderate: 8.0, intense: 10.0 },
    needsDistance: false,
  },
  {
    id: 'soccer', label: 'Soccer', category: 'Sports',
    icon: MdSportsSoccer, color: 'lime',
    met: { light: 7.0, moderate: 10.0, intense: 13.0 },
    needsDistance: false,
  },
  {
    id: 'tennis', label: 'Tennis', category: 'Sports',
    icon: MdSportsTennis, color: 'yellow',
    met: { light: 5.0, moderate: 7.3, intense: 10.0 },
    needsDistance: false,
  },
  {
    id: 'martialarts', label: 'Martial Arts', category: 'Sports',
    icon: GiBoxingGlove, color: 'red',
    met: { light: 5.0, moderate: 8.5, intense: 12.0 },
    needsDistance: false,
  },
]

export const CATEGORIES = ['All', 'Cardio', 'Strength', 'Outdoor', 'Sports', 'Mind & Body']

// Tailwind colour classes per activity colour key
export const COLOR_CLASSES = {
  red:     { bg: 'bg-red-50',     icon: 'text-red-500',     ring: 'ring-red-400',     active: 'bg-red-100 border-red-400' },
  green:   { bg: 'bg-green-50',   icon: 'text-green-500',   ring: 'ring-green-400',   active: 'bg-green-100 border-green-400' },
  blue:    { bg: 'bg-blue-50',    icon: 'text-blue-500',    ring: 'ring-blue-400',    active: 'bg-blue-100 border-blue-400' },
  cyan:    { bg: 'bg-cyan-50',    icon: 'text-cyan-500',    ring: 'ring-cyan-400',    active: 'bg-cyan-100 border-cyan-400' },
  orange:  { bg: 'bg-orange-50',  icon: 'text-orange-500',  ring: 'ring-orange-400',  active: 'bg-orange-100 border-orange-400' },
  rose:    { bg: 'bg-rose-50',    icon: 'text-rose-500',    ring: 'ring-rose-400',    active: 'bg-rose-100 border-rose-400' },
  amber:   { bg: 'bg-amber-50',   icon: 'text-amber-500',   ring: 'ring-amber-400',   active: 'bg-amber-100 border-amber-400' },
  sky:     { bg: 'bg-sky-50',     icon: 'text-sky-500',     ring: 'ring-sky-400',     active: 'bg-sky-100 border-sky-400' },
  indigo:  { bg: 'bg-indigo-50',  icon: 'text-indigo-500',  ring: 'ring-indigo-400',  active: 'bg-indigo-100 border-indigo-400' },
  emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-500', ring: 'ring-emerald-400', active: 'bg-emerald-100 border-emerald-400' },
  purple:  { bg: 'bg-purple-50',  icon: 'text-purple-500',  ring: 'ring-purple-400',  active: 'bg-purple-100 border-purple-400' },
  pink:    { bg: 'bg-pink-50',    icon: 'text-pink-500',    ring: 'ring-pink-400',    active: 'bg-pink-100 border-pink-400' },
  fuchsia: { bg: 'bg-fuchsia-50', icon: 'text-fuchsia-500', ring: 'ring-fuchsia-400', active: 'bg-fuchsia-100 border-fuchsia-400' },
  lime:    { bg: 'bg-lime-50',    icon: 'text-lime-600',    ring: 'ring-lime-400',    active: 'bg-lime-100 border-lime-400' },
  yellow:  { bg: 'bg-yellow-50',  icon: 'text-yellow-600',  ring: 'ring-yellow-400',  active: 'bg-yellow-100 border-yellow-400' },
}

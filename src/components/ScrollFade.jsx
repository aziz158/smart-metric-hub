import { motion } from 'framer-motion'

/**
 * Fades children in when they enter the viewport and fades them back
 * out when they scroll away (once: false).
 */
export default function ScrollFade({
  children,
  className,
  delay = 0,
  duration = 0.45,
  y = 18,
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: '-80px' }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  )
}

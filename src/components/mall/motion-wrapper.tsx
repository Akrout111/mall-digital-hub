'use client'

import { motion, type HTMLMotionProps } from 'framer-motion'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

interface MotionDivProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode
}

export function MotionDiv({ children, ...props }: MotionDivProps) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <div className={props.className}>{children}</div>
  }

  return <motion.div {...props}>{children}</motion.div>
}

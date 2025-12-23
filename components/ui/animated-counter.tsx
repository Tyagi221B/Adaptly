"use client"

import CountUp from "react-countup"
import { useInView } from "react-intersection-observer"

interface AnimatedCounterProps {
  value: number
  duration?: number
  separator?: string
  suffix?: string
  decimals?: number
}

export function AnimatedCounter({
  value,
  duration = 1.5,
  separator = ",",
  suffix = "",
  decimals = 0,
}: AnimatedCounterProps) {
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: true,
  })

  return (
    <span ref={ref}>
      {inView ? (
        <CountUp
          end={value}
          duration={duration}
          separator={separator}
          suffix={suffix}
          decimals={decimals}
        />
      ) : (
        <span>0{suffix}</span>
      )}
    </span>
  )
}

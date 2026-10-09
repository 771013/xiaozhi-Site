import { useEffect, useRef } from 'react'

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export function easeOutQuart(progress) {
  const value = clamp(progress, 0, 1)
  return 1 - ((1 - value) ** 4)
}

export function countAtProgress(target, progress) {
  return Math.round(target * easeOutQuart(progress))
}

export function getActiveCarIndex(progress, count) {
  if (count <= 1) return 0
  return Math.round(clamp(progress, 0, 1) * (count - 1))
}

export function getCarPose(index, progress, count = 5) {
  const stage = clamp(progress, 0, 1) * (count - 1)
  const distance = index - stage
  const focus = Math.max(0, 1 - Math.abs(distance))

  return {
    x: 20 + (distance * 278),
    scale: 1 + (focus * 0.55),
    opacity: clamp(1 - (Math.abs(distance) * 0.16), 0.38, 1),
    zIndex: Math.max(1, 20 - Math.round(Math.abs(distance) * 3)),
  }
}

export function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function useCountUp(target, duration = 2000) {
  const valueRef = useRef(null)

  useEffect(() => {
    const node = valueRef.current
    if (!node) return undefined

    let frame = 0
    let observer
    let started = false

    const showFinalValue = () => { node.textContent = String(target) }

    if (prefersReducedMotion() || typeof IntersectionObserver !== 'function') {
      showFinalValue()
      return undefined
    }

    node.textContent = '0'
    const startCounting = () => {
      if (started) return
      started = true
      let startTime
      const tick = (time) => {
        startTime ??= time
        const progress = clamp((time - startTime) / duration, 0, 1)
        node.textContent = String(countAtProgress(target, progress))
        if (progress < 1) frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    }

    observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        startCounting()
        observer.disconnect()
      }
    }, { threshold: 0.35 })
    observer.observe(node)

    return () => {
      observer?.disconnect()
      if (frame) cancelAnimationFrame(frame)
    }
  }, [duration, target])

  return valueRef
}

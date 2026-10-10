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
  const cardWidth = 258
  const cardGap = 18
  const focusedExtraWidth = cardWidth * 0.55
  const trailingOffset = clamp(distance, 0, 1) * focusedExtraWidth

  return {
    x: (distance * (cardWidth + cardGap)) + trailingOffset,
    scale: 1 + (focus * 0.55),
    opacity: clamp(1 - (Math.abs(distance) * 0.16), 0.38, 1),
    zIndex: Math.max(1, 20 - Math.round(Math.abs(distance) * 3)),
  }
}

const LOOP_CARD_WIDTH = 258
const LOOP_CARD_GAP = 18
const LOOP_CARD_STEP = LOOP_CARD_WIDTH + LOOP_CARD_GAP
const LOOP_FOCUS_RANGE = 0.38
const LOOP_MAX_HOLD_HALF_RANGE = 0.07
const LOOP_MAX_SCALE = 1.42

function wrapDistance(value, range) {
  return ((((value + (range / 2)) % range) + range) % range) - (range / 2)
}

function getLoopCarFocus(distance) {
  const transitionRange = LOOP_FOCUS_RANGE - LOOP_MAX_HOLD_HALF_RANGE
  const progress = clamp(
    (LOOP_FOCUS_RANGE - Math.abs(distance)) / transitionRange,
    0,
    1,
  )

  return progress * progress * (3 - (2 * progress))
}

export function getTypewriterFrame(elapsedMs, phrases, options = {}) {
  const values = phrases.filter(Boolean)
  if (!values.length) return { text: '', phraseIndex: 0, caretVisible: false }

  const preHoldMs = Math.max(0, options.preHoldMs ?? 1000)
  const typeMs = Math.max(1, options.typeMs ?? 90)
  const holdMs = Math.max(0, options.holdMs ?? 1000)
  const eraseMs = Math.max(1, options.eraseMs ?? 50)
  const caretMs = Math.max(1, options.caretMs ?? 250)
  const durations = values.map((phrase) => preHoldMs + (phrase.length * typeMs) + holdMs + (phrase.length * eraseMs))
  const totalDuration = durations.reduce((total, duration) => total + duration, 0)
  let localTime = ((Math.max(0, elapsedMs) % totalDuration) + totalDuration) % totalDuration
  let phraseIndex = 0

  while (localTime >= durations[phraseIndex] && phraseIndex < values.length - 1) {
    localTime -= durations[phraseIndex]
    phraseIndex += 1
  }

  const phrase = values[phraseIndex]
  const typeDuration = phrase.length * typeMs
  const typeEnd = preHoldMs + typeDuration
  const holdEnd = typeEnd + holdMs
  let characterCount

  if (localTime < preHoldMs) {
    characterCount = 0
  } else if (localTime < typeEnd) {
    characterCount = Math.min(phrase.length, Math.floor((localTime - preHoldMs) / typeMs) + 1)
  } else if (localTime < holdEnd) {
    characterCount = phrase.length
  } else {
    characterCount = Math.max(0, phrase.length - Math.floor((localTime - holdEnd) / eraseMs))
  }

  return {
    text: phrase.slice(0, characterCount),
    phraseIndex,
    caretVisible: Math.floor(Math.max(0, elapsedMs) / caretMs) % 2 === 0,
  }
}

export function getLoopCarFocusX(viewportWidth, shellWidth = 1200, gutter = 24) {
  return Math.max(gutter, (viewportWidth - shellWidth) / 2) + 72
}

export function advanceLoopPhase(phase, elapsedMs) {
  return phase + (Math.min(40, Math.max(0, elapsedMs)) * 0.08712)
}

export function getLoopCarPose(index, phase, count = 10, focusX = 320) {
  const total = LOOP_CARD_STEP * Math.max(1, count)
  const distance = wrapDistance((index * LOOP_CARD_STEP) - phase, total) / LOOP_CARD_STEP
  const focus = getLoopCarFocus(distance)
  const focusedDistance = distance - Math.round(distance)
  const focusedAmount = getLoopCarFocus(focusedDistance)
  const focusedExtraWidth = LOOP_CARD_WIDTH * (LOOP_MAX_SCALE - 1)
  const reservedWidth = focusedExtraWidth * focusedAmount
  const focusCompensation = focusedExtraWidth / 2
  const spacingOffset = distance > focusedDistance ? reservedWidth / 2 : -reservedWidth / 2

  return {
    x: focusX + focusCompensation + (distance * LOOP_CARD_STEP) + spacingOffset,
    scale: 1 + (focus * (LOOP_MAX_SCALE - 1)),
    focus,
    outline: clamp((focus - 0.72) / 0.28, 0, 1),
    opacity: 1,
    zIndex: Math.max(1, 20 - Math.round(Math.abs(distance) * 3)),
  }
}

export function getLoopCarIndex(phase, count = 10) {
  const size = Math.max(1, count)
  return ((Math.round(phase / LOOP_CARD_STEP) % size) + size) % size
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

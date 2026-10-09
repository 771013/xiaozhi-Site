import { describe, expect, it } from 'vitest'
import { clamp, countAtProgress, easeOutQuart } from './motion.js'

describe('motion helpers', () => {
  it('clamps values to the supplied range', () => {
    expect(clamp(-1, 0, 1)).toBe(0)
    expect(clamp(0.4, 0, 1)).toBe(0.4)
    expect(clamp(2, 0, 1)).toBe(1)
  })

  it('uses a smooth quartic ease without overshooting', () => {
    expect(easeOutQuart(-0.2)).toBe(0)
    expect(easeOutQuart(0.5)).toBeCloseTo(0.9375)
    expect(easeOutQuart(1.2)).toBe(1)
  })

  it('calculates deterministic whole-number count-up frames', () => {
    expect(countAtProgress(50000, -1)).toBe(0)
    expect(countAtProgress(50000, 0.5)).toBe(46875)
    expect(countAtProgress(50000, 2)).toBe(50000)
  })
})

import { describe, expect, it } from 'vitest'
import { clamp, countAtProgress, easeOutQuart, getActiveCarIndex, getCarPose } from './motion.js'

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

  it('maps the scroll range across all five vehicle stages', () => {
    expect([-1, 0.26, 0.5, 0.74, 2].map((value) => getActiveCarIndex(value, 5))).toEqual([0, 1, 2, 3, 4])
  })

  it('keeps the focused vehicle pose symmetrical in both directions', () => {
    const firstDirection = getCarPose(1, 0.25)
    const reverseDirection = getCarPose(3, 0.75)

    expect(firstDirection.scale).toBe(reverseDirection.scale)
    expect(firstDirection.opacity).toBe(reverseDirection.opacity)
    expect(firstDirection.x).toBe(20)
    expect(getCarPose(0, 1).x).toBeLessThan(0)
  })
})

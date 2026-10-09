import { describe, expect, it } from 'vitest'
import { advanceLoopPhase, clamp, countAtProgress, easeOutQuart, getActiveCarIndex, getCarPose, getLoopCarFocusX, getLoopCarPose, getLoopCarIndex } from './motion.js'

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
    expect(firstDirection.x).toBe(0)
    expect(getCarPose(0, 1).x).toBeLessThan(0)
  })

  it('reserves space for the enlarged vehicle so adjacent cards do not stack', () => {
    const focused = getCarPose(0, 0)
    const next = getCarPose(1, 0)
    const following = getCarPose(2, 0)
    const focusedWidth = 258 * focused.scale

    expect(next.x - (focused.x + focusedWidth)).toBeCloseTo(18)
    expect(following.x - next.x).toBeCloseTo(276)
  })

  it('循环车型在相位跨过一轮后保持相同位置并切换焦点', () => {
    const first = getLoopCarPose(3, 3 * 276, 10)
    const wrapped = getLoopCarPose(3, 3 * 276 + (10 * 276), 10)

    expect(wrapped.x).toBeCloseTo(first.x, 4)
    expect(wrapped.scale).toBeCloseTo(first.scale, 4)
    expect(getLoopCarIndex(3 * 276, 10)).toBe(3)
    expect(getLoopCarIndex(4 * 276, 10)).toBe(4)
  })

  it('循环车型焦点右侧保留放大卡片后的间距', () => {
    const active = getLoopCarPose(3, 3 * 276, 10)
    const next = getLoopCarPose(4, 3 * 276, 10)

    expect(next.x - (active.x + 258 * active.scale)).toBeCloseTo(18, 4)
  })

  it('循环车型焦点落在全宽舞台的版心左边缘', () => {
    expect(getLoopCarFocusX(1440)).toBe(120)
    expect(getLoopCarFocusX(1280)).toBe(40)
    expect(getLoopCarFocusX(1024)).toBe(24)

    const focused = getLoopCarPose(3, 3 * 276, 10, getLoopCarFocusX(1440))
    expect(focused.x).toBe(120)
  })

  it('循环车型以更紧凑的节奏经过放大焦点', () => {
    expect(advanceLoopPhase(0, 16)).toBeCloseTo(0.64)
    expect(advanceLoopPhase(10, 100)).toBeCloseTo(11.6)
  })
})

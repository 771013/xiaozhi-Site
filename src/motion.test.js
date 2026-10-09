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

  it('循环车型在缩放补位期间持续向左，不出现停顿或回退', () => {
    for (const index of [3, 4]) {
      const positions = [2.7, 2.8, 2.9, 3, 3.1]
        .map((phase) => getLoopCarPose(index, phase * 276, 10).x)

      positions.slice(1).forEach((position, positionIndex) => {
        expect(position).toBeLessThan(positions[positionIndex])
      })
    }
  })

  it('循环车型在放大移动的全过程中保持固定基础间距', () => {
    for (const phase of [3.5, 3.65, 3.8, 4].map((value) => value * 276)) {
      const focused = getLoopCarPose(4, phase, 10)
      const next = getLoopCarPose(5, phase, 10)

      expect(next.x - (focused.x + 258 * focused.scale)).toBeCloseTo(18, 4)
    }
  })

  it('所有循环车型保持完全不透明，小卡不显示白色描边', () => {
    const small = getLoopCarPose(6, 3 * 276, 10)
    const growing = getLoopCarPose(4, 3.75 * 276, 10)

    expect(small.opacity).toBe(1)
    expect(small.outline).toBe(0)
    expect(growing.outline).toBe(0)
  })

  it('循环车型跨过相邻位置中点后才开始放大并在焦点后缩小', () => {
    const halfway = getLoopCarPose(4, 3.5 * 276, 10)
    const outsideShortWindow = getLoopCarPose(4, 3.55 * 276, 10)
    const approaching = getLoopCarPose(4, 3.75 * 276, 10)
    const focused = getLoopCarPose(4, 4 * 276, 10)
    const leaving = getLoopCarPose(4, 4.25 * 276, 10)

    expect(halfway.scale).toBeCloseTo(1)
    expect(outsideShortWindow.scale).toBeCloseTo(1)
    expect(approaching.scale).toBeGreaterThan(halfway.scale)
    expect(focused.scale).toBeCloseTo(1.55)
    expect(focused.focus).toBeCloseTo(1)
    expect(focused.outline).toBeCloseTo(1)
    expect(approaching.outline).toBe(0)
    expect(leaving.scale).toBeCloseTo(approaching.scale)
  })

  it('循环车型焦点落在全宽舞台的版心左边缘', () => {
    expect(getLoopCarFocusX(1440)).toBe(120)
    expect(getLoopCarFocusX(1280)).toBe(40)
    expect(getLoopCarFocusX(1024)).toBe(24)

    const focused = getLoopCarPose(3, 3 * 276, 10, getLoopCarFocusX(1440))
    expect(focused.x).toBeCloseTo(120, 4)
  })

  it('循环车型以更紧凑的节奏经过放大焦点', () => {
    expect(advanceLoopPhase(0, 16)).toBeCloseTo(1.2672)
    expect(advanceLoopPhase(10, 100)).toBeCloseTo(13.168)
  })
})

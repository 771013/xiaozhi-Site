import { describe, expect, it } from 'vitest'
import { advanceLoopPhase, clamp, countAtProgress, easeOutQuart, getActiveCarIndex, getCarPose, getLoopCarFocusX, getLoopCarPose, getLoopCarIndex } from './motion.js'
import * as motion from './motion.js'

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

  it('循环车型在放大移动的全过程中保持固定基础间距', () => {
    for (const phase of Array.from({ length: 51 }, (_, step) => (3.5 + (step * 0.02)) * 276)) {
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
    const approaching = getLoopCarPose(4, 3.8 * 276, 10)
    const focused = getLoopCarPose(4, 4 * 276, 10)
    const leaving = getLoopCarPose(4, 4.2 * 276, 10)

    expect(halfway.scale).toBeCloseTo(1)
    expect(outsideShortWindow.scale).toBeCloseTo(1)
    expect(approaching.scale).toBeGreaterThan(halfway.scale)
    expect(focused.scale).toBeCloseTo(1.55)
    expect(focused.focus).toBeCloseTo(1)
    expect(focused.outline).toBeCloseTo(1)
    expect(approaching.outline).toBe(0)
    expect(leaving.scale).toBeCloseTo(approaching.scale)
  })

  it('循环车型再次加快缩放 50% 并将最大尺寸停留时间减半', () => {
    const outsideWindow = getLoopCarPose(4, 3.75 * 276, 10)
    const transition = getLoopCarPose(4, 3.8 * 276, 10)
    const approachingPlateau = getLoopCarPose(4, 3.94 * 276, 10)
    const leavingPlateau = getLoopCarPose(4, 4.06 * 276, 10)
    const outsidePlateau = getLoopCarPose(4, 3.93 * 276, 10)

    expect(outsideWindow.focus).toBe(0)
    expect(transition.focus).toBeCloseTo(0.25, 4)
    expect(approachingPlateau.scale).toBeCloseTo(1.55, 4)
    expect(leavingPlateau.scale).toBeCloseTo(1.55, 4)
    expect(outsidePlateau.scale).toBeLessThan(1.55)
  })

  it('首屏轮播每句输入前后各停留 1 秒并闪烁两次光标', () => {
    expect(motion.getTypewriterFrame).toBeTypeOf('function')
    const phrases = ['租车更省心', '选车更明白', '好车放心开']
    const options = { typeMs: 100, eraseMs: 50 }

    expect(motion.getTypewriterFrame?.(0, phrases, options)).toMatchObject({ text: '', phraseIndex: 0, caretVisible: true })
    expect(motion.getTypewriterFrame?.(250, phrases, options)).toMatchObject({ text: '', caretVisible: false })
    expect(motion.getTypewriterFrame?.(500, phrases, options)).toMatchObject({ text: '', caretVisible: true })
    expect(motion.getTypewriterFrame?.(750, phrases, options)).toMatchObject({ text: '', caretVisible: false })
    expect(motion.getTypewriterFrame?.(1000, phrases, options).text).toBe('租')
    expect(motion.getTypewriterFrame?.(1400, phrases, options).text).toBe('租车更省心')
    expect(motion.getTypewriterFrame?.(2499, phrases, options).text).toBe('租车更省心')
    expect(motion.getTypewriterFrame?.(2550, phrases, options).text).toBe('租车更省')
    expect(motion.getTypewriterFrame?.(2750, phrases, options)).toMatchObject({ text: '', phraseIndex: 1 })
  })

  it('循环车型焦点在版心内侧右移 72px', () => {
    expect(getLoopCarFocusX(1440)).toBe(192)
    expect(getLoopCarFocusX(1280)).toBe(112)
    expect(getLoopCarFocusX(1024)).toBe(96)

    const focused = getLoopCarPose(3, 3 * 276, 10, getLoopCarFocusX(1440))
    expect(focused.x).toBeCloseTo(192, 4)
  })

  it('循环车型的放大缩小过程保持在版心内', () => {
    const shellLeft = 120
    const shellRight = 1320
    const focusX = getLoopCarFocusX(1440)
    const poses = [2.6, 2.8, 3, 3.2, 3.4]
      .map((phase) => getLoopCarPose(3, phase * 276, 10, focusX))

    poses.forEach((pose) => {
      expect(pose.x).toBeGreaterThanOrEqual(shellLeft)
      expect(pose.x + (258 * pose.scale)).toBeLessThanOrEqual(shellRight)
    })
  })

  it('循环车型在当前节奏上再加快 10%', () => {
    expect(advanceLoopPhase(0, 16)).toBeCloseTo(1.39392)
    expect(advanceLoopPhase(10, 100)).toBeCloseTo(13.4848)
  })
})

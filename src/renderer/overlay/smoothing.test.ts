import { describe, expect, it } from 'vitest'
import { smoothTowards } from './smoothing'

describe('smoothTowards', () => {
  it('snaps to the target without smoothing', () => {
    expect(smoothTowards(0, 90, 0, 16)).toBe(90)
  })

  it('keeps the configured share of the distance per 60 fps frame', () => {
    expect(smoothTowards(0, 100, 0.5, 1000 / 60)).toBeCloseTo(50)
  })

  it('is frame-rate independent', () => {
    const oneStep = smoothTowards(0, 100, 0.5, (2 * 1000) / 60)
    const twoSteps = smoothTowards(smoothTowards(0, 100, 0.5, 1000 / 60), 100, 0.5, 1000 / 60)
    expect(oneStep).toBeCloseTo(twoSteps)
  })

  it('settles exactly on the target when close enough', () => {
    expect(smoothTowards(89.98, 90, 0.9, 16)).toBe(90)
  })

  it('does not move when no time has passed', () => {
    expect(smoothTowards(10, 90, 0.5, 0)).toBe(10)
  })
})

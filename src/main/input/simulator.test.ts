import { describe, expect, it } from 'vitest'
import { SIMULATOR_CYCLE_MS, simulatedInput } from './simulator'

describe('simulatedInput', () => {
  it('stays within the normalized ranges for a full lap of cycles', () => {
    for (let t = 0; t < SIMULATOR_CYCLE_MS * 4; t += 7) {
      const input = simulatedInput(t)
      expect(Math.abs(input.steering)).toBeLessThanOrEqual(1)
      for (const pedal of [input.throttle, input.brake, input.clutch]) {
        expect(pedal).toBeGreaterThanOrEqual(0)
        expect(pedal).toBeLessThanOrEqual(1)
      }
    }
  })

  it('never applies full throttle and brake together', () => {
    for (let t = 0; t < SIMULATOR_CYCLE_MS * 2; t += 5) {
      const { throttle, brake } = simulatedInput(t)
      expect(throttle > 0 && brake > 0).toBe(false)
    }
  })

  it('alternates corner direction between cycles', () => {
    const apex = SIMULATOR_CYCLE_MS * 0.68
    expect(simulatedInput(apex).steering).toBeGreaterThan(0.3)
    expect(simulatedInput(SIMULATOR_CYCLE_MS + apex).steering).toBeLessThan(-0.3)
  })
})

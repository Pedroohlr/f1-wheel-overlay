import { describe, expect, it } from 'vitest'
import {
  DEFAULT_G29_MAPPING,
  inputChanged,
  NEUTRAL_INPUT,
  normalizeInput,
  normalizePedal,
  normalizeSteering,
  type RawJoystickState
} from './input'

const raw = (...axes: number[]): RawJoystickState => ({ axes, buttons: [] })

describe('normalizeSteering', () => {
  const mapping = DEFAULT_G29_MAPPING.steering

  it('maps the raw range to -1..1', () => {
    expect(normalizeSteering(raw(-1), mapping)).toBe(-1)
    expect(normalizeSteering(raw(0), mapping)).toBe(0)
    expect(normalizeSteering(raw(1), mapping)).toBe(1)
    expect(normalizeSteering(raw(0.5), mapping)).toBeCloseTo(0.5)
  })

  it('supports inverted and narrowed calibrations', () => {
    expect(normalizeSteering(raw(0.8), { axis: 0, left: 0.8, right: -0.8 })).toBe(-1)
    expect(normalizeSteering(raw(0.4), { axis: 0, left: -0.8, right: 0.8 })).toBeCloseTo(0.5)
  })

  it('clamps values beyond the calibrated range', () => {
    expect(normalizeSteering(raw(1), { axis: 0, left: -0.5, right: 0.5 })).toBe(1)
  })

  it('reads missing axes and zero ranges as centered', () => {
    expect(normalizeSteering(raw(), mapping)).toBe(0)
    expect(normalizeSteering(raw(0.7), { axis: 0, left: 0.2, right: 0.2 })).toBe(0)
    expect(normalizeSteering(raw(Number.NaN), mapping)).toBe(0)
  })
})

describe('normalizePedal', () => {
  const mapping = DEFAULT_G29_MAPPING.throttle

  it('maps an inverted G29 pedal to 0..1', () => {
    expect(normalizePedal(raw(0, 1), mapping)).toBe(0)
    expect(normalizePedal(raw(0, 0), mapping)).toBeCloseTo(0.5)
    expect(normalizePedal(raw(0, -1), mapping)).toBe(1)
  })

  it('supports non-inverted pedals', () => {
    expect(normalizePedal(raw(0, 0.75), { axis: 1, rest: -1, full: 1 })).toBeCloseTo(0.875)
  })

  it('clamps and handles missing axes', () => {
    expect(normalizePedal(raw(0, 1.2), mapping)).toBe(0)
    expect(normalizePedal(raw(0), mapping)).toBe(0)
  })
})

describe('normalizeInput', () => {
  it('normalizes every channel with the default G29 mapping', () => {
    expect(normalizeInput(raw(-0.5, -1, 1, 0), DEFAULT_G29_MAPPING)).toEqual({
      steering: -0.5,
      throttle: 1,
      brake: 0,
      clutch: 0.5
    })
  })
})

describe('inputChanged', () => {
  it('ignores changes within the tolerance', () => {
    expect(inputChanged(NEUTRAL_INPUT, { ...NEUTRAL_INPUT, steering: 0.0005 })).toBe(false)
    expect(inputChanged(NEUTRAL_INPUT, { ...NEUTRAL_INPUT, brake: 0.01 })).toBe(true)
  })
})

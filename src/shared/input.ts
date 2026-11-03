/** Raw joystick state as reported by the driver (axes in -1..1). */
export interface RawJoystickState {
  axes: readonly number[]
  buttons: readonly boolean[]
}

/** Maps a raw axis to the steering range. Swap left/right to invert. */
export interface SteeringAxisMapping {
  axis: number
  /** Raw value at full left lock. */
  left: number
  /** Raw value at full right lock. */
  right: number
}

/** Maps a raw axis to a pedal. Works for inverted pedals (rest > full). */
export interface PedalAxisMapping {
  axis: number
  /** Raw value with the pedal released. */
  rest: number
  /** Raw value with the pedal fully pressed. */
  full: number
}

export interface InputMapping {
  steering: SteeringAxisMapping
  throttle: PedalAxisMapping
  brake: PedalAxisMapping
  clutch: PedalAxisMapping
}

/** Driver inputs normalized for display. */
export interface DriverInput {
  /** -1 (full left) to 1 (full right). */
  steering: number
  /** 0 (released) to 1 (fully pressed). */
  throttle: number
  brake: number
  clutch: number
}

export type InputSource = 'wheel' | 'simulator' | 'none'

export interface InputFrame {
  source: InputSource
  /** Name of the connected device, if any. */
  device: string | null
  input: DriverInput
}

export const NEUTRAL_INPUT: DriverInput = { steering: 0, throttle: 0, brake: 0, clutch: 0 }

/**
 * Default mapping measured on a Logitech G29 (PC mode, G HUB installed):
 * axis 0 steering, axes 1-3 throttle/brake/clutch reporting +1 released and -1 pressed.
 */
export const DEFAULT_G29_MAPPING: InputMapping = {
  steering: { axis: 0, left: -1, right: 1 },
  throttle: { axis: 1, rest: 1, full: -1 },
  brake: { axis: 2, rest: 1, full: -1 },
  clutch: { axis: 3, rest: 1, full: -1 }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function readAxis(raw: RawJoystickState, axis: number): number | null {
  const value = raw.axes[axis]
  return value === undefined || !Number.isFinite(value) ? null : value
}

/** Normalizes a steering axis to -1..1. Missing axes and zero ranges read as centered. */
export function normalizeSteering(raw: RawJoystickState, mapping: SteeringAxisMapping): number {
  const value = readAxis(raw, mapping.axis)
  const span = mapping.right - mapping.left
  if (value === null || span === 0) return 0
  return clamp(((value - mapping.left) / span) * 2 - 1, -1, 1)
}

/** Normalizes a pedal axis to 0..1. Missing axes and zero ranges read as released. */
export function normalizePedal(raw: RawJoystickState, mapping: PedalAxisMapping): number {
  const value = readAxis(raw, mapping.axis)
  const span = mapping.full - mapping.rest
  if (value === null || span === 0) return 0
  return clamp((value - mapping.rest) / span, 0, 1)
}

export function normalizeInput(raw: RawJoystickState, mapping: InputMapping): DriverInput {
  return {
    steering: normalizeSteering(raw, mapping.steering),
    throttle: normalizePedal(raw, mapping.throttle),
    brake: normalizePedal(raw, mapping.brake),
    clutch: normalizePedal(raw, mapping.clutch)
  }
}

/** True when two inputs differ by more than the given tolerance on any channel. */
export function inputChanged(a: DriverInput, b: DriverInput, epsilon = 0.001): boolean {
  return (
    Math.abs(a.steering - b.steering) > epsilon ||
    Math.abs(a.throttle - b.throttle) > epsilon ||
    Math.abs(a.brake - b.brake) > epsilon ||
    Math.abs(a.clutch - b.clutch) > epsilon
  )
}

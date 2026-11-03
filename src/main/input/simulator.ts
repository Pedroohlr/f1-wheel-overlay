import type { DriverInput } from '@shared/input'

/** Length of one simulated "corner" cycle. */
export const SIMULATOR_CYCLE_MS = 6000

const smoothstep = (edge0: number, edge1: number, x: number): number => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

/**
 * Deterministic driver input that loops through a straight, a braking zone, a
 * corner (alternating left and right) and the exit, so the overlay can be
 * validated without hardware.
 */
export function simulatedInput(timeMs: number): DriverInput {
  const cycle = Math.floor(timeMs / SIMULATOR_CYCLE_MS)
  const phase = (timeMs % SIMULATOR_CYCLE_MS) / SIMULATOR_CYCLE_MS
  const direction = cycle % 2 === 0 ? 1 : -1

  // Straight 0-0.35, braking 0.35-0.5, corner 0.5-0.8, exit 0.8-1.
  const braking = phase >= 0.35 && phase < 0.5
  const brake = braking ? 1 - smoothstep(0.35, 0.5, phase) * 0.6 : 0
  const throttle = braking ? 0 : phase < 0.35 ? 1 : smoothstep(0.55, 0.95, phase)
  const turnIn = smoothstep(0.42, 0.62, phase) * (1 - smoothstep(0.72, 0.95, phase))
  const steering = direction * turnIn * 0.6 + Math.sin(timeMs / 180) * 0.01
  // Blip the clutch on the downshift at the start of the braking zone.
  const clutch = phase >= 0.36 && phase < 0.39 ? 1 : 0

  return { steering, throttle, brake, clutch }
}

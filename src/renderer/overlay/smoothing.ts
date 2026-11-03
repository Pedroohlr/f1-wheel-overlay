const REFERENCE_FRAME_MS = 1000 / 60
const SETTLE_EPSILON = 0.05

/**
 * Exponential approach from `current` towards `target`, independent of the frame
 * rate. `smoothing` is the share of the remaining distance kept after one 60 fps
 * frame: 0 snaps immediately, values near 1 lag behind.
 */
export function smoothTowards(
  current: number,
  target: number,
  smoothing: number,
  dtMs: number
): number {
  if (smoothing <= 0 || dtMs <= 0) return smoothing <= 0 ? target : current
  const keep = Math.pow(Math.min(smoothing, 0.999), dtMs / REFERENCE_FRAME_MS)
  const next = target + (current - target) * keep
  return Math.abs(target - next) < SETTLE_EPSILON ? target : next
}

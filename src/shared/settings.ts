import { z } from 'zod'
import { DEFAULT_G29_MAPPING } from './input'

export const BoundsSchema = z.object({
  x: z.number().int(),
  y: z.number().int(),
  width: z.number().int().positive(),
  height: z.number().int().positive()
})
export type Bounds = z.infer<typeof BoundsSchema>

export const OverlaySettingsSchema = z.object({
  /** Last window position and size; null means "use the default placement". */
  bounds: BoundsSchema.nullable().catch(null).default(null),
  /** Overall overlay opacity, 0.1 (barely visible) to 1 (opaque). */
  opacity: z.number().min(0.1).max(1).catch(1).default(1),
  /** Content scale factor applied inside the window. */
  scale: z.number().min(0.25).max(3).catch(1).default(1)
})
export type OverlaySettings = z.infer<typeof OverlaySettingsSchema>

const axisIndex = z.number().int().min(0).max(31)
const axisValue = z.number().min(-1).max(1)

const SteeringAxisSchema = z.object({ axis: axisIndex, left: axisValue, right: axisValue })
const PedalAxisSchema = z.object({ axis: axisIndex, rest: axisValue, full: axisValue })

export const InputMappingSchema = z.object({
  steering: SteeringAxisSchema.catch(DEFAULT_G29_MAPPING.steering).default(
    DEFAULT_G29_MAPPING.steering
  ),
  throttle: PedalAxisSchema.catch(DEFAULT_G29_MAPPING.throttle).default(
    DEFAULT_G29_MAPPING.throttle
  ),
  brake: PedalAxisSchema.catch(DEFAULT_G29_MAPPING.brake).default(DEFAULT_G29_MAPPING.brake),
  clutch: PedalAxisSchema.catch(DEFAULT_G29_MAPPING.clutch).default(DEFAULT_G29_MAPPING.clutch)
})

export const InputSettingsSchema = z.object({
  mapping: InputMappingSchema.catch(() => InputMappingSchema.parse({})).prefault({}),
  /** Case-insensitive substring used to pick the wheel among connected joysticks. */
  devicePattern: z.string().max(100).catch('G29').default('G29'),
  /** Drive the overlay with generated input instead of the wheel. */
  simulator: z.boolean().catch(false).default(false)
})
export type InputSettings = z.infer<typeof InputSettingsSchema>

/** Lock-to-lock rotations offered in the UI, in degrees. */
export const WHEEL_ROTATIONS = [180, 270, 360, 540, 720, 900] as const

export const WheelSettingsSchema = z.object({
  /**
   * Visual lock-to-lock rotation in degrees. Match the G HUB operating range to
   * mirror the physical wheel exactly.
   */
  rotation: z.number().int().min(90).max(1080).catch(900).default(900),
  /** 0 = raw input, closer to 1 = smoother but laggier movement. */
  smoothing: z.number().min(0).max(0.95).catch(0.3).default(0.3)
})
export type WheelSettings = z.infer<typeof WheelSettingsSchema>

/**
 * Root settings document. Every field falls back to its default when missing or
 * invalid, so an outdated or hand-edited settings file never breaks startup.
 */
export const SettingsSchema = z.object({
  overlay: OverlaySettingsSchema.catch(() => OverlaySettingsSchema.parse({})).prefault({}),
  input: InputSettingsSchema.catch(() => InputSettingsSchema.parse({})).prefault({}),
  wheel: WheelSettingsSchema.catch(() => WheelSettingsSchema.parse({})).prefault({})
})
export type Settings = z.infer<typeof SettingsSchema>

export function defaultSettings(): Settings {
  return SettingsSchema.parse({})
}

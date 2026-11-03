import { z } from 'zod'

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

/**
 * Root settings document. Every field falls back to its default when missing or
 * invalid, so an outdated or hand-edited settings file never breaks startup.
 */
export const SettingsSchema = z.object({
  overlay: OverlaySettingsSchema.catch(() => OverlaySettingsSchema.parse({})).prefault({})
})
export type Settings = z.infer<typeof SettingsSchema>

export function defaultSettings(): Settings {
  return SettingsSchema.parse({})
}

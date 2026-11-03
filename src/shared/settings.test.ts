import { describe, expect, it } from 'vitest'
import { DEFAULT_G29_MAPPING } from './input'
import { defaultSettings, SettingsSchema } from './settings'

describe('SettingsSchema', () => {
  it('fills every section with defaults', () => {
    const settings = defaultSettings()
    expect(settings.overlay).toEqual({ bounds: null, opacity: 1, scale: 1 })
    expect(settings.input.mapping).toEqual(DEFAULT_G29_MAPPING)
    expect(settings.input.simulator).toBe(false)
    expect(settings.wheel).toEqual({ rotation: 900, smoothing: 0.3 })
  })

  it('keeps valid fields and resets invalid ones independently', () => {
    const settings = SettingsSchema.parse({
      overlay: { opacity: 0.5, scale: 99 },
      input: { mapping: { brake: { axis: 5, rest: -1, full: 1 }, clutch: 'bad' } },
      wheel: { rotation: 540, smoothing: 2 }
    })
    expect(settings.overlay.opacity).toBe(0.5)
    expect(settings.overlay.scale).toBe(1)
    expect(settings.input.mapping.brake).toEqual({ axis: 5, rest: -1, full: 1 })
    expect(settings.input.mapping.clutch).toEqual(DEFAULT_G29_MAPPING.clutch)
    expect(settings.wheel).toEqual({ rotation: 540, smoothing: 0.3 })
  })

  it('recovers from a completely invalid document', () => {
    expect(SettingsSchema.parse({ overlay: 1, input: null, wheel: [] })).toEqual(defaultSettings())
  })
})

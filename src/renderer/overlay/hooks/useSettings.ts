import { useEffect, useState } from 'react'
import type { Settings } from '@shared/settings'

/**
 * Current settings, kept in sync with the main process.
 * Null until the first value arrives (keeps zod out of the renderer bundle).
 */
export function useSettings(): Settings | null {
  const [settings, setSettings] = useState<Settings | null>(null)

  useEffect(() => {
    let active = true
    window.overlayApi
      .getSettings()
      .then((initial) => {
        if (active) setSettings(initial)
      })
      .catch((error: unknown) => console.error('[overlay] failed to read settings', error))
    const unsubscribe = window.overlayApi.onSettingsChange(setSettings)
    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  return settings
}

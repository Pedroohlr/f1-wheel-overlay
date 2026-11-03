import { useEffect, useState } from 'react'
import type { OverlayMode } from '@shared/ipc'

/** Tracks the overlay interaction mode pushed by the main process. */
export function useOverlayMode(): OverlayMode {
  const [mode, setMode] = useState<OverlayMode>('click-through')

  useEffect(() => {
    let active = true
    window.overlayApi
      .getMode()
      .then((initial) => {
        if (active) setMode(initial)
      })
      .catch((error: unknown) => console.error('[overlay] failed to read mode', error))
    const unsubscribe = window.overlayApi.onModeChange(setMode)
    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  return mode
}

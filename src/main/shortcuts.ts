import { globalShortcut } from 'electron'

export const DEFAULT_TOGGLE_EDIT_SHORTCUT = 'CommandOrControl+Shift+O'

/**
 * Registers a global shortcut. Returns false (instead of throwing) when the
 * accelerator is invalid or already taken by another application.
 */
export function registerShortcut(accelerator: string, handler: () => void): boolean {
  try {
    const registered = globalShortcut.register(accelerator, handler)
    if (!registered) console.warn(`[shortcuts] ${accelerator} is already in use by another app`)
    return registered
  } catch (error) {
    console.warn(`[shortcuts] invalid accelerator ${accelerator}`, error)
    return false
  }
}

export function unregisterAllShortcuts(): void {
  globalShortcut.unregisterAll()
}

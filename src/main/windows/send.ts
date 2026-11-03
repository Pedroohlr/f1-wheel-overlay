import type { BrowserWindow } from 'electron'

/**
 * Sends an IPC message only when the window and its renderer are alive, so a
 * crashed or reloading renderer never turns a broadcast into an error.
 */
export function sendToWindow(win: BrowserWindow, channel: string, payload: unknown): void {
  if (win.isDestroyed()) return
  const contents = win.webContents
  if (contents.isDestroyed() || contents.isCrashed() || contents.isLoading()) return
  contents.send(channel, payload)
}

import type { BrowserWindow } from 'electron'
import { IpcChannel, type OverlayMode } from '@shared/ipc'

/**
 * Owns the overlay interaction mode.
 * - click-through: mouse events pass to the game and the window never takes focus.
 * - edit: the window can be focused, dragged and resized.
 */
export class OverlayModeController {
  private mode: OverlayMode = 'click-through'

  constructor(private readonly window: BrowserWindow) {
    this.apply()
    // Re-send the mode after reloads so the renderer never shows a stale state.
    window.webContents.on('did-finish-load', () => this.broadcast())
  }

  get current(): OverlayMode {
    return this.mode
  }

  toggle(): OverlayMode {
    return this.set(this.mode === 'edit' ? 'click-through' : 'edit')
  }

  set(mode: OverlayMode): OverlayMode {
    this.mode = mode
    this.apply()
    return mode
  }

  private apply(): void {
    if (this.window.isDestroyed()) return
    const editing = this.mode === 'edit'
    this.window.setIgnoreMouseEvents(!editing)
    this.window.setFocusable(editing)
    if (editing) this.window.focus()
    this.broadcast()
  }

  private broadcast(): void {
    if (this.window.isDestroyed()) return
    this.window.webContents.send(IpcChannel.modeChanged, this.mode)
  }
}

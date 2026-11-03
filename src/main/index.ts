import { join } from 'node:path'
import { app, BrowserWindow, ipcMain } from 'electron'
import { IpcChannel } from '@shared/ipc'
import { OverlayModeController } from './overlay-mode'
import { SettingsStore } from './settings/settings-store'
import { DEFAULT_TOGGLE_EDIT_SHORTCUT, registerShortcut, unregisterAllShortcuts } from './shortcuts'
import { createOverlayWindow, resizeOverlay } from './windows/overlay-window'

let overlayWindow: BrowserWindow | null = null
let modeController: OverlayModeController | null = null
let settings: SettingsStore | null = null
let boundsTimer: NodeJS.Timeout | null = null

/** Saves the overlay bounds once the user stops moving/resizing it. */
function persistOverlayBounds(win: BrowserWindow): void {
  if (boundsTimer) clearTimeout(boundsTimer)
  boundsTimer = setTimeout(() => {
    boundsTimer = null
    if (win.isDestroyed()) return
    const bounds = win.getContentBounds()
    settings?.update((current) => ({ ...current, overlay: { ...current.overlay, bounds } }))
  }, 300)
}

function bootstrap(): void {
  settings = new SettingsStore(join(app.getPath('userData'), 'settings.json'))

  const win = createOverlayWindow(settings.get().overlay.bounds)
  overlayWindow = win
  // 'move'/'resize' also fire for programmatic changes (the resize grip), unlike 'moved'/'resized'.
  win.on('move', () => persistOverlayBounds(win))
  win.on('resize', () => persistOverlayBounds(win))
  modeController = new OverlayModeController(win)

  ipcMain.handle(IpcChannel.getMode, () => modeController?.current ?? 'click-through')
  ipcMain.handle(IpcChannel.getSettings, () => settings?.get())
  settings.subscribe((next) => {
    if (!win.isDestroyed()) win.webContents.send(IpcChannel.settingsChanged, next)
  })

  ipcMain.on(IpcChannel.resizeTo, (_event, size: unknown) => {
    if (overlayWindow && modeController?.current === 'edit') resizeOverlay(overlayWindow, size)
  })

  registerShortcut(DEFAULT_TOGGLE_EDIT_SHORTCUT, () => modeController?.toggle())

  win.on('closed', () => {
    overlayWindow = null
    modeController = null
  })
}

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', () => overlayWindow?.showInactive())
  app
    .whenReady()
    .then(bootstrap)
    .catch((error: unknown) => {
      console.error('Failed to start the overlay', error)
      app.quit()
    })
  app.on('will-quit', () => {
    unregisterAllShortcuts()
    settings?.flush()
  })
  app.on('window-all-closed', () => app.quit())
}

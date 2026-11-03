import { app, BrowserWindow, ipcMain } from 'electron'
import { IpcChannel } from '@shared/ipc'
import { OverlayModeController } from './overlay-mode'
import { DEFAULT_TOGGLE_EDIT_SHORTCUT, registerShortcut, unregisterAllShortcuts } from './shortcuts'
import { createOverlayWindow, resizeOverlay } from './windows/overlay-window'

let overlayWindow: BrowserWindow | null = null
let modeController: OverlayModeController | null = null

function bootstrap(): void {
  overlayWindow = createOverlayWindow()
  modeController = new OverlayModeController(overlayWindow)

  ipcMain.handle(IpcChannel.getMode, () => modeController?.current ?? 'click-through')

  ipcMain.on(IpcChannel.resizeTo, (_event, size: unknown) => {
    if (overlayWindow && modeController?.current === 'edit') resizeOverlay(overlayWindow, size)
  })

  registerShortcut(DEFAULT_TOGGLE_EDIT_SHORTCUT, () => modeController?.toggle())

  overlayWindow.on('closed', () => {
    overlayWindow = null
    modeController = null
  })
}

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', () => overlayWindow?.showInactive())
  app.whenReady().then(bootstrap).catch((error: unknown) => {
    console.error('Failed to start the overlay', error)
    app.quit()
  })
  app.on('will-quit', unregisterAllShortcuts)
  app.on('window-all-closed', () => app.quit())
}

import { app, BrowserWindow, ipcMain } from 'electron'
import { IpcChannel, type OverlayMode } from '@shared/ipc'
import { createOverlayWindow } from './windows/overlay-window'

let overlayWindow: BrowserWindow | null = null
const mode: OverlayMode = 'click-through'

function bootstrap(): void {
  ipcMain.handle(IpcChannel.getMode, () => mode)

  overlayWindow = createOverlayWindow()
  overlayWindow.on('closed', () => {
    overlayWindow = null
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
  app.on('window-all-closed', () => app.quit())
}

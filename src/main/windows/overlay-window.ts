import { join } from 'node:path'
import { BrowserWindow } from 'electron'

const DEFAULT_SIZE = { width: 520, height: 340 }

/**
 * Creates the transparent, frameless, always-on-top overlay window.
 * The window starts hidden and is shown once the renderer is ready to avoid a flash.
 */
export function createOverlayWindow(): BrowserWindow {
  const win = new BrowserWindow({
    ...DEFAULT_SIZE,
    show: false,
    transparent: true,
    frame: false,
    backgroundColor: '#00000000',
    hasShadow: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    maximizable: false,
    minimizable: false,
    fullscreenable: false,
    title: 'F1 Wheel Overlay',
    webPreferences: {
      preload: join(import.meta.dirname, '../preload/index.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      // The overlay must keep animating while the game has focus.
      backgroundThrottling: false
    }
  })

  // 'screen-saver' keeps the overlay above borderless fullscreen games.
  win.setAlwaysOnTop(true, 'screen-saver')

  win.once('ready-to-show', () => win.showInactive())

  win.webContents.on('did-fail-load', (_event, code, description, url) => {
    console.error(`[overlay] failed to load ${url}: ${description} (${code})`)
  })
  win.webContents.on('render-process-gone', (_event, details) => {
    console.error(`[overlay] renderer gone: ${details.reason} (exit ${details.exitCode})`)
  })
  win.webContents.on('did-finish-load', () => console.info('[overlay] renderer loaded'))

  const devUrl = process.env['ELECTRON_RENDERER_URL']
  if (devUrl) {
    void win.loadURL(`${devUrl}/overlay/index.html`)
  } else {
    void win.loadFile(join(import.meta.dirname, '../renderer/overlay/index.html'))
  }

  return win
}

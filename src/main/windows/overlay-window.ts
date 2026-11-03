import { join } from 'node:path'
import { BrowserWindow } from 'electron'

const DEFAULT_SIZE = { width: 520, height: 340 }
export const MIN_SIZE = { width: 160, height: 100 }
export const MAX_SIZE = { width: 2560, height: 1440 }

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function isSize(value: unknown): value is { width: number; height: number } {
  if (typeof value !== 'object' || value === null) return false
  const { width, height } = value as Record<string, unknown>
  return typeof width === 'number' && Number.isFinite(width) && typeof height === 'number' && Number.isFinite(height)
}

/** Resizes the overlay from untrusted renderer input, clamped to sane limits. */
export function resizeOverlay(win: BrowserWindow, size: unknown): void {
  if (!isSize(size) || win.isDestroyed()) return
  win.setSize(
    Math.round(clamp(size.width, MIN_SIZE.width, MAX_SIZE.width)),
    Math.round(clamp(size.height, MIN_SIZE.height, MAX_SIZE.height))
  )
}

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

import { join } from 'node:path'
import { BrowserWindow, screen } from 'electron'
import type { Bounds } from '@shared/settings'

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
  win.setContentSize(
    Math.round(clamp(size.width, MIN_SIZE.width, MAX_SIZE.width)),
    Math.round(clamp(size.height, MIN_SIZE.height, MAX_SIZE.height))
  )
}

/** True when at least part of the bounds is visible on a connected display. */
function isOnScreen(bounds: Bounds): boolean {
  const MIN_VISIBLE = 40
  return screen.getAllDisplays().some(({ workArea: area }) => {
    const overlapX = Math.min(bounds.x + bounds.width, area.x + area.width) - Math.max(bounds.x, area.x)
    const overlapY = Math.min(bounds.y + bounds.height, area.y + area.height) - Math.max(bounds.y, area.y)
    return overlapX >= MIN_VISIBLE && overlapY >= MIN_VISIBLE
  })
}

/**
 * Creates the transparent, frameless, always-on-top overlay window.
 * The window starts hidden and is shown once the renderer is ready to avoid a flash.
 * Saved bounds are ignored when they fall outside every display (e.g. a monitor was unplugged).
 */
export function createOverlayWindow(savedBounds: Bounds | null): BrowserWindow {
  const restored = savedBounds && isOnScreen(savedBounds) ? savedBounds : null
  const win = new BrowserWindow({
    ...DEFAULT_SIZE,
    // Size the web contents (not the outer frame) so bounds round-trip exactly at
    // fractional DPI scales instead of growing a few pixels on every restart.
    useContentSize: true,
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

  // Applied after creation: passing fractional-DPI bounds to the constructor
  // lets Windows add a few pixels of frame on every restore.
  if (restored) win.setContentBounds(restored)

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

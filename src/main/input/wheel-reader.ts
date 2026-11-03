import type { RawJoystickState } from '@shared/input'
import { pickWheelDevice } from './device-picker'

type SdlModule = typeof import('@kmamal/sdl')
type Joystick = ReturnType<SdlModule['joystick']['openDevice']>

const POLL_INTERVAL_MS = 1000 / 60
const SCAN_INTERVAL_MS = 1000

export interface WheelReaderListener {
  /** Raw state, emitted at up to 60 Hz while a wheel is connected. */
  onState(state: RawJoystickState): void
  /** Device name when a wheel connects, null when it disconnects. */
  onConnectionChange(device: string | null): void
}

/**
 * Reads the wheel through SDL in the main process, so input keeps flowing while
 * the game has focus. Hot-plug is detected by rescanning the device list.
 *
 * No SDL event listeners are registered on purpose: any listener makes the
 * bindings poll in a tight loop. Reading `axes` already pumps SDL events.
 */
export class WheelReader {
  private sdl: SdlModule | null = null
  private joystick: Joystick | null = null
  private pollTimer: NodeJS.Timeout | null = null
  private scanTimer: NodeJS.Timeout | null = null
  private openFailedFor: string | null = null

  constructor(
    private devicePattern: string,
    private readonly listener: WheelReaderListener
  ) {}

  /** Loads SDL and starts scanning. Returns false when native input is unavailable. */
  async start(): Promise<boolean> {
    // Must be set before SDL initializes, or joystick events stop without window focus.
    process.env['SDL_JOYSTICK_ALLOW_BACKGROUND_EVENTS'] = '1'
    try {
      const loaded = (await import('@kmamal/sdl')) as SdlModule & { default?: SdlModule }
      this.sdl = loaded.default ?? loaded
    } catch (error) {
      console.error('[input] native SDL bindings failed to load; wheel input disabled', error)
      return false
    }
    this.scan()
    this.scanTimer = setInterval(() => this.scan(), SCAN_INTERVAL_MS)
    return true
  }

  stop(): void {
    if (this.scanTimer) clearInterval(this.scanTimer)
    this.scanTimer = null
    this.disconnect()
  }

  get connectedDevice(): string | null {
    return this.joystick && !this.joystick.closed ? (this.joystick.device.name ?? 'Wheel') : null
  }

  setDevicePattern(pattern: string): void {
    if (pattern === this.devicePattern) return
    this.devicePattern = pattern
    this.disconnect()
    this.scan()
  }

  private scan(): void {
    if (!this.sdl) return
    if (this.joystick) {
      if (!this.joystick.closed) return
      this.disconnect()
    }

    let device
    try {
      device = pickWheelDevice(this.sdl.joystick.devices, this.devicePattern)
    } catch (error) {
      console.warn('[input] failed to list joysticks', error)
      return
    }
    if (!device) {
      this.openFailedFor = null
      return
    }

    try {
      this.joystick = this.sdl.joystick.openDevice(device)
    } catch (error) {
      // Log once per device instead of every scan.
      if (this.openFailedFor !== device.path) {
        console.warn(`[input] could not open ${device.name ?? 'wheel'}`, error)
        this.openFailedFor = device.path
      }
      return
    }

    this.openFailedFor = null
    console.info(`[input] connected: ${device.name ?? 'wheel'}`)
    this.listener.onConnectionChange(device.name ?? 'Wheel')
    this.pollTimer = setInterval(() => this.poll(), POLL_INTERVAL_MS)
  }

  private poll(): void {
    const joystick = this.joystick
    if (!joystick) return
    try {
      const axes = joystick.axes
      if (joystick.closed) {
        this.disconnect()
        return
      }
      this.listener.onState({ axes, buttons: joystick.buttons })
    } catch (error) {
      console.warn('[input] lost the wheel', error)
      this.disconnect()
    }
  }

  private disconnect(): void {
    if (this.pollTimer) clearInterval(this.pollTimer)
    this.pollTimer = null
    const joystick = this.joystick
    if (!joystick) return
    this.joystick = null
    try {
      if (!joystick.closed) joystick.close()
    } catch {
      // Already gone.
    }
    console.info('[input] disconnected')
    this.listener.onConnectionChange(null)
  }
}

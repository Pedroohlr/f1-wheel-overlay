import {
  inputChanged,
  NEUTRAL_INPUT,
  normalizeInput,
  type InputFrame,
  type InputMapping,
  type RawJoystickState
} from '@shared/input'
import type { InputSettings } from '@shared/settings'
import { simulatedInput } from './simulator'
import { WheelReader } from './wheel-reader'

const SIMULATOR_INTERVAL_MS = 1000 / 60

type FrameListener = (frame: InputFrame) => void

/**
 * Produces normalized input frames from the wheel or the simulator and notifies
 * listeners only when something visible changed.
 */
export class InputService {
  private readonly reader: WheelReader
  private mapping: InputMapping
  private simulatorTimer: NodeJS.Timeout | null = null
  private simulatorStart = 0
  private wheelDevice: string | null = null
  private frame: InputFrame = { source: 'none', device: null, input: NEUTRAL_INPUT }
  private readonly listeners = new Set<FrameListener>()

  constructor(private settings: InputSettings) {
    this.mapping = settings.mapping
    this.reader = new WheelReader(settings.devicePattern, {
      onState: (raw) => this.handleRaw(raw),
      onConnectionChange: (device) => {
        this.wheelDevice = device
        if (!this.settings.simulator) {
          this.publish({ source: device ? 'wheel' : 'none', device, input: NEUTRAL_INPUT })
        }
      }
    })
  }

  async start(): Promise<void> {
    await this.reader.start()
    this.applySimulator()
  }

  stop(): void {
    this.reader.stop()
    this.stopSimulator()
  }

  get current(): InputFrame {
    return this.frame
  }

  subscribe(listener: FrameListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  updateSettings(next: InputSettings): void {
    const previous = this.settings
    this.settings = next
    this.mapping = next.mapping
    this.reader.setDevicePattern(next.devicePattern)
    if (previous.simulator !== next.simulator) this.applySimulator()
  }

  private handleRaw(raw: RawJoystickState): void {
    if (this.settings.simulator) return
    this.publish({
      source: 'wheel',
      device: this.wheelDevice,
      input: normalizeInput(raw, this.mapping)
    })
  }

  private applySimulator(): void {
    if (this.settings.simulator) {
      if (this.simulatorTimer) return
      this.simulatorStart = Date.now()
      this.simulatorTimer = setInterval(() => {
        this.publish({
          source: 'simulator',
          device: null,
          input: simulatedInput(Date.now() - this.simulatorStart)
        })
      }, SIMULATOR_INTERVAL_MS)
    } else {
      this.stopSimulator()
      const device = this.wheelDevice
      this.publish({ source: device ? 'wheel' : 'none', device, input: NEUTRAL_INPUT })
    }
  }

  private stopSimulator(): void {
    if (this.simulatorTimer) clearInterval(this.simulatorTimer)
    this.simulatorTimer = null
  }

  private publish(next: InputFrame): void {
    const previous = this.frame
    const changed =
      previous.source !== next.source ||
      previous.device !== next.device ||
      inputChanged(previous.input, next.input)
    if (!changed) return
    this.frame = next
    for (const listener of this.listeners) listener(next)
  }
}

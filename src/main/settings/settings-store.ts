import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { defaultSettings, SettingsSchema, type Settings } from '@shared/settings'

const SAVE_DELAY_MS = 500

type Listener = (settings: Settings) => void

/**
 * JSON-file backed settings with validation, debounced atomic writes and
 * change notifications.
 */
export class SettingsStore {
  private data: Settings
  private saveTimer: NodeJS.Timeout | null = null
  private readonly listeners = new Set<Listener>()

  constructor(private readonly filePath: string) {
    this.data = this.load()
  }

  get(): Settings {
    return this.data
  }

  /** Applies a change, validates the result and schedules a save. */
  update(recipe: (current: Settings) => Settings): Settings {
    const result = SettingsSchema.safeParse(recipe(this.data))
    if (!result.success) {
      console.warn('[settings] rejected invalid update', result.error.issues)
      return this.data
    }
    this.data = result.data
    this.scheduleSave()
    for (const listener of this.listeners) listener(this.data)
    return this.data
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /** Writes pending changes immediately (call before quitting). */
  flush(): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer)
      this.saveTimer = null
    }
    this.save()
  }

  private scheduleSave(): void {
    if (this.saveTimer) clearTimeout(this.saveTimer)
    this.saveTimer = setTimeout(() => {
      this.saveTimer = null
      this.save()
    }, SAVE_DELAY_MS)
  }

  private load(): Settings {
    if (!existsSync(this.filePath)) return defaultSettings()
    try {
      const raw: unknown = JSON.parse(readFileSync(this.filePath, 'utf8'))
      return SettingsSchema.parse(raw)
    } catch (error) {
      const backup = `${this.filePath}.corrupt-${Date.now()}`
      console.warn(`[settings] unreadable settings file, moved to ${backup}`, error)
      try {
        renameSync(this.filePath, backup)
      } catch {
        // Ignore: we will overwrite the broken file on the next save.
      }
      return defaultSettings()
    }
  }

  private save(): void {
    try {
      mkdirSync(dirname(this.filePath), { recursive: true })
      // Write to a temp file first so a crash mid-write never corrupts settings.
      const tmp = `${this.filePath}.tmp`
      writeFileSync(tmp, JSON.stringify(this.data, null, 2), 'utf8')
      renameSync(tmp, this.filePath)
    } catch (error) {
      console.error('[settings] failed to save settings', error)
    }
  }
}

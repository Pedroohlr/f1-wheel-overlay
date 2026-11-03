/** Interaction mode of the overlay window. */
export type OverlayMode = 'click-through' | 'edit'

/** IPC channel names shared by the main, preload and renderer processes. */
export const IpcChannel = {
  getMode: 'overlay:get-mode',
  modeChanged: 'overlay:mode-changed'
} as const

/** API exposed to the overlay renderer through the preload bridge. */
export interface OverlayApi {
  getMode(): Promise<OverlayMode>
  onModeChange(listener: (mode: OverlayMode) => void): () => void
}

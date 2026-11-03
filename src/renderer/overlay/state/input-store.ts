import { useSyncExternalStore } from 'react'
import { NEUTRAL_INPUT, type InputFrame } from '@shared/input'

type Listener = () => void

let frame: InputFrame = { source: 'none', device: null, input: NEUTRAL_INPUT }
const listeners = new Set<Listener>()
let connected = false

function setFrame(next: InputFrame): void {
  frame = next
  for (const listener of listeners) listener()
}

/** Starts listening to input frames from the main process (idempotent). */
function connect(): void {
  if (connected) return
  connected = true
  window.overlayApi.onInput(setFrame)
  window.overlayApi
    .getInput()
    .then(setFrame)
    .catch((error: unknown) => console.error('[overlay] failed to read input', error))
}

/**
 * Latest input frame, readable without React so 60 fps animations can skip
 * re-rendering.
 */
export const inputStore = {
  get: (): InputFrame => frame,
  subscribe(listener: Listener): () => void {
    connect()
    listeners.add(listener)
    return () => listeners.delete(listener)
  }
}

/** Re-renders on every input frame; use for low-cost UI only. */
export function useInputFrame(): InputFrame {
  return useSyncExternalStore(inputStore.subscribe, inputStore.get)
}

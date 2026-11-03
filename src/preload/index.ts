import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'
import { IpcChannel, type OverlayApi, type OverlayMode } from '@shared/ipc'
import type { InputFrame } from '@shared/input'
import type { Settings } from '@shared/settings'

const api: OverlayApi = {
  getMode: () => ipcRenderer.invoke(IpcChannel.getMode) as Promise<OverlayMode>,
  onModeChange: (listener) => {
    const handler = (_event: IpcRendererEvent, mode: OverlayMode): void => listener(mode)
    ipcRenderer.on(IpcChannel.modeChanged, handler)
    return () => ipcRenderer.removeListener(IpcChannel.modeChanged, handler)
  },
  resizeTo: (size) => ipcRenderer.send(IpcChannel.resizeTo, size),
  getSettings: () => ipcRenderer.invoke(IpcChannel.getSettings) as Promise<Settings>,
  onSettingsChange: (listener) => {
    const handler = (_event: IpcRendererEvent, settings: Settings): void => listener(settings)
    ipcRenderer.on(IpcChannel.settingsChanged, handler)
    return () => ipcRenderer.removeListener(IpcChannel.settingsChanged, handler)
  },
  getInput: () => ipcRenderer.invoke(IpcChannel.getInput) as Promise<InputFrame>,
  onInput: (listener) => {
    const handler = (_event: IpcRendererEvent, frame: InputFrame): void => listener(frame)
    ipcRenderer.on(IpcChannel.inputFrame, handler)
    return () => ipcRenderer.removeListener(IpcChannel.inputFrame, handler)
  }
}

contextBridge.exposeInMainWorld('overlayApi', api)

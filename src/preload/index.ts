import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'
import { IpcChannel, type OverlayApi, type OverlayMode } from '@shared/ipc'

const api: OverlayApi = {
  getMode: () => ipcRenderer.invoke(IpcChannel.getMode) as Promise<OverlayMode>,
  onModeChange: (listener) => {
    const handler = (_event: IpcRendererEvent, mode: OverlayMode): void => listener(mode)
    ipcRenderer.on(IpcChannel.modeChanged, handler)
    return () => ipcRenderer.removeListener(IpcChannel.modeChanged, handler)
  },
  resizeTo: (size) => ipcRenderer.send(IpcChannel.resizeTo, size)
}

contextBridge.exposeInMainWorld('overlayApi', api)

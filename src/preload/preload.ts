import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'
import { IpcHandlerChannel, IpcListenerChannel } from '@preload/ipc'

const electron = {
    ipc: {
        async invoke<T>(channel: IpcHandlerChannel, ...args: unknown[]): Promise<T> {
            const response: any = await ipcRenderer.invoke('ipc-handler', channel, ...args)
            if (typeof response === 'string' && response.includes('___IS_OBJECT')) {
                return JSON.parse(response as string).data as T
            }
            return response as T
        },
        on(channel: IpcListenerChannel, func: (...args: unknown[]) => void) {
            const subscription = (_event: IpcRendererEvent, ...args: unknown[]) => func(...args)
            ipcRenderer.on(channel, subscription)

            return () => {
                ipcRenderer.removeListener(channel, subscription)
            }
        }
    }
}

contextBridge.exposeInMainWorld('electron', electron)

export type ElectronHandler = typeof electron

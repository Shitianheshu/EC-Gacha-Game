import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { IpcHandlerChannel } from '@preload/ipc'

export type IpcHandlerFunc = (event: IpcEvent) => unknown | Promise<unknown>

export interface IpcEvent {
    event: IpcMainInvokeEvent
    args: any[]
}

export class IpcManager {
    private static _handlers: Map<string, IpcHandlerFunc> = new Map()

    /**
     * Initializes the IPC manager by setting up a handler for IPC communication.
     *
     * The method listens to IPC messages coming from the renderer process. It validates
     * the incoming channel name and passes the event and arguments to the appropriate handler
     * registered within the manager.
     */
    public static init() {
        ipcMain.handle('ipc-handler', async (event, channel, ...args) => {
            if (typeof channel !== 'string') {
                console.warn(`[IpcManager] Received invalid channel: ${channel}`)
                return null
            }

            const handler = IpcManager._handlers.get(channel)
            if (handler === undefined) {
                console.warn(`[IpcManager] Received unknown channel: ${channel}`)
                return null
            }

            const response = await Promise.resolve(
                handler({
                    event,
                    args: [...args]
                })
            )

            /*
             * FIX: Ipc Responses being [object Object] when sometimes sending an object.
             */
            if (typeof response === 'object' || Array.isArray(response)) {
                return JSON.stringify({
                    data: response,
                    ___IS_OBJECT: true
                })
            }

            return response
        })
    }

    /**
     * Registers a handler for a specific IPC channel. Throws an error if the channel is already registered.
     *
     * @param channel - The IPC channel to associate with the handler.
     * @param handler - The function that will be invoked when the specified channel receives a request.
     */
    public static registerHandler(channel: IpcHandlerChannel, handler: IpcHandlerFunc) {
        if (IpcManager._handlers.has(channel)) {
            throw new Error(`Channel already registered: ${channel}`)
        }

        console.log(`[IpcManager] Registering handler for channel: ${channel}`)
        IpcManager._handlers.set(channel, handler)
    }

    /**
     * Removes the handler for the specified IPC channel. Throws an error if the channel is not registered.
     *
     * @param channel - The IPC channel whose handler should be removed.
     */
    public static removeHandler(channel: IpcHandlerChannel) {
        if (!IpcManager._handlers.has(channel)) {
            throw new Error(`Channel already removed: ${channel}`)
        }

        console.log(`[IpcManager] Removing handler for channel: ${channel}`)
        IpcManager._handlers.delete(channel)
    }
}

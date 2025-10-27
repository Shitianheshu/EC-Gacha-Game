import { IpcHandlerFunc } from '@main/ipc/manager'
import { plugboo } from '@main/main'

export const ipcWindowMaximize: IpcHandlerFunc = () => {
    const window = plugboo.getMainWindow()
    if (!window) {
        return
    }

    if (window.isMaximized()) {
        window.unmaximize()
    } else {
        window.maximize()
    }
}

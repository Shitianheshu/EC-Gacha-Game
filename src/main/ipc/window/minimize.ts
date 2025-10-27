import { IpcHandlerFunc } from '@main/ipc/manager'
import { plugboo } from '@main/main'

export const ipcWindowMinimize: IpcHandlerFunc = () => {
    const window = plugboo.getMainWindow()
    if (window) {
        window.minimize()
    }
}

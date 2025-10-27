import { IpcHandlerFunc } from '@main/ipc/manager'
import { GameManager } from '@main/game/manager'

export const ipcListGames: IpcHandlerFunc = () => {
    return GameManager.getGames().map((v) => ({
        ...v.info,
        verified: v.installPath !== null
    }))
}

import { IpcEvent, IpcHandlerFunc } from '@main/ipc/manager'
import { GameManager } from '@main/game/manager'

export const ipcVerifyGame: IpcHandlerFunc = (event: IpcEvent) => {
    if (event.args.length !== 1) {
        return
    }

    const gameId = event.args[0]
    if (typeof gameId !== 'string') {
        return
    }

    const game = GameManager.getGame(gameId)
    if (game === null) {
        return
    }

    if (game.installPath === null) {
        return {
            success: false,
            reason: 'GAME_NOT_INITIALIZED',
            path: game.searchInstallation()
        }
    }

    return {
        success: true
    }
}

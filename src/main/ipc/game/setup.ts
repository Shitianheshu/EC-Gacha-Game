import { IpcEvent, IpcHandlerFunc } from '@main/ipc/manager'
import { GameManager } from '@main/game/manager'
import { plugboo } from '@main/main'

export const ipcSetupGame: IpcHandlerFunc = async (event: IpcEvent) => {
    if (event.args.length !== 2) {
        return
    }

    const gameId = event.args[0]
    const path = event.args[1]

    if (typeof gameId !== 'string' || typeof path !== 'string') {
        return
    }

    const game = GameManager.getGame(gameId)
    if (game === null) {
        return {
            success: false,
            reason: 'GAME_NOT_FOUND'
        }
    }

    if (game.installPath !== null) {
        return {
            success: false,
            reason: 'GAME_ALREADY_INITIALIZED'
        }
    }

    if (!game.validatePath(path)) {
        return {
            success: false,
            reason: 'INVALID_PATH'
        }
    }

    game.installPath = path
    await plugboo.setConfigEntry(`games.${game.info.id}.installPath`, path)

    return {
        success: true
    }
}

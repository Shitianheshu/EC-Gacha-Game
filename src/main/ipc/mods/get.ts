import { IpcEvent, IpcHandlerFunc } from '@main/ipc/manager'
import { GameManager } from '@main/game/manager'

export const ipcGetMod: IpcHandlerFunc = async (event: IpcEvent) => {
    if (event.args.length !== 3) {
        return
    }

    const gameId = event.args[0]
    const serviceId = event.args[1]
    const modId = event.args[2]

    if (typeof gameId !== 'string' || typeof serviceId !== 'string' || typeof modId !== 'string') {
        return
    }

    const game = GameManager.getGame(gameId)
    if (game === null) {
        return
    }

    const service = game.services.find((v) => v.id === serviceId)
    if (service === undefined) {
        return
    }

    return await service.getMod(modId)
}

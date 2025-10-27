import { IpcEvent, IpcHandlerFunc } from '@main/ipc/manager'
import { GameManager } from '@main/game/manager'

export const ipcPendingInstalls: IpcHandlerFunc = (event: IpcEvent) => {
    if (event.args.length !== 2) {
        return
    }

    const profileId = event.args[0]
    const serviceId = event.args[1]

    if (typeof profileId !== 'string' || typeof serviceId !== 'string') {
        return
    }

    const profile = GameManager.getProfile(profileId)
    if (profile === null) {
        return
    }

    const game = GameManager.getGame(profile.gameId)
    if (game === null) {
        return
    }

    const service = game.services.find((v) => v.id === serviceId)
    if (service === undefined) {
        return
    }

    return service.pendingInstalls
}

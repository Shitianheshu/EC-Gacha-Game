import { IpcEvent, IpcHandlerFunc } from '@main/ipc/manager'
import { GameManager } from '@main/game/manager'
import { ProfileRData } from '@preload/types/profile'
import { LoaderStatus } from '@preload/types/loader'

export const ipcListProfiles: IpcHandlerFunc = (event: IpcEvent) => {
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

    return game.profiles.map((v) => {
        const data: ProfileRData = {
            id: v.id,
            gameId: v.gameId,
            name: v.name,
            mods: [],
            loaderStatus: v.isLoaderInstalled ? LoaderStatus.READY : LoaderStatus.NOT_INSTALLED
        }
        return data
    })
}

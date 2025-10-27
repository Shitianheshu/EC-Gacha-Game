import { IpcEvent, IpcHandlerFunc } from '@main/ipc/manager'
import { GameManager } from '@main/game/manager'
import { LoaderRData } from '@preload/types/loader'

export const ipcListLoaders: IpcHandlerFunc = async (event: IpcEvent) => {
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

    for (const loader of game.loaders) {
        await loader.fetchVersions()
    }

    return game.loaders.map((loader) => {
        const data: LoaderRData = {
            id: loader.id,
            name: loader.name,
            versions: loader.versions.map((version) => version.version)
        }
        return data
    })
}

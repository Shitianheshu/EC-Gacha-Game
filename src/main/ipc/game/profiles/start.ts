import { IpcEvent, IpcHandlerFunc } from '@main/ipc/manager'
import { GameManager } from '@main/game/manager'

export const ipcStartProfile: IpcHandlerFunc = async (event: IpcEvent) => {
    if (event.args.length !== 1) {
        return
    }

    const profileId = event.args[0]
    if (typeof profileId !== 'string') {
        return
    }

    const profile = GameManager.getProfile(profileId)
    if (profile === null) {
        return
    }

    if (profile.loader === null) {
        return
    }

    const game = GameManager.getGame(profile.gameId)
    if (game === null) {
        return
    }

    const loader = game.loaders.find((v) => v.id === profile.loader.loaderId)
    if (loader === null) {
        return
    }

    await loader.startProcess(profile)
}

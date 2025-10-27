import { IpcEvent, IpcHandlerFunc } from '@main/ipc/manager'
import { GameManager } from '@main/game/manager'
import { ProfileRData } from '@preload/types/profile'
import { LoaderStatus } from '@preload/types/loader'

export const ipcGetProfile: IpcHandlerFunc = (event: IpcEvent) => {
    if (event.args.length !== 1) {
        return
    }

    const profileId = event.args[0]
    if (typeof profileId !== 'string') {
        return
    }

    const profile = GameManager.getProfile(profileId)
    if (profile === null) {
        return null
    }

    const data: ProfileRData = {
        id: profile.id,
        gameId: profile.gameId,
        name: profile.name,
        mods: profile.mods.map((mod) => ({
            id: mod.id,
            name: mod.name,
            author: mod.author,
            version: mod.version,
            enabled: mod.isEnabled
        })),
        loaderStatus: profile.isLoaderInstalled ? LoaderStatus.READY : LoaderStatus.NOT_INSTALLED
    }

    return data
}

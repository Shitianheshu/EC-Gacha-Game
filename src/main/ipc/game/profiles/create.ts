import { IpcEvent, IpcHandlerFunc } from '@main/ipc/manager'
import { GameManager } from '@main/game/manager'
import { Profile } from '@main/game/profile'
import { v4 } from 'uuid'

export const ipcCreateProfile: IpcHandlerFunc = (event: IpcEvent) => {
    if (event.args.length !== 4) {
        return
    }

    const gameId = event.args[0]
    const name = event.args[1]
    const loaderId = event.args[2]
    const loaderVersion = event.args[3]

    if (
        typeof gameId !== 'string' ||
        typeof name !== 'string' ||
        typeof loaderId !== 'string' ||
        typeof loaderVersion !== 'string'
    ) {
        return
    }

    const game = GameManager.getGame(gameId)
    if (game === null) {
        return {
            success: false,
            reason: 'GAME_NOT_FOUND'
        }
    }

    const loader = game.loaders.find((v) => v.id === loaderId)
    if (loader === null) {
        return {
            success: false,
            reason: 'LOADER_NOT_FOUND'
        }
    }

    const version = loader.versions.find((v) => v.version === loaderVersion)
    if (version === null) {
        return {
            success: false,
            reason: 'VERSION_NOT_FOUND'
        }
    }

    if (name.trim().length === 0) {
        return {
            success: false,
            reason: 'NAME_CANNOT_BE_EMPTY'
        }
    }

    const profile = new Profile(v4(), gameId)
    profile.name = name
    profile.loader = {
        loaderId: loaderId,
        version: version
    }
    profile.writeToDisk()
    game.profiles.push(profile)
    console.log('[Application] Created new profile: ' + profile.name)

    loader
        .installVersion(profile)
        .then(() => {
            profile.isLoaderInstalled = true
            console.log('[Application] Installed profile version: ' + profile.name)
        })
        .catch((exception) => {
            console.error('[Application] Failed to install profile version: ' + profile.name)
            console.error(exception)
        })

    return {
        success: true
    }
}

import { IpcEvent, IpcHandlerFunc } from '@main/ipc/manager'
import { GameManager } from '@main/game/manager'
import { ProfileMod } from '@main/game/profile'
import { plugboo } from '@main/main'

export const ipcInstallMod: IpcHandlerFunc = async (event: IpcEvent) => {
    if (event.args.length !== 3) {
        return
    }

    const profileId = event.args[0]
    const serviceId = event.args[1]
    const modId = event.args[2]

    if (typeof profileId !== 'string' || typeof serviceId !== 'string' || typeof modId !== 'string') {
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

    if (service.pendingInstalls.includes(modId)) {
        return
    }

    const loader = game.loaders.find((v) => v.id === profile.loader.loaderId)
    if (loader === undefined) {
        return
    }

    const mod = await service.getMod(modId)
    if (mod === null) {
        return
    }

    console.log(`[Application] Installing mod '${mod.name}' (${mod.id})...`)

    service.pendingInstalls.push(mod.id)
    loader
        .installMod(profile, mod, mod.files[0])
        .then(async () => {
            const modInstance = new ProfileMod(mod.id, profile.id, mod.name, mod.version, mod.author.name)
            await modInstance.downloadIcon(mod.media[0].originalImage.url)
            profile.mods.push(modInstance)
            plugboo.sendEventToMain('game/profiles/mods/install', modId, true)
        })
        .catch((exception) => {
            console.error(`[Application] Failed to install mod '${mod.name}' (${mod.id})`)
            console.error(exception)
        })
        .finally(() => {
            service.pendingInstalls.splice(service.pendingInstalls.indexOf(mod.id), 1)
        })
}

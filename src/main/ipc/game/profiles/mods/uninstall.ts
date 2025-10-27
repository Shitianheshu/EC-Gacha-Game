import { IpcEvent, IpcHandlerFunc } from '@main/ipc/manager'
import { GameManager } from '@main/game/manager'

export const ipcUninstallMod: IpcHandlerFunc = (event: IpcEvent) => {
    if (event.args.length !== 2) {
        return
    }

    const profileId = event.args[0]
    const modId = event.args[1]

    if (typeof profileId !== 'string' || typeof modId !== 'string') {
        return
    }

    const profile = GameManager.getProfile(profileId)
    if (profile === null) {
        return false
    }

    const mod = profile.mods.find((v) => v.id === modId)
    if (mod === undefined) {
        return false
    }

    try {
        mod.deleteFromDisk()
        profile.mods.splice(profile.mods.indexOf(mod), 1)
        return true
    } catch (exception) {
        console.error(`[Application] Failed to uninstall mod '${mod.name}' (${mod.id})`)
        console.error(exception)
        return false
    }
}

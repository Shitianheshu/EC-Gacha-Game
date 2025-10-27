import { LoaderRData } from '@preload/types/loader'
import { GameInformation } from '@preload/types/game'
import { ProfileRData } from '@preload/types/profile'

export type GameInformationWithVerified = GameInformation & {
    verified: boolean
}

export async function listGames() {
    return window.electron.ipc.invoke<GameInformationWithVerified[]>('game/list')
}

export async function verifyGame(gameId: string) {
    return window.electron.ipc.invoke<{
        success: boolean
        reason?: string
        path?: string
    }>('game/verify', gameId)
}

export async function setupGame(gameId: string, path: string) {
    return window.electron.ipc.invoke<{
        success: boolean
        reason?: string
    }>('game/setup', gameId, path)
}

export async function getProfiles(gameId: string): Promise<ProfileRData[]> {
    return window.electron.ipc.invoke<ProfileRData[]>('game/profiles', gameId)
}

export async function getProfile(profileId: string): Promise<ProfileRData | null> {
    return window.electron.ipc.invoke<ProfileRData | null>('game/profiles/get', profileId)
}

export async function createProfile(
    gameId: string,
    name: string,
    loaderId: string,
    loaderVersion: string
): Promise<{
    success: boolean
    reason?: string
}> {
    return window.electron.ipc.invoke<{
        success: boolean
        reason?: string
    }>('game/profiles/create', gameId, name, loaderId, loaderVersion)
}

export async function startProfile(profileId: string) {
    await window.electron.ipc.invoke<void>('game/profiles/start', profileId)
}

export function installMod(profileId: string, serviceId: string, modId: string) {
    window.electron.ipc.invoke<void>('game/profiles/mods/install', profileId, serviceId, modId).then()
}

export async function uninstallMod(profileId: string, modId: string) {
    return await window.electron.ipc.invoke<boolean>('game/profiles/mods/uninstall', profileId, modId)
}

export async function getPendingInstalls(profileId: string, serviceId: string) {
    return await window.electron.ipc.invoke<string[]>('game/profiles/mods/install/list', profileId, serviceId)
}

export async function getLoaders(gameId: string): Promise<LoaderRData[]> {
    return window.electron.ipc.invoke<LoaderRData[]>('game/loaders', gameId)
}

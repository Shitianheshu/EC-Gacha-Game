import { Comment, GetCommentsOptions, Mod, SearchModsOptions, SearchModsResponse } from '@preload/types/service'

export async function getModComments(gameId: string, modId: string, options: GetCommentsOptions): Promise<Comment[]> {
    return window.electron.ipc.invoke<Comment[]>('mods/comments', gameId, 'gamebanana', modId, options)
}

export async function getMod(gameId: string, modId: string): Promise<Mod | null> {
    return window.electron.ipc.invoke<Mod | null>('mods/get', gameId, 'gamebanana', modId)
}

export async function searchMods(gameId: string, options: SearchModsOptions): Promise<SearchModsResponse> {
    return window.electron.ipc.invoke<SearchModsResponse>('mods/search', gameId, 'gamebanana', options)
}

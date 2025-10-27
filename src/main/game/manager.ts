import { Game } from './index'
import { HoYoverseGame, HoYoverseGameId } from './hoyoverse'
import { Profile } from './profile'
import { GameBananaService } from '@main/service/gamebanana'

export class GameManager {
    private static readonly entries: Game[] = [
        new HoYoverseGame(HoYoverseGameId.GenshinImpact, [new GameBananaService(8552)]),
        new HoYoverseGame(HoYoverseGameId.HonkaiStarRail, [new GameBananaService(18366)]),
        new HoYoverseGame(HoYoverseGameId.ZenlessZoneZero, [new GameBananaService(19567)])
    ]

    /**
     * Retrieves a game by its unique identifier.
     *
     * @param id - The unique identifier of the game to retrieve.
     * @return The game object matching the provided identifier, or null if no match is found.
     */
    public static getGame(id: string): Game | null {
        return GameManager.entries.find((v) => v.info.id === id) ?? null
    }

    /**
     * Retrieves a profile by its identifier.
     *
     * @param id - The unique identifier of the profile to retrieve.
     * @return The profile with the given identifier if found, otherwise null.
     */
    public static getProfile(id: string): Profile | null {
        for (const game of GameManager.entries) {
            const profile = game.profiles.find((v) => v.id === id)
            if (profile !== undefined) {
                return profile
            }
        }
        return null
    }

    /**
     * Retrieves the list of entries.
     */
    public static getGames(): Game[] {
        return GameManager.entries
    }
}

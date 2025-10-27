import { GameInformation } from '@preload/types/game'
import { Profile } from './profile'
import { Loader } from '@main/loader'
import { Service } from '@main/service'

export class Game {
    public readonly info: GameInformation

    public installPath: string | null

    public profiles: Profile[]

    public services: Service[]

    public loaders: Loader[]

    constructor(info: GameInformation, services: Service[], loaders: Loader[]) {
        this.info = info
        this.installPath = null
        this.profiles = []
        this.services = services
        this.loaders = loaders

        if (this.loaders.length === 0) {
            console.warn(`[Game] No loaders found for game: ${this.info.id}`)
        }
    }

    /**
     * Searches for an installation and returns the result.
     *
     * @return The result of the installation search.
     */
    public searchInstallation(): string | null {
        throw new Error('Game::searchInstallation() not implemented')
    }

    /**
     * Validates the given directory path.
     *
     * @param path - The directory path to validate.
     * @return Returns true if the path is valid, otherwise false.
     */
    public validatePath(path: string): boolean {
        throw new Error('Game::validatePath() not implemented')
    }
}

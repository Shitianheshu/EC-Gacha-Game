import { Profile } from '@main/game/profile'
import { Mod, ModFile } from '@preload/types/service'

export interface LoaderVersion {
    version: string
    file: LoaderFile
}

export interface LoaderFile {
    name: string
    url: string
}

export interface LoaderInstance {
    loaderId: string
    version: LoaderVersion
}

export class Loader {
    public readonly id: string

    public readonly name: string

    public versions: LoaderVersion[]

    constructor(id: string, name: string) {
        this.id = id
        this.name = name
        this.versions = []
    }

    public async startProcess(profile: Profile) {
        throw new Error('Not implemented')
    }

    /**
     * Fetches available versions from the data source.
     */
    public async fetchVersions() {
        throw new Error('Not implemented')
    }

    /**
     * Installs the specified loader associated with the provided profile.
     *
     * @param profile - The profile object containing details about the loader to be installed.
     */
    public async installVersion(profile: Profile) {
        throw new Error('Not implemented')
    }

    /**
     * Validates the installation on the profile.
     *
     * @param profile - The profile object containing installation.
     * @return Returns true if the installation is valid; otherwise, returns false.
     */
    public validateInstallation(profile: Profile): boolean {
        throw new Error('Not implemented')
    }

    /**
     * Installs a mod into the specified profile using the provided mod and file details.
     *
     * @param profile - The profile where the mod is to be installed.
     * @param mod - The mod object containing information about the mod to be installed.
     * @param file - The specific version of the mod to be installed.
     */
    public async installMod(profile: Profile, mod: Mod, file: ModFile) {
        throw new Error('Not implemented')
    }
}

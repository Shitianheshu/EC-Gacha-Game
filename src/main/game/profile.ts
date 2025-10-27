import fs from 'node:fs'
import path from 'node:path'
import { getAppDataPath } from '@main/application'
import { LoaderInstance } from '@main/loader'
import { downloadFile } from '@main/util/internet'
import sharp, { Sharp } from 'sharp'

export class ProfileMod {
    public readonly id: string

    public readonly profileId: string

    public readonly name: string

    public readonly version: string

    public readonly author: string

    public isEnabled: boolean

    constructor(id: string, profileId: string, name: string, version: string, author: string) {
        this.id = id
        this.profileId = profileId
        this.name = name
        this.version = version
        this.author = author
        this.isEnabled = false
    }

    /**
     * Writes the mod's data to the disk. Ensures the directory structure exists before writing files.
     */
    public writeToDisk() {
        const diskPath = path.join(getAppDataPath(), 'profiles', this.profileId, 'mods', this.id)
        if (!fs.existsSync(diskPath)) {
            fs.mkdirSync(diskPath, { recursive: true })
        }

        fs.writeFileSync(path.join(diskPath, 'modinfo.json'), JSON.stringify(this.serializeDisk()))
    }

    /**
     * Deletes the directory corresponding to the mod from the disk.
     */
    public deleteFromDisk() {
        const diskPath = path.join(getAppDataPath(), 'profiles', this.profileId, 'mods', this.id)
        if (!fs.existsSync(diskPath)) {
            return
        }

        fs.rmSync(diskPath, {
            recursive: true
        })
    }

    /**
     * Downloads and processes an icon for a mod from a given URL.
     * The downloaded icon is resized and saved in the appropriate directory.
     *
     * @param url - The URL of the icon to download.
     * @return Resolves when the icon has been successfully downloaded, processed, and saved.
     */
    public async downloadIcon(url: string) {
        const downloadPath = path.join(getAppDataPath(), 'profiles', this.profileId, 'mods', this.id, 'icon.tmp.png')

        if (!(await downloadFile(url, downloadPath))) {
            console.error(`[Application] Failed to download icon for mod '${this.name}' (${this.id})`)
            return
        }

        try {
            const image = sharp(downloadPath)
            const metadata = await image.metadata()

            let extraction: Sharp | null

            if (metadata.width <= metadata.height) {
                const diff = metadata.height - metadata.width

                // noinspection JSSuspiciousNameCombination
                extraction = image.extract({
                    left: 0,
                    top: Math.floor(diff / 2),
                    width: metadata.width,
                    height: metadata.width
                })
            } else {
                const diff = metadata.width - metadata.height

                // noinspection JSSuspiciousNameCombination
                extraction = image.extract({
                    left: Math.floor(diff / 2),
                    top: 0,
                    width: metadata.height,
                    height: metadata.height
                })
            }

            if (extraction !== null) {
                await extraction
                    .resize({
                        width: 250,
                        height: 250
                    })
                    .toFile(path.join(getAppDataPath(), 'profiles', this.profileId, 'mods', this.id, 'icon.png'))
            }
        } catch (exception) {
            console.error(`[ProfileMod] Failed to process icon for mod '${this.name}' (${this.id})`)
            console.error(exception)
        } finally {
            fs.rmSync(downloadPath)
        }
    }

    /**
     * Reads a mod object from a file located in the specified folder path.
     *
     * @param profile The profile that the mod is located in.
     * @param folderPath The path to the folder containing the profile JSON file.
     * @return The Profile Mod object parsed from the JSON file.
     * @throws Error if the folder does not exist, if the modinfo.json file is not found, or if the mod info version is unsupported.
     */
    public static readFromDisk(profile: Profile, folderPath: string): ProfileMod {
        if (!fs.existsSync(folderPath)) {
            throw new Error(`Folder does not exist`)
        }

        if (!fs.existsSync(path.join(folderPath, 'modinfo.json'))) {
            throw new Error(`Profile file does not exist`)
        }

        const data = fs.readFileSync(path.join(folderPath, 'modinfo.json'), {
            encoding: 'utf8'
        })
        const json = JSON.parse(data)

        /*
         * NOTE: We change this when we have version 2 or higher available.
         */
        if (!json.__version || json.__version !== 1) {
            throw new Error(`Unsupported mod version: ${json.__version}`)
        }

        return ProfileMod.parseVersion1(profile, json)
    }

    /**
     * Parses the provided data to create a `ProfileMod` instance while validating its structure.
     *
     * @param profile The profile that the mod is located in.
     * @param data - The data object containing mod information to be parsed.
     * @return A `ProfileMod` instance created with the validated structure from the provided data.
     * @throws Error if any required field is missing or has an invalid type.
     */
    private static parseVersion1(profile: Profile, data: any): ProfileMod {
        if (typeof data.id !== 'string') {
            throw new Error(`Invalid mod ID: ${data.id}`)
        }

        if (typeof data.name !== 'string') {
            throw new Error(`Invalid mod name: ${data.name}`)
        }

        if (typeof data.version !== 'string') {
            throw new Error(`Invalid mod version: ${data.version}`)
        }

        if (typeof data.author !== 'string') {
            throw new Error(`Invalid mod author: ${data.author}`)
        }

        return new ProfileMod(data.id, profile.id, data.name, data.version, data.author)
    }

    /**
     * Serializes the current object into a plain JavaScript object representation.
     */
    private serializeDisk(): any {
        return {
            __version: 1,
            id: this.id,
            name: this.name,
            version: this.version,
            author: this.author
        }
    }
}

export class Profile {
    public readonly id: string

    public readonly gameId: string

    public name: string

    public loader: LoaderInstance | null

    public isLoaderInstalled: boolean

    public mods: ProfileMod[]

    constructor(id: string, gameId: string) {
        this.id = id
        this.gameId = gameId
        this.name = ''
        this.loader = null
        this.isLoaderInstalled = false
        this.mods = []
    }

    /**
     * Loads the mods for the current profile from the associated mods directory.
     * Scans the directory for mod folders and attempts to read their info.
     */
    public loadMods() {
        const diskPath = path.join(getAppDataPath(), 'profiles', this.id, 'mods')
        if (!fs.existsSync(diskPath)) {
            console.warn(`[Profile] Mods folder does not exist: ${diskPath}`)
            fs.mkdirSync(diskPath, {
                recursive: true
            })
            return
        }

        const directories = fs
            .readdirSync(diskPath, { withFileTypes: true })
            .filter((dirent) => dirent.isDirectory())
            .map((dirent) => dirent.name)

        for (const directory of directories) {
            const absolutePath = path.join(diskPath, directory)

            if (!fs.existsSync(path.join(absolutePath, 'modinfo.json'))) {
                continue
            }

            try {
                const mod = ProfileMod.readFromDisk(this, absolutePath)
                this.mods.push(mod)
            } catch (exception) {
                console.error(`[Application] Failed to read profile from disk: ${directory}`)
                console.error(exception)
            }
        }
    }

    /**
     * Writes the profile's data to the disk. Ensures the directory structure exists before writing files.
     */
    public writeToDisk() {
        console.log(`[Profile] Writing profile to disk: ${this.id}`)

        const diskPath = path.join(getAppDataPath(), 'profiles', this.id)
        if (!fs.existsSync(diskPath)) {
            console.log(`[Profile] Creating directory: ${diskPath}`)
            fs.mkdirSync(diskPath, { recursive: true })
        }

        const modsPath = path.join(diskPath, 'mods')
        if (!fs.existsSync(modsPath)) {
            console.log(`[Profile] Creating directory: ${modsPath}`)
            fs.mkdirSync(modsPath)
        }

        fs.writeFileSync(path.join(diskPath, 'profile.json'), JSON.stringify(this.serializeDisk()))
    }

    /**
     * Reads a profile object from a file located in the specified folder path.
     *
     * @param folderPath The path to the folder containing the profile JSON file.
     * @return The Profile object parsed from the JSON file.
     * @throws Error if the folder does not exist, if the profile file is not found, or if the profile version is unsupported.
     */
    public static readFromDisk(folderPath: string): Profile {
        if (!fs.existsSync(folderPath)) {
            throw new Error(`Folder does not exist`)
        }

        if (!fs.existsSync(path.join(folderPath, 'profile.json'))) {
            throw new Error(`Profile file does not exist`)
        }

        const data = fs.readFileSync(path.join(folderPath, 'profile.json'), {
            encoding: 'utf8'
        })
        const json = JSON.parse(data)

        /*
         * NOTE: We change this when we have version 2 or higher available.
         */
        if (!json.__version || json.__version !== 1) {
            throw new Error(`Unsupported profile version: ${json.__version}`)
        }

        const profile = Profile.parseVersion1(json)
        profile.loadMods()
        return profile
    }

    /**
     * Parses the provided data to create a `Profile` instance while validating its structure.
     *
     * @param data - The data object containing profile information to be parsed.
     * @return A `Profile` instance created with the validated `id`, `gameId`, and `name` from the provided data.
     * @throws Error if any required field is missing or has an invalid type.
     */
    private static parseVersion1(data: any): Profile {
        if (typeof data.id !== 'string') {
            throw new Error(`Invalid profile ID: ${data.id}`)
        }

        if (typeof data.gameId !== 'string') {
            throw new Error(`Invalid game ID: ${data.gameId}`)
        }

        if (typeof data.name !== 'string') {
            throw new Error(`Invalid profile name: ${data.name}`)
        }

        const profile = new Profile(data.id, data.gameId)
        profile.name = data.name

        if (typeof data.loader === 'object') {
            profile.loader = {
                loaderId: data.loader.id,
                version: data.loader.version
            }
        }

        return profile
    }

    /**
     * Returns the folder path for the profile.
     */
    public getFolderPath(): string {
        return path.join(getAppDataPath(), 'profiles', this.id)
    }

    /**
     * Serializes the current object into a plain JavaScript object representation.
     */
    private serializeDisk(): any {
        return {
            __version: 1,
            id: this.id,
            gameId: this.gameId,
            name: this.name,
            loader: this.loader
                ? {
                      id: this.loader.loaderId,
                      version: this.loader.version.version
                  }
                : null
        }
    }
}

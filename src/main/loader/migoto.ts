import { Loader, LoaderVersion } from './index'
import { GitHub, RepoLocation } from '@main/util/github'
import { Profile, ProfileMod } from '@main/game/profile'
import path from 'node:path'
import { downloadFile } from '@main/util/internet'
import fs from 'node:fs'
import { v4 } from 'uuid'
import { multiExists } from '@main/util/filesystem'
import child_process from 'node:child_process'
import { dialog } from 'electron'
import { Mod, ModFile } from '@preload/types/service'
import mime from 'mime-types'
import { Archive } from '@main/util/archive'
import { plugboo } from '@main/main'

const INJECTOR_LOCATION: RepoLocation = { owner: 'Plugboo', repo: 'injector' }

export class MigotoLoader extends Loader {
    private readonly configLocation: RepoLocation

    private readonly libsLocation: RepoLocation

    private readonly executable: string

    private configVersions: LoaderVersion[]

    private injectorVersions: LoaderVersion[]

    constructor(configLocation: RepoLocation, libsLocation: RepoLocation, executable: string) {
        super('migoto', '3DMigoto')
        this.configLocation = configLocation
        this.libsLocation = libsLocation
        this.executable = executable
        this.configVersions = []
        this.injectorVersions = []
    }

    public async startProcess(profile: Profile) {
        if (process.platform !== 'win32') {
            dialog.showMessageBoxSync({
                type: 'error',
                title: 'Start Failure',
                message: 'Plugboo can unfortunately only start this game, with this loader, on Windows.',
                buttons: ['Okay'],
                noLink: true
            })
            return
        }

        await this.startWindowsProcess(profile)
    }

    public async fetchVersions() {
        this.versions = []
        this.configVersions = []
        this.injectorVersions = []

        try {
            {
                const releases = await GitHub.getReleases(this.libsLocation.owner, this.libsLocation.repo)
                for (const release of releases) {
                    if (release.draft) {
                        continue
                    }

                    for (const asset of release.assets) {
                        if (
                            asset.content_type !== 'application/x-zip-compressed' &&
                            asset.content_type !== 'application/zip'
                        ) {
                            continue
                        }

                        /*
                         * FIX: Asset being a literal JSON file, but GitHub says Content-Type "application/zip"???
                         */
                        if (asset.name.endsWith('.json')) {
                            continue
                        }

                        this.versions.push({
                            version: release.tag_name,
                            file: {
                                name: asset.name,
                                url: asset.browser_download_url
                            }
                        })
                    }
                }
            }

            {
                const releases = await GitHub.getReleases(this.configLocation.owner, this.configLocation.repo)
                for (const release of releases) {
                    if (release.draft) {
                        continue
                    }

                    for (const asset of release.assets) {
                        if (
                            asset.content_type !== 'application/x-zip-compressed' &&
                            asset.content_type !== 'application/zip'
                        ) {
                            continue
                        }

                        this.configVersions.push({
                            version: release.tag_name,
                            file: {
                                name: asset.name,
                                url: asset.browser_download_url
                            }
                        })
                    }
                }
            }

            {
                const releases = await GitHub.getReleases(INJECTOR_LOCATION.owner, INJECTOR_LOCATION.repo)
                for (const release of releases) {
                    if (release.draft) {
                        continue
                    }

                    for (const asset of release.assets) {
                        if (asset.content_type !== 'application/x-msdownload') {
                            continue
                        }

                        this.injectorVersions.push({
                            version: release.tag_name,
                            file: {
                                name: asset.name,
                                url: asset.browser_download_url
                            }
                        })
                    }
                }
            }
        } catch (exception) {
            console.error(`[MigotoLoader] Failed to fetch versions:`, exception)
        }
    }

    public async installVersion(profile: Profile) {
        if (profile.loader === null) {
            throw new Error('Profile does not have a loader assigned.')
        }

        const version = this.versions.find((v) => v.version === profile.loader.version.version)
        if (version === undefined) {
            throw new Error(`Profile does not have a valid loader version (${profile.loader.version.version}).`)
        }

        {
            const downloadPath = path.resolve(profile.getFolderPath(), `${v4()}.zip`)

            /*
             * Download required library files (e.g., d3d11.dll)
             */
            const downloadResult = await downloadFile(version.file.url, downloadPath, (progress) => {
                console.log(`[MigotoLoader] Downloading library files (${version.version}): ${progress}%`)
            })

            if (!downloadResult) {
                throw new Error(`Failed to download library files (${version.version}).`)
            }

            const archive = new Archive(downloadPath)
            await archive.unpack(profile.getFolderPath())
            fs.rmSync(downloadPath)
        }

        {
            const version = this.configVersions[0]
            const downloadPath = path.resolve(profile.getFolderPath(), `${v4()}.zip`)

            /*
             * Download required config files (e.g., d3dx.ini)
             */
            const downloadResult = await downloadFile(version.file.url, downloadPath, (progress) => {
                console.log(`[MigotoLoader] Downloading config files (${version.version}): ${progress}%`)
            })

            if (!downloadResult) {
                throw new Error(`Failed to download config files (${version.version}).`)
            }

            const archive = new Archive(downloadPath)
            await archive.unpack(profile.getFolderPath())
            fs.rmSync(downloadPath)
        }

        {
            const version = this.injectorVersions[0]
            const downloadPath = path.resolve(profile.getFolderPath(), `injector.exe`)

            const downloadResult = await downloadFile(version.file.url, downloadPath, (progress) => {
                console.log(`[MigotoLoader] Downloading injector (${version.version}): ${progress}%`)
            })

            if (!downloadResult) {
                throw new Error(`Failed to download injector (${version.version}).`)
            }
        }
    }

    public validateInstallation(profile: Profile): boolean {
        return multiExists(profile.getFolderPath(), ['d3dx.ini', 'd3d11.dll', 'injector.exe'])
    }

    public async installMod(profile: Profile, mod: Mod, file: ModFile) {
        const extension = mime.extension(file.mimetype)
        if (!extension || !['7z', 'zip', 'rar'].includes(extension)) {
            throw new Error('Invalid file type.')
        }

        const folderPath = path.resolve(profile.getFolderPath(), 'mods', String(mod.id))
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath)
        }

        const downloadPath = path.resolve(folderPath, `${v4()}.${extension}`)
        const downloadResult = await downloadFile(file.url, downloadPath, (progress) => {
            console.log(`[MigotoLoader] Downloading mod file (${mod.id}): ${progress}%`)
        })

        if (!downloadResult) {
            throw new Error(`Failed to download mod file (${mod.id}).`)
        }

        console.log('[MigotoLoader] Finished mod download.')

        const dataPath = path.resolve(folderPath, 'data')
        if (!fs.existsSync(dataPath)) {
            fs.mkdirSync(dataPath)
        }

        const archive = new Archive(downloadPath)
        await archive.unpack(dataPath)

        const resultMod = new ProfileMod(String(mod.id), profile.id, mod.name, mod.version, mod.author.name)
        resultMod.isEnabled = true
        resultMod.writeToDisk()
        console.log(`[MigotoLoader] Installed mod (${mod.id})`)

        fs.rmSync(downloadPath)
    }

    private async startWindowsProcess(profile: Profile) {
        const installPath = await plugboo.getConfigEntry(`games.${profile.gameId}.installPath`)
        if (typeof installPath !== 'string' || installPath.length === 0) {
            console.error('[MigotoLoader] Install path not found in config.json.')
            return
        }

        const loaderPath = path.resolve(profile.getFolderPath(), 'injector.exe')

        if (!fs.existsSync(loaderPath)) {
            console.error('[MigotoLoader] Loader Executable not found:', loaderPath)
            return
        }

        console.log(installPath)

        const process = child_process.exec(
            `injector.exe -m d3d11.dll -t "${this.executable}" -l "${installPath}\\${this.executable}"`,
            {
                cwd: profile.getFolderPath()
            }
        )

        process.stdout.setEncoding('utf8')
        process.stderr.setEncoding('utf8')

        process.stdout.on('data', (chunk) => {
            console.log('[MigotoLoader] - Loader Process - STDOUT: ' + chunk)
        })

        process.stderr.on('data', (chunk) => {
            console.log('[MigotoLoader] - Loader Process - STDERR: ' + chunk)
        })

        process.on('exit', (code) => {
            console.log('[MigotoLoader] - Loader Process - EXITED: ' + code)
        })

        process.unref()
    }
}

import { app, BrowserWindow, dialog, globalShortcut, Menu, net, session, shell, Tray } from 'electron'
import { compareVersions } from 'compare-versions'
import settings from 'electron-settings'
import path from 'node:path'
import { checkForInternet } from '@main/util/internet'
import { Settings } from '@main/application/settings'
import { GitHub, Release } from '@main/util/github'
import { plugboo } from '@main/main'
import { IpcManager } from '../ipc/manager'
import { GameManager } from '@main/game/manager'
import fs from 'node:fs'
import { Profile } from '@main/game/profile'
import { pathToFileURL } from 'node:url'
import { Archive } from '@main/util/archive'
import { hookConsole, unhookConsole } from '@main/util/logger'
import { ipcListGames } from '@main/ipc/game/list'
import { ipcVerifyGame } from '@main/ipc/game/verify'
import { ipcSetupGame } from '@main/ipc/game/setup'
import { ipcListLoaders } from '@main/ipc/game/loaders'
import { ipcGetProfile } from '@main/ipc/game/profiles/get'
import { ipcCreateProfile } from '@main/ipc/game/profiles/create'
import { ipcListProfiles } from '@main/ipc/game/profiles/list'
import { ipcStartProfile } from '@main/ipc/game/profiles/start'
import { ipcInstallMod } from '@main/ipc/game/profiles/mods/install'
import { ipcUninstallMod } from '@main/ipc/game/profiles/mods/uninstall'
import { ipcPendingInstalls } from '@main/ipc/game/profiles/mods/pending'
import { ipcSearchMods } from '@main/ipc/mods/search'
import { ipcGetComments } from '@main/ipc/mods/comments'
import { ipcGetMod } from '@main/ipc/mods/get'
import { ipcWindowMinimize } from '@main/ipc/window/minimize'
import { ipcWindowMaximize } from '@main/ipc/window/maximize'
import { ipcWindowClose } from '@main/ipc/window/close'

export class Plugboo {
    private readonly instanceLock: boolean

    private mainWindow: BrowserWindow | null

    private tray: Tray | null

    private settings: Settings

    private shouldExit: boolean

    constructor() {
        hookConsole()

        this.instanceLock = app.requestSingleInstanceLock()
        this.mainWindow = null
        this.tray = null
        this.shouldExit = false

        /*
         * Default settings when starting Plugboo.
         */
        this.settings = {
            window: {
                titleBar: 'custom',
                exitOnClose: false
            },
            theme: 'dark'
        }

        /*
         * Allow only one instance of Plugboo to be running.
         */
        if (!this.instanceLock) {
            app.quit()
            console.error('Another instance is running, quitting.')
            return
        }

        app.on('ready', async () => {
            /*
             * Check for an active internet connection, so we can fetch for an available update from GitHub.
             * The check won't be run in development mode, as to not annoy developers and stop getting
             * rate-limited from GitHub.
             */
            checkForInternet().then(async (result) => {
                if (!result || !app.isPackaged) {
                    return
                }

                const availableRelease = await this.checkForUpdate()
                if (availableRelease === null) {
                    return
                }

                dialog.showMessageBoxSync({
                    type: 'info',
                    title: 'Update Available',
                    message: `An update is available (${availableRelease.tag_name}). Would you like to download it?`,
                    buttons: ['Yes', 'No'],
                    defaultId: 0,
                    cancelId: 1,
                    noLink: true,
                    detail: 'This update will automatically be installed when you restart Plugboo.'
                })

                // TODO: Add implementation for updating Plugboo to the latest version.
            })

            await this.init()
        })

        app.on('second-instance', () => {
            if (this.mainWindow === null) {
                return
            }

            this.mainWindow.show()
        })

        app.on('quit', () => {
            unhookConsole()
        })
    }

    public sendEventToMain(channel: string, ...args: any[]) {
        if (this.mainWindow === null) {
            return
        }

        this.mainWindow.webContents.send(channel, ...args)
    }

    /**
     * Initializes the main application window and settings.
     *
     * @return A promise that resolves when the initialization process is complete.
     */
    private async init() {
        if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
            Archive.copyBinaries()
        } else {
            Archive.fixPaths()
        }

        this.initIpc()
        this.initProtocols()

        await this.initGames()
        await this.initSettings()

        this.readProfilesFromDisk()

        this.mainWindow = new BrowserWindow({
            title: 'Plugboo',
            width: 1340,
            height: 850,
            minWidth: 1050,
            minHeight: 620,
            autoHideMenuBar: true,
            enableLargerThanScreen: true,
            frame: this.settings.window.titleBar === 'native',
            show: false,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js')
            }
        })

        this.mainWindow.webContents.setWindowOpenHandler((details) => {
            console.log('[Application] Opening link: ' + details.url)
            shell.openExternal(details.url)
            return { action: 'deny' }
        })

        if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
            await this.mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
        } else {
            await this.mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`))

            /*
             * Disable site reloading when not in development mode.
             */
            app.on('browser-window-focus', function () {
                globalShortcut.register('CommandOrControl+R', () => {})
                globalShortcut.register('F5', () => {})
            })

            app.on('browser-window-blur', function () {
                globalShortcut.unregister('CommandOrControl+R')
                globalShortcut.unregister('F5')
            })
        }

        /*
         * Create an application tray when the application cannot be quit by closing the main window.
         */
        if (!this.settings.window.exitOnClose) {
            /*
             * Instead of closing the window, hide it.
             */
            this.mainWindow.on('close', (event) => {
                if (this.shouldExit) {
                    return
                }

                this.mainWindow.hide()
                event.preventDefault()
            })

            this.tray = new Tray(
                MAIN_WINDOW_VITE_DEV_SERVER_URL
                    ? `${app.getAppPath()}/assets/icon.png`
                    : `${app.getAppPath()}/../assets/icon.png`
            )
            this.tray.setContextMenu(
                Menu.buildFromTemplate([
                    { label: 'Plugboo', type: 'normal', enabled: false },
                    { type: 'separator' },
                    {
                        label: 'Open',
                        type: 'normal',
                        click: () => {
                            const window = plugboo.mainWindow
                            if (window !== null) {
                                window.show()
                            }
                        }
                    },
                    {
                        label: 'Quit',
                        type: 'normal',
                        click: () => {
                            this.shouldExit = true
                            this.mainWindow.close()
                            app.quit()
                        }
                    }
                ])
            )
        }

        /*
         * FIX: Window showing a blank screen while loading the page.
         */
        this.mainWindow.show()
    }

    /**
     * Initializes all supported games.
     */
    private async initGames() {
        /*
         * Load every installation path from all supported games from the settings.json file.
         */
        for (const game of GameManager.getGames()) {
            const key = `games.${game.info.id}.installPath`
            const value = await this.getConfigEntry(key)

            if (typeof value !== 'string' && value !== null) {
                await this.setConfigEntry(key, null)
                continue
            }

            if (value !== null && !game.validatePath(value)) {
                console.warn(`[Application] Invalid installation path for game '${game.info.name}': ${value}`)
                await this.setConfigEntry(key, null)
                continue
            }

            game.installPath = value
        }
    }

    /**
     * Initializes application settings by fetching and validating configuration entries.
     * If an invalid configuration is found, it will be overwritten with the default value.
     */
    private async initSettings() {
        const titleBar = await this.getOrDefaultConfigEntry('window.titleBar', 'custom')
        const exitOnClose = await this.getOrDefaultConfigEntry('window.exitOnClose', false)
        const theme = await this.getOrDefaultConfigEntry('theme', 'dark')

        if (titleBar !== 'native' && titleBar !== 'custom') {
            await this.setConfigEntry('window.titleBar', 'custom')
        }

        if (theme !== 'light' && theme !== 'dark') {
            await this.setConfigEntry('window.theme', 'dark')
        }

        this.settings = {
            window: {
                titleBar: titleBar as 'native' | 'custom',
                exitOnClose: exitOnClose
            },
            theme: theme as 'light' | 'dark'
        }
    }

    /**
     * Initializes inter-process communication (IPC) handlers.
     */
    private initIpc() {
        IpcManager.init()

        IpcManager.registerHandler('window/minimize', ipcWindowMinimize)
        IpcManager.registerHandler('window/maximize', ipcWindowMaximize)
        IpcManager.registerHandler('window/close', ipcWindowClose)

        IpcManager.registerHandler('game/list', ipcListGames)
        IpcManager.registerHandler('game/verify', ipcVerifyGame)
        IpcManager.registerHandler('game/setup', ipcSetupGame)
        IpcManager.registerHandler('game/profiles', ipcListProfiles)
        IpcManager.registerHandler('game/loaders', ipcListLoaders)
        IpcManager.registerHandler('game/profiles/create', ipcCreateProfile)
        IpcManager.registerHandler('game/profiles/get', ipcGetProfile)
        IpcManager.registerHandler('game/profiles/start', ipcStartProfile)
        IpcManager.registerHandler('game/profiles/mods/install', ipcInstallMod)
        IpcManager.registerHandler('game/profiles/mods/uninstall', ipcUninstallMod)
        IpcManager.registerHandler('game/profiles/mods/install/list', ipcPendingInstalls)

        IpcManager.registerHandler('mods/search', ipcSearchMods)
        IpcManager.registerHandler('mods/get', ipcGetMod)
        IpcManager.registerHandler('mods/comments', ipcGetComments)

        IpcManager.registerHandler('app/titlebar', () => {
            return this.settings.window.titleBar
        })
    }

    private initProtocols() {
        session.defaultSession.protocol.handle('assets', (request: GlobalRequest) => {
            const fileUrl = request.url.replace('assets://', '')
            const assetsPath = path.join(app.getAppPath(), 'assets')
            const filePath = path.join(assetsPath, fileUrl)
            if (!filePath.startsWith(assetsPath)) {
                return null
            }

            return net.fetch(pathToFileURL(filePath).toString())
        })

        session.defaultSession.protocol.handle('profile', (request: GlobalRequest) => {
            const fileUrl = request.url.replace('profile://', '')
            const parts = fileUrl.split('/')

            /*
             * We currently only support getting the mod icon.
             */
            if (parts.length !== 3) {
                return null
            }

            const profileId = parts[0]
            const modId = parts[1]
            const item = parts[2]

            if (item !== 'icon') {
                return null
            }

            const iconPath = path.join(getAppDataPath(), 'profiles', profileId, 'mods', modId, 'icon.png')
            if (!fs.existsSync(iconPath)) {
                return null
            }

            return net.fetch(pathToFileURL(iconPath).toString())
        })
    }

    /**
     * Reads user profiles from the disk, validating their structure, and associates them with their respective games.
     * Ensures that the profiles directory exists, iterates over all subdirectories, and loads profile data if valid.
     */
    public readProfilesFromDisk() {
        const profilesPath = path.resolve(getAppDataPath(), 'profiles')

        if (!fs.existsSync(profilesPath)) {
            fs.mkdirSync(profilesPath, { recursive: true })
            return
        }

        const directories = fs
            .readdirSync(profilesPath, { withFileTypes: true })
            .filter((dirent) => dirent.isDirectory())
            .map((dirent) => dirent.name)

        for (const directory of directories) {
            const absolutePath = path.join(profilesPath, directory)

            if (!fs.existsSync(path.join(absolutePath, 'profile.json'))) {
                continue
            }

            try {
                const profile = Profile.readFromDisk(absolutePath)
                const game = GameManager.getGame(profile.gameId)
                if (game === null) {
                    console.warn(`[Application] Failed to read profile from disk: ${directory} (Game not found)`)
                    continue
                }

                if (profile.loader !== null) {
                    const loader = game.loaders.find((v) => v.id === profile.loader.loaderId)
                    if (loader !== null) {
                        /*
                         * Check if the loader is already installed on that profile.
                         * If yes, it should be ready to start.
                         */
                        profile.isLoaderInstalled = loader.validateInstallation(profile)

                        if (!profile.isLoaderInstalled) {
                            console.warn(
                                `[Application] Profile '${profile.id}' does not have the loader successfully installed (id: ${profile.loader.loaderId}, version: ${profile.loader.version})`
                            )
                        }
                    } else {
                        console.warn(
                            `[Application] Profile '${profile.id}' contains unknown loader data (id: ${profile.loader.loaderId}, version: ${profile.loader.version})`
                        )
                    }
                }

                game.profiles.push(profile)
            } catch (exception) {
                console.error(`[Application] Failed to read profile from disk: ${directory}`)
                console.error(exception)
            }
        }
    }

    /**
     * Retrieves the configuration value for the specified key. If the key does not exist, the provided default value is saved and returned.
     *
     * @param key - The key to retrieve the configuration value for.
     * @param defaultValue - The default value to use if no value exists for the specified key.
     * @return A promise resolving to the saved or retrieved configuration value.
     */
    public async getOrDefaultConfigEntry<T>(key: string, defaultValue: T): Promise<T> {
        if (await settings.has(key)) {
            const savedValue = await settings.get(key)

            if (typeof defaultValue !== typeof savedValue) {
                console.warn(
                    `Overwriting setting '${key}' because the type of the new value (${typeof defaultValue}) is different from the type of the old value (${typeof savedValue}).`
                )

                await this.setConfigEntry(key, defaultValue)
                return defaultValue
            }

            return savedValue as T
        }

        await this.setConfigEntry(key, defaultValue)
        return defaultValue
    }

    /**
     * Retrieves the configuration entry for a specified key.
     *
     * @param key - The key associated with the configuration entry to retrieve.
     * @return A promise that resolves to the configuration entry if it exists, or undefined if it does not.
     */
    public async getConfigEntry(key: string): Promise<any> {
        if (await settings.has(key)) {
            return await settings.get(key)
        }

        return undefined
    }

    /**
     * Sets a configuration entry in the settings with the specified key and value.
     *
     * @param key - The key of the configuration entry to be set.
     * @param value - The value to associate with the specified key.
     * @return A promise that resolves when the configuration entry has been set.
     */
    public async setConfigEntry<T>(key: string, value: T): Promise<void> {
        await settings.set(key, value as any)
    }

    /**
     * Checks for updates by querying the GitHub releases API and comparing the version of the current application with the available releases.
     *
     * @return A Promise that resolves to the latest release with a newer version than the current application version
     * or null if no newer release is found or if an error occurs during the process.
     */
    private async checkForUpdate(): Promise<Release | null> {
        try {
            const releases = await GitHub.getReleases('Plugboo', 'app')
            const newerReleases: Release[] = []

            for (const release of releases) {
                const releaseVersion = release.tag_name

                if (compareVersions(releaseVersion, app.getVersion()) === 1) {
                    newerReleases.push(release)
                }
            }

            /*
             * Plugboo is up to date or no releases were found.
             */
            if (newerReleases.length === 0) {
                return null
            }

            /*
             * Sort every newer release and get back the newest of them ALL.
             */
            return newerReleases.sort((a, b) => -compareVersions(a.tag_name, b.tag_name))[0]
        } catch (exception) {
            return null
        }
    }

    public getMainWindow(): BrowserWindow | null {
        return this.mainWindow
    }
}

/**
 * Retrieves the application data path for the current application.
 * Combines the system's application data directory with the application's name.
 *
 * @returns The resolved path to the application's data directory.
 */
export const getAppDataPath = (): string => path.resolve(app.getPath('appData'), app.getName())

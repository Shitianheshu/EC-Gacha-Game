import { app } from 'electron'
import path from 'node:path'
import fs from 'node:fs'

export namespace HoYoPlay {
    export interface Installation {
        download_transaction_no: string
        downloading: boolean
        enablePcdn: boolean
        errorCode: string
        gameBiz: string
        gameInstallStatus: GameInstallStatus
        gameSettings: GameSettings
        gameShortLang: string
        gameShortcutName: string
        installPath: string
        isCreateShortcut: boolean
        isDelayToCreateShortcut: boolean
        isV2Linked: boolean
        needCreateStartMenuShortcut: boolean
        needRepairV2Chunk: boolean
        packageName: string
        persistentInstallPath: string
        playStatus: PlayStatus
        predownload_tag: string
        predownload_tag_version: string
        v2RepairChunkFinished: boolean
    }

    export interface GameInstallStatus {
        gameExeName: string
        sophonModeNew: string
        sophonUpdateMode: string
        uapc: string
    }

    export interface GameSettings {
        isUseHypSessionSet: boolean
        useHypSession: boolean
    }

    export interface PlayStatus {
        installTime: string
        lastPlayTime: string
    }

    export class Launcher {
        /**
         * Retrieves the list of installations stored in the game data file.
         *
         * This method reads the `gamedata.dat` file from the installed HoYoPlay launcher files,
         * parses its content, and extracts installation information using a regular expression.
         * If the file does not exist or an error occurs during reading or parsing, an empty list is returned.
         *
         * @return An array of `Installation` objects representing the installations.
         *                                  Returns an empty array if the file cannot be found or parsed.
         */
        public static getInstallations(): Installation[] {
            /*
             * Not sure if the "1_0" part is going to be changed...
             */
            const dataPath = path.join(app.getPath('appData'), 'Cognosphere', 'HYP', '1_0', 'data', 'gamedata.dat')

            if (!fs.existsSync(dataPath)) {
                console.error('[HoYoPlay] Failed to get installations. File could not be found:', dataPath)
                return []
            }

            try {
                const data = fs.readFileSync(dataPath, {
                    encoding: 'utf8'
                })

                const regex = /(?<={"download_transaction_no)(.*?)(?=,"version")/gm
                const result: Installation[] = []

                let regexResult
                while ((regexResult = regex.exec(data)) !== null) {
                    if (regexResult.index === regex.lastIndex) {
                        regex.lastIndex++
                    }

                    regexResult.forEach((match) => {
                        const complete = `{"download_transaction_no${match}}`
                        result.push(JSON.parse(complete))
                    })
                }

                return result
            } catch (error) {
                console.error('[HoYoPlay] Exception occurred while reading installations file: ', error)
                return []
            }
        }
    }
}

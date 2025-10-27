import fs from 'node:fs'
import { spawn } from 'child_process'
import path from 'node:path'
import { matchArrays } from '@main/util/array'

export const RarMagicNumbers = [
    [0x52, 0x61, 0x72, 0x21, 0x1a, 0x07, 0x00],
    [0x52, 0x61, 0x72, 0x21, 0x1a, 0x07, 0x01, 0x00]
]

export enum UnrarFileType {
    UNKNOWN = 'Unknown',
    FILE = 'File',
    DIRECTORY = 'Directory'
}

export interface UnrarFile {
    name: string
    type: UnrarFileType
    size: number | null
    packedSize: number | null
    ratio: string | null
    modified: string
    attributes: string
    crc32: string | null
}

export class Unrar {
    private readonly executable: string

    private readonly filePath: string

    constructor(filePath: string) {
        if (!fs.existsSync(filePath)) {
            throw new Error('File does not exist')
        }

        if (!Unrar.isRarFile(filePath)) {
            throw new Error('File is not a RAR archive')
        }

        this.executable = path.resolve(__dirname, '..', '..', 'bin', 'win', 'unrar.exe')
        this.filePath = filePath
    }

    /**
     * Extracts files from an archive to the specified location.
     * Allows filtering of entries based on a provided filter function.
     *
     * @param location - The destination directory where the files should be unpacked.
     * @param filter - An optional filtering function to exclude specific entries from being unpacked
     * @return Resolves when the unpacking process is complete.
     */
    public async unpack(location: string, filter?: (item: UnrarFile) => boolean) {
        const files = filter ? await this.list() : []

        if (!fs.existsSync(location)) {
            fs.mkdirSync(location)
        }

        if (!filter) {
            await Unrar.spawnUnrar(this.executable, ['x', this.filePath, location])
            return
        }

        const excludes: string[] = []

        for (const file of files) {
            if (!filter(file)) {
                excludes.push(file.name)
            }
        }

        await Unrar.spawnUnrar(this.executable, ['x', this.filePath, location, ...excludes.map((v) => `-x${v}`)])
    }

    /**
     * Lists the contents of an archive file.
     *
     * @return A promise that resolves to an array of `UnrarFile` objects
     */
    public async list(): Promise<UnrarFile[]> {
        const content = await Unrar.spawnUnrar(this.executable, ['lt', this.filePath])
        const lines = content.split('\n')
        const files: UnrarFile[] = []

        /*
         * Parse the output from unrar.
         */
        while (true) {
            const raw = lines.shift()
            if (raw === undefined) {
                break
            }

            const line = raw.trimStart()

            /*
             * It's a new entry.
             */
            if (line.startsWith('Name:')) {
                const file: UnrarFile = {
                    name: line.split(':')[1].trimStart().replace('\r', ''),
                    type: UnrarFileType.UNKNOWN,
                    attributes: '',
                    size: null,
                    packedSize: null,
                    ratio: null,
                    modified: '',
                    crc32: null
                }

                /*
                 * Parse the remaining entry data.
                 */
                while (true) {
                    const raw2 = lines.shift()
                    if (raw2 === undefined) {
                        break
                    }

                    /*
                     * Should be the end of the entry.
                     */
                    const line2 = raw2.trimStart()
                    if (line2.length === 0) {
                        break
                    }

                    const parts = line2.split(':')

                    const key = parts[0]
                    const value = parts[1].trimStart().replace('\r', '')

                    switch (key) {
                        case 'Type':
                            switch (value) {
                                case 'File':
                                    file.type = UnrarFileType.FILE
                                    break
                                case 'Directory':
                                    file.type = UnrarFileType.DIRECTORY
                                    break
                                default:
                                    file.type = UnrarFileType.UNKNOWN
                                    break
                            }
                            break
                        case 'Size':
                            file.size = parseInt(value)
                            break
                        case 'Packed size':
                            file.packedSize = parseInt(value)
                            break
                        case 'Ratio':
                            file.ratio = value
                            break
                        case 'CRC32':
                            file.crc32 = value
                            break
                        case 'Attributes':
                            file.attributes = value
                            break
                        case 'Modified':
                            file.modified = value
                            break
                        /*
                         * Ignore these values.
                         */
                        case 'Compression':
                        case 'Host OS':
                            break
                        default:
                            console.warn(`[Unrar] Received unknown key '${key}' with value '${value}'. Ignoring..`)
                            break
                    }
                }

                files.push(file)
            }
        }

        return files
    }

    /**
     * Spawns a child process to execute the specified unrar command with the provided arguments.
     *
     * @param executable - The path to the unrar executable to be used.
     * @param args - An array of arguments to be passed to the unrar executable.
     * @return A promise that resolves with the output data (stdout) from the unrar command.
     */
    private static async spawnUnrar(executable: string, args: string[]): Promise<string> {
        return new Promise((resolve) => {
            const process = spawn(executable, args, {
                windowsHide: true
            })

            let data: string = ''

            process.stdout.on('data', (chunk) => {
                data += chunk.toString()
            })

            process.on('close', () => {
                resolve(data)
            })
        })
    }

    /**
     * Checks whether the provided file is a RAR file by examining its magic number.
     *
     * @param filePath The path to the file that needs to be checked.
     * @return Returns `true` if the file is identified as a RAR file, otherwise `false`.
     */
    private static isRarFile(filePath: string): boolean {
        const fileDescriptor = fs.openSync(filePath, 'r')

        const buffer = Buffer.alloc(8)
        if (fs.readSync(fileDescriptor, buffer, 0, 8, 0) !== 8) {
            throw new Error('Could not read file')
        }

        fs.closeSync(fileDescriptor)

        const magic = buffer.toString('hex').toUpperCase()
        const numbers = magic.match(/.{1,2}/g).map((v) => parseInt(v, 16))

        for (const magic of RarMagicNumbers) {
            const matchingLength = numbers.slice(0, magic.length)

            if (matchingLength.length !== magic.length) {
                continue
            }

            if (matchArrays(magic, matchingLength)) {
                return true
            }
        }

        return false
    }
}

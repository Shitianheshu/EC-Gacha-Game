import fs from 'node:fs'
import _7z from '7zip-min'
import path from 'node:path'
import { matchArrays } from '@main/util/array'
import { Unrar, UnrarFileType } from '@main/util/unrar'

export interface ArchiveItem {
    name: string
    absolutePath: string
    size: number
    isDirectory: boolean
}

enum Library {
    UNRAR = 0,
    SEVENZIP_MIN = 1
}

const TYPES: {
    library: Library
    magicNumbers: number[]
}[] = [
    {
        // 7z
        library: Library.SEVENZIP_MIN,
        magicNumbers: [0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c]
    },
    {
        // xz, tar.xz
        library: Library.SEVENZIP_MIN,
        magicNumbers: [0xfd, 0x37, 0x7a, 0x58, 0x5a, 0x00]
    },
    {
        // gz, tar.gz
        library: Library.SEVENZIP_MIN,
        magicNumbers: [0x1f, 0x8b]
    },
    {
        // bz2
        library: Library.SEVENZIP_MIN,
        magicNumbers: [0x42, 0x5a, 0x68]
    },
    {
        // tar
        library: Library.SEVENZIP_MIN,
        magicNumbers: [0x75, 0x73, 0x74, 0x61, 0x72, 0x00, 0x30, 0x30]
    },
    {
        // tar
        library: Library.SEVENZIP_MIN,
        magicNumbers: [0x75, 0x73, 0x74, 0x61, 0x72, 0x20, 0x20, 0x00]
    },
    {
        // zip
        library: Library.SEVENZIP_MIN,
        magicNumbers: [0x50, 0x4b, 0x03, 0x04]
    },
    {
        // zip (empty)
        library: Library.SEVENZIP_MIN,
        magicNumbers: [0x50, 0x4b, 0x05, 0x06]
    },
    {
        // zip (spanned)
        library: Library.SEVENZIP_MIN,
        magicNumbers: [0x50, 0x4b, 0x07, 0x08]
    },
    {
        // rar (v1.50+)
        library: Library.UNRAR,
        magicNumbers: [0x52, 0x61, 0x72, 0x21, 0x1a, 0x07, 0x00]
    },
    {
        // rar (v5.00+)
        library: Library.UNRAR,
        magicNumbers: [0x52, 0x61, 0x72, 0x21, 0x1a, 0x07, 0x01, 0x00]
    }
]

const BUFFER_SIZE = 8

export class Archive {
    /*
     * We may want to allow using a direct buffer instead of a saved file on the disk.
     */
    private readonly filePath: string

    private readonly library: Library

    constructor(filePath: string) {
        if (!fs.existsSync(filePath)) {
            throw new Error('File does not exist')
        }

        this.filePath = filePath
        this.library = Archive.getLibraryForFile(filePath)
    }

    /**
     * Extracts the contents of the archive to the specified location.
     *
     * @param location - The location where the contents will be unpacked.
     * @param filter - An optional filter to only extract some files when necessary.
     * @return A promise that resolves when the unpacking process is completed.
     */
    public async unpack(location: string, filter?: (entry: ArchiveItem) => boolean): Promise<void> {
        const entries = filter ? await this.list() : []
        const excludes: string[] = []

        switch (this.library) {
            case Library.UNRAR: {
                const unrar = new Unrar(this.filePath)
                if (!filter) {
                    await unrar.unpack(location)
                    return
                }

                for (const entry of entries) {
                    if (!filter(entry)) {
                        excludes.push(entry.absolutePath)
                    }
                }

                await unrar.unpack(location, (file) => {
                    return !excludes.includes(file.name)
                })
                break
            }
            case Library.SEVENZIP_MIN: {
                if (!filter) {
                    await _7z.unpack(this.filePath, location)
                    return
                }

                for (const entry of entries) {
                    if (!filter(entry)) {
                        excludes.push(entry.absolutePath)
                    }
                }

                await _7z.cmd(['x', this.filePath, `-o${location}`, ...excludes.map((v) => `-x!${v}`)])
                break
            }
        }
    }

    /**
     * Retrieves a list of archive items for the specified file.
     * Uses different libraries based on the given file to extract the list of items.
     *
     * @return A promise resolving to an array of archive items.
     */
    public async list(): Promise<ArchiveItem[]> {
        const entries: ArchiveItem[] = []

        switch (this.library) {
            case Library.UNRAR: {
                const result = await new Unrar(this.filePath).list()

                for (const entry of result) {
                    entries.push({
                        name: path.basename(entry.name),
                        absolutePath: entry.name,
                        size: Number(entry.size),
                        isDirectory: entry.type === UnrarFileType.DIRECTORY
                    })
                }
                break
            }
            case Library.SEVENZIP_MIN: {
                const result = await _7z.list(this.filePath)

                for (const entry of result) {
                    entries.push({
                        name: path.basename(entry.name),
                        absolutePath: entry.name,
                        size: Number(entry.size),
                        isDirectory: entry.attr === 'D'
                    })
                }
                break
            }
        }

        return entries
    }

    /**
     * Copies binary files for the 7z library.
     * Development only.
     */
    public static copyBinaries() {
        for (const os of ['win', 'mac', 'linux']) {
            const binaryPath = path.join(__dirname, '..', '..', 'node_modules', '7zip-bin', os)
            fs.cpSync(binaryPath, path.join(__dirname, os), {
                recursive: true
            })
        }
    }

    /**
     * Configures the binary path for the 7z library to ensure proper execution.
     * Production only.
     */
    public static fixPaths() {
        _7z.config({
            binaryPath: path.resolve(__dirname, '..', '..', '..', 'win', 'x64', '7za.exe')
        })
    }

    /**
     * Determines the appropriate library for the specified file based on its magic numbers.
     *
     * @param filePath - The path to the file to analyze.
     * @return The perfect library for parsing the file.
     * @throws {Error} If the file cannot be read or is not a supported archive.
     */
    private static getLibraryForFile(filePath: string): Library {
        const fileDescriptor = fs.openSync(filePath, 'r')

        const buffer = Buffer.alloc(BUFFER_SIZE)
        if (fs.readSync(fileDescriptor, buffer, 0, BUFFER_SIZE, 0) !== BUFFER_SIZE) {
            throw new Error('Could not read file')
        }

        fs.closeSync(fileDescriptor)

        const magic = buffer.toString('hex').toUpperCase()
        const numbers = magic.match(/.{1,2}/g).map((v) => parseInt(v, 16))

        for (const type of TYPES) {
            const matchingLength = numbers.slice(0, type.magicNumbers.length)

            if (matchingLength.length !== type.magicNumbers.length) {
                continue
            }

            if (matchArrays(type.magicNumbers, matchingLength)) {
                return type.library
            }
        }

        throw new Error('File is not a supported archive. Magic numbers: ' + magic)
    }
}

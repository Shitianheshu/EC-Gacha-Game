import path from 'node:path'
import fs from 'node:fs'

export function multiExists(basePath: string, items: string[]): boolean {
    const pathsNeedExist: string[] = [basePath, ...items.map((item) => path.join(basePath, item))]
    for (const path of pathsNeedExist) {
        if (!fs.existsSync(path)) {
            return false
        }
    }
    return true
}

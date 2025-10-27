import dns from 'dns'
import fetch from 'node-fetch'
import fs from 'node:fs'

/**
 * Checks for an active internet connection by attempting to resolve a DNS lookup for google.com.
 * This function resolves to a boolean indicating whether an internet connection is detected.
 *
 * @return A promise that resolves to true if internet is available, otherwise false.
 */
export async function checkForInternet(): Promise<boolean> {
    return new Promise((resolve) => {
        dns.lookup('google.com', (err) => {
            resolve(!err)
        })
    })
}

/**
 * Downloads a file from the specified URL and saves it to the given path on the local filesystem.
 * Optionally, can provide updates on the download progress.
 *
 * @param url - The URL of the file to download.
 * @param path - The local file path where the downloaded file should be stored.
 * @param progressCallback - Optional callback function that receives the download progress as a percentage.
 * @return Resolves to true if the file is downloaded successfully, otherwise false.
 */
export async function downloadFile(
    url: string,
    path: string,
    progressCallback?: (progress: number) => void
): Promise<boolean> {
    try {
        const res = await fetch(url)
        const stream = fs.createWriteStream(path)
        const total = parseInt(res.headers.get('content-length') ?? '0', 10)

        await new Promise((resolve, reject) => {
            res.body.pipe(stream)

            let lastProgress = 0
            res.body.on('data', () => {
                if (progressCallback !== undefined) {
                    const currentProgress = Math.round((stream.bytesWritten / total) * 100)
                    if (currentProgress !== lastProgress) {
                        progressCallback(currentProgress)
                        lastProgress = currentProgress
                    }
                }
            })
            res.body.on('error', reject)

            stream.on('finish', () => resolve(null))
        })

        return true
    } catch {
        return false
    }
}

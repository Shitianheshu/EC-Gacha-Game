import { CacheMap } from '@main/util/cache'

export interface Release {
    url: string
    id: number
    node_id: string
    tag_name: string
    target_commitish: string
    name: string
    draft: boolean
    immutable: boolean
    prerelease: boolean
    created_at: string
    published_at: string
    assets: Asset[]
    tarball_url: string
    zipball_url: string
    body: string
    mentions_count: number
}

export interface Asset {
    url: string
    id: number
    node_id: string
    name: string
    label: any
    content_type: string
    state: string
    size: number
    digest: any
    download_count: number
    created_at: string
    updated_at: string
    browser_download_url: string
}

export interface RepoLocation {
    owner: string
    repo: string
}

export class GitHub {
    private static releaseCache: CacheMap<RepoLocation, Release[]> = new CacheMap(1000 * 60 * 10)

    /**
     * Fetches the list of releases for a given GitHub repository.
     *
     * @param owner - The owner of the GitHub repository.
     * @param repo - The name of the GitHub repository.
     * @return A promise that resolves to an array of release objects.
     */
    public static async getReleases(owner: string, repo: string): Promise<Release[]> {
        const cache = this.releaseCache.get({ owner, repo })
        if (cache !== undefined) {
            return cache
        }

        try {
            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases`).then((res) =>
                res.json()
            )

            if (!Array.isArray(response)) {
                console.error('[GitHub] Received invalid response while trying to get releases:', response)
                return []
            }

            this.releaseCache.set({ owner, repo }, response)
            return response
        } catch (exception) {
            console.error('[GitHub] Failed to get releases:', exception)
            return []
        }
    }
}

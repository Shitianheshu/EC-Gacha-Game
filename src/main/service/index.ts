import { Comment, GetCommentsOptions, Mod, SearchModsOptions, SearchModsResponse } from '@preload/types/service'

export class Service {
    public readonly id: string

    public pendingInstalls: string[]

    constructor(id: string) {
        this.id = id
        this.pendingInstalls = []
    }

    /**
     * Searches for mods based on the provided criteria.
     *
     * @param options - An object containing the search criteria, such as filters, keywords, or sorting options.
     * @return A promise that resolves to the search results, which include a list of mods matching the criteria and additional metadata.
     */
    public async searchMods(options: SearchModsOptions): Promise<SearchModsResponse> {
        throw new Error('Not implemented')
    }

    /**
     * Retrieves a mod by its unique identifier.
     *
     * @param modId - The unique identifier of the mod to retrieve.
     * @return A promise that resolves to the mod object if found, or null if no mod with the given identifier exists.
     */
    public async getMod(modId: string): Promise<Mod | null> {
        throw new Error('Not implemented')
    }

    /**
     * Retrieves a list of comments associated with a given mod identifier.
     *
     * @param modId - The unique identifier of the mod for which comments are to be retrieved.
     * @param options - An object containing options to filter or modify the retrieval of comments.
     * @return A promise that resolves to an array of Comment objects.
     */
    public async getComments(modId: string, options: GetCommentsOptions): Promise<Comment[]> {
        throw new Error('Not implemented')
    }
}

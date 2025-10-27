export interface Mod {
    id: string
    name: string
    version: string
    media: Media[]
    createdAt: Date
    updatedAt: Date
    likes: number
    comments: number
    views: number
    author: Author
    tags: string[]
    content?: string
    nsfw: boolean
    files: ModFile[]
}

export interface ModFile {
    id: string
    name: string
    url: string
    mimetype: string
    md5: string
}

export interface Author {
    id: string
    name: string
    avatarUrl: string
}

export interface Image {
    url: string
    width?: number
    height?: number
}

export interface Media {
    originalImage: Image
    largeImage?: Image
    smallImage?: Image
    thumbnailImage?: Image
}

export interface Comment {
    id: string
    createdAt: Date
    updatedAt: Date
    replyCount: number
    content: string
    author: Author | null
}

export interface Category {
    id: string
    name: string
    itemCount: number
    iconUrl: string
}

export interface SearchModsOptions {
    page?: number
    limit?: number
    query?: string
    sort?: 'new' | 'default' | 'updated'
}

export interface SearchModsResponse {
    mods: Mod[]
    totalCount: number
}

export interface GetCommentsOptions {
    page?: number
}

export interface GameInformation {
    id: string
    name: string
    cover: string
    banner: {
        url: string
        type: 'image' | 'video'
    }
    icon: string
    developer: string
}

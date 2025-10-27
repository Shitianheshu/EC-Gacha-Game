export enum LoaderStatus {
    NOT_INSTALLED,
    INSTALLING,
    READY
}

export interface LoaderRData {
    id: string
    name: string
    versions: string[]
}

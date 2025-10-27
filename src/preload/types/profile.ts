import { ModRData } from './mod'
import { LoaderStatus } from '@preload/types/loader'

export interface ProfileRData {
    id: string
    gameId: string
    name: string
    mods: ModRData[]
    loaderStatus: LoaderStatus
}

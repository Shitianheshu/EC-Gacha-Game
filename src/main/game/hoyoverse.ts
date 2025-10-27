import { Game } from './index'
import { GameInformation } from '@preload/types/game'
import { HoYoPlay } from '@main/util/hoyoplay'
import { multiExists } from '@main/util/filesystem'
import { Loader } from '../loader'
import { MigotoLoader } from '@main/loader/migoto'
import { Service } from '@main/service'

export enum HoYoverseGameId {
    GenshinImpact = 'genshin_impact',
    HonkaiStarRail = 'honkai_star_rail',
    ZenlessZoneZero = 'zenless_zone_zero'
}

export class HoYoverseGame extends Game {
    private readonly gameId: HoYoverseGameId

    constructor(gameId: HoYoverseGameId, services: Service[]) {
        let info: GameInformation
        const loaders: Loader[] = []

        switch (gameId) {
            case HoYoverseGameId.GenshinImpact:
                info = {
                    id: 'genshin_impact',
                    name: 'Genshin Impact',
                    cover: 'https://cdn2.steamgriddb.com/thumb/2d273973a88b3ab45f0d0763300b0695.jpg',
                    icon: 'https://cdn2.steamgriddb.com/icon_thumb/54795ec619ebda94c86d00184861c96f.png',
                    banner: {
                        url: 'https://cdn2.steamgriddb.com/hero_thumb/75e913d400755a0d2782fc65e2035e97.webm',
                        type: 'video'
                    },
                    developer: 'HoYoverse'
                }
                loaders.push(
                    new MigotoLoader(
                        {
                            owner: 'SilentNightSound',
                            repo: 'GIMI-Package'
                        },
                        { owner: 'SpectrumQT', repo: 'XXMI-Libs-Package' },
                        'GenshinImpact.exe'
                    )
                )
                break
            case HoYoverseGameId.HonkaiStarRail:
                info = {
                    id: 'honkai_star_rail',
                    name: 'Honkai: Star Rail',
                    cover: 'https://cdn2.steamgriddb.com/thumb/7de88187918ddefb552555ae0a7fc9b6.jpg',
                    icon: 'https://cdn2.steamgriddb.com/icon_thumb/e52da5a31de788599378924f0e639557.png',
                    banner: {
                        url: 'https://cdn2.steamgriddb.com/hero_thumb/619ce5fef8ff39623f01c7fcb2fb8051.webm',
                        type: 'video'
                    },
                    developer: 'HoYoverse'
                }
                loaders.push(
                    new MigotoLoader(
                        {
                            owner: 'SpectrumQT',
                            repo: 'SRMI-Package'
                        },
                        { owner: 'SpectrumQT', repo: 'XXMI-Libs-Package' },
                        'StarRail.exe'
                    )
                )
                break
            case HoYoverseGameId.ZenlessZoneZero:
                info = {
                    id: 'zenless_zone_zero',
                    name: 'Zenless Zone Zero',
                    cover: 'https://cdn2.steamgriddb.com/thumb/97657e12f1b8cbf71b6837f02b23d423.jpg',
                    icon: 'https://cdn2.steamgriddb.com/icon_thumb/7029a498c4f596f73b35504df9bab02a.png',
                    banner: {
                        url: 'https://cdn2.steamgriddb.com/hero_thumb/912c3958f7545cc891334c5f671c7555.png',
                        type: 'image'
                    },
                    developer: 'HoYoverse'
                }
                loaders.push(
                    new MigotoLoader(
                        {
                            owner: 'leotorrez',
                            repo: 'ZZMI-Package'
                        },
                        { owner: 'SpectrumQT', repo: 'XXMI-Libs-Package' },
                        'ZenlessZoneZero.exe'
                    )
                )
                break
        }

        super(info, services, loaders)
        this.gameId = gameId
    }

    public validatePath(path: string): boolean {
        switch (this.gameId) {
            case HoYoverseGameId.GenshinImpact:
                return HoYoverseGame.validateGenshinImpactPath(path)
            case HoYoverseGameId.HonkaiStarRail:
                return HoYoverseGame.validateHonkaiStarRailPath(path)
            case HoYoverseGameId.ZenlessZoneZero:
                return HoYoverseGame.validateZenlessZoneZeroPath(path)
            default:
                return false
        }
    }

    public searchInstallation(): string | null {
        let exeName: string

        switch (this.gameId) {
            case HoYoverseGameId.GenshinImpact:
                exeName = 'GenshinImpact.exe'
                break
            case HoYoverseGameId.HonkaiStarRail:
                exeName = 'StarRail.exe'
                break
            case HoYoverseGameId.ZenlessZoneZero:
                exeName = 'ZenlessZoneZero.exe'
                break
        }

        return HoYoverseGame.searchHoyoPlayInstallation(exeName)
    }

    /**
     * Searches for a HoyoPlay installation based on the provided executable name and returns the installation path
     * if available and valid.
     *
     * @param exeName - The name of the executable file associated with the HoyoPlay installation.
     * @return The installation path of the HoyoPlay game if found and valid, or an empty string otherwise.
     */
    private static searchHoyoPlayInstallation(exeName: string): string | null {
        const hoyoInstallation = HoYoPlay.Launcher.getInstallations().find(
            (install) => install.gameInstallStatus.gameExeName === exeName
        )

        if (hoyoInstallation === undefined) {
            return null
        }

        if (hoyoInstallation.installPath.length === 0) {
            return null
        }

        return hoyoInstallation.installPath
    }

    private static validateGenshinImpactPath(installPath: string): boolean {
        return multiExists(installPath, [
            'GenshinImpact.exe',
            'HoYoKProtect.sys',
            'mhypbase.dll',
            'GenshinImpact_Data/'
        ])
    }

    private static validateHonkaiStarRailPath(installPath: string): boolean {
        return multiExists(installPath, ['StarRail.exe', 'HoYoKProtect.sys', 'mhypbase.dll', 'StarRail_Data/'])
    }

    private static validateZenlessZoneZeroPath(installPath: string): boolean {
        return multiExists(installPath, [
            'ZenlessZoneZero.exe',
            'HoYoKProtect.sys',
            'mhypbase.dll',
            'ZenlessZoneZero_Data/'
        ])
    }
}

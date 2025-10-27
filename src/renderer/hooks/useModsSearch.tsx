import { useState } from 'react'
import { searchMods } from '@renderer/api/mods'
import { Mod } from '@preload/types/service'

export default function useModsSearch(gameId: string) {
    const [mods, setMods] = useState<Mod[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)

    const search = (query: string, page: number) => {
        if (loading) {
            return
        }

        setLoading(true)
        searchMods(gameId, {
            page: page,
            query: query
        }).then((result) => {
            console.log(result)
            setMods(result.mods)
            setTotal(result.totalCount)
            setLoading(false)
        })
    }

    return {
        mods,
        total,
        loading,
        search
    }
}

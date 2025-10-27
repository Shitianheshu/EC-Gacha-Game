import { ProfileRData } from '@preload/types/profile'
import { useEffect, useState } from 'react'
import { getProfile } from '@renderer/api/game'

export default function useProfile(id: string) {
    const [profile, setProfile] = useState<ProfileRData | null>(null)
    const [loading, setLoading] = useState(true)

    const reload = () => {
        setLoading(true)
        getProfile(id).then((result) => {
            setProfile(result)
            setLoading(false)
        })
    }

    useEffect(() => {
        reload()
    }, [id])

    return {
        profile,
        loading,
        reload
    }
}

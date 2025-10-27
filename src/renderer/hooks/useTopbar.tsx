import { useEffect, useState } from 'react'
import { getAppTitleBar } from '@renderer/api/app'

export default function useTopbar() {
    const [state, setState] = useState(true)

    useEffect(() => {
        getAppTitleBar().then((result) => {
            setState(result === 'custom')
        })
    }, [])

    return state
}

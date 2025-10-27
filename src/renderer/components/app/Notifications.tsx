import { useEffect } from 'react'
import { toast, ToastContainer } from 'react-toastify'

export default function Notifications() {
    useEffect(() => {
        const events: (() => void)[] = []
        events.push(
            window.electron.ipc.on('game/profiles/mods/install', (modId: string, successful: boolean) => {
                if (!successful) {
                    toast.error(`Failed to install mod ${modId}!`)
                    return
                }

                toast.success(`Successfully installed mod ${modId}!`)
            })
        )

        return () => {
            events.forEach((remove) => remove())
        }
    }, [])

    return (
        <ToastContainer
            toastClassName="!bg-background-800 !text-text-100"
            position="bottom-right"
            hideProgressBar={false}
            draggable
            pauseOnHover
        />
    )
}

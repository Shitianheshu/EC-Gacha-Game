import { RefObject, useEffect, useState } from 'react'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { GameInformation } from '@preload/types/game'
import { setupGame } from '../../api/game'
import { ERROR_MESSAGES } from '../../lib/error'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@renderer/components/ui/dialog'

type Props = {
    open: boolean
    onChangeOpen: (open: boolean) => void
    game: GameInformation | null
    inputRef: RefObject<HTMLInputElement>
    onClickCancel?: () => void
    onSetupSuccess?: () => void
}

export default function SetupGameModal(props: Props) {
    const [lastOpenState, setLastState] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const onClickSetupConfirm = () => {
        if (props.inputRef.current === null) {
            console.log('Input Reference is null. This should not happen!')
            return
        }

        setupGame(props.game.id, props.inputRef.current.value).then((result: { success: boolean; reason?: string }) => {
            if (result.success) {
                if (props.onSetupSuccess) props.onSetupSuccess()
            } else {
                setError(ERROR_MESSAGES.get(result.reason ?? '') ?? 'Unknown error.')
            }
        })
    }

    // const onClickChange = () => {
    // pickFileDialog({ properties: ['openDirectory', 'dontAddToRecent'] }).then((result: OpenDialogReturnValue) => {
    //     if (result.canceled) {
    //         return
    //     }
    //
    //     const path = result.filePaths[0]
    //     if (props.inputRef.current) {
    //         props.inputRef.current.value = path
    //     }
    // })
    // }

    /*
     * Reset the error message when the Modal is being opened.
     * Could also implement this behavior when closing, but nah.
     */
    useEffect(() => {
        if (!lastOpenState && props.open) {
            setError(null)
        }

        setLastState(props.open)
    }, [props.open])

    return (
        <Dialog open={props.open} onOpenChange={props.onChangeOpen}>
            <DialogContent className="flex flex-col gap-8">
                <DialogHeader>
                    <DialogTitle>Setup Game</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 w-full h-full">
                    <Input ref={props.inputRef} placeholder="C:\Program Files" />
                    <p
                        className={`text-red-500 ${
                            error === null ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
                        }`}
                    >
                        Error: {error}
                    </p>
                    <div className="mt-auto flex ml-auto gap-4 select-none">
                        <Button variant="secondary" onClick={props.onClickCancel}>
                            Cancel
                        </Button>
                        <Button onClick={() => onClickSetupConfirm()}>Confirm</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

import { ProfileRData } from '@preload/types/profile'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@renderer/components/ui/dialog'

type Props = {
    open: boolean
    onChangeOpen: (open: boolean) => void
    profile: ProfileRData
}

export default function ProfileSettingsModal(props: Props) {
    return (
        <Dialog open={props.open} onOpenChange={props.onChangeOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Profile Settings</DialogTitle>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}

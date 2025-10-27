import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { useEffect, useState } from 'react'
import { LoaderRData } from '@preload/types/loader'
import { createProfile, getLoaders } from '@renderer/api/game'
import Select from '@renderer/components/ui/Select'
import { toast } from 'react-toastify'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@renderer/components/ui/dialog'

type Props = {
    gameId: string | null
    open: boolean
    onChangeOpen: (open: boolean) => void
    onCreate?: () => void
}

export default function CreateProfileModal(props: Props) {
    const [loaders, setLoaders] = useState<LoaderRData[]>([])
    const [selectedLoader, setSelectedLoader] = useState<LoaderRData | null>(null)
    const [selectedVersion, setSelectedVersion] = useState<string | null>(null)
    const [name, setName] = useState('')

    const onClickCreate = () => {
        if (props.gameId === null || selectedLoader === null || selectedVersion === null || name.trim().length === 0) {
            return
        }

        const promise = createProfile(props.gameId, name, selectedLoader.id, selectedVersion)

        toast
            .promise(promise, {
                pending: 'Creating profile...',
                success: 'Profile created!',
                error: 'Failed to create profile!'
            })
            .then((result) => {
                if (result.success) {
                    props.onChangeOpen(false)

                    if (props.onCreate) {
                        props.onCreate()
                    }
                }
            })
    }

    const onSelectVersion = (value: string) => {
        if (selectedLoader === null) {
            return
        }

        setSelectedVersion(selectedLoader.versions.find((v) => v === value) ?? null)
    }

    useEffect(() => {
        if (props.gameId === null) {
            return
        }

        getLoaders(props.gameId).then((result) => {
            setLoaders(result)
            console.log(result)
        })
    }, [props.gameId])

    useEffect(() => {
        if (props.open) {
            setSelectedLoader(null)
        }
    }, [props.open])

    return (
        <Dialog open={props.open} onOpenChange={props.onChangeOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Profile</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                    <div className="space-y-1">
                        <h2>Name</h2>
                        <Input onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <h2>Loader</h2>
                        <div className="space-y-2">
                            <Select
                                placeholder="Select a loader.."
                                onSelect={(value) => setSelectedLoader(loaders.find((v) => v.id === value) ?? null)}
                                values={loaders.map((loader) => ({
                                    value: loader.id,
                                    label: loader.name
                                }))}
                            />
                            {selectedLoader !== null && (
                                <Select
                                    placeholder="Select a version.."
                                    onSelect={(value) => onSelectVersion(value)}
                                    values={selectedLoader.versions.map((version) => ({
                                        value: version,
                                        label: version
                                    }))}
                                />
                            )}
                        </div>
                    </div>
                    <div className="mt-auto flex ml-auto gap-4 select-none">
                        <Button variant="secondary" onClick={() => props.onChangeOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={onClickCreate}>Create</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

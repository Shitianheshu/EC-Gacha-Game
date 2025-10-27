import { useState } from 'react'
import { FolderSearch2, Hammer, LoaderCircle, Play, Plus, Settings, TrashIcon } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'
import { startProfile, uninstallMod } from '@renderer/api/game'
import { Button } from '@renderer/components/ui/button'
import ProfileSettingsModal from '@renderer/components/modals/ProfileSettingsModal'
import { Input } from '@renderer/components/ui/input'
import { LoaderStatus } from '@preload/types/loader'
import useProfile from '@renderer/hooks/useProfile'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { Separator } from '@renderer/components/ui/separator'

export default function ProfilePage() {
    const { gameId, profileId } = useParams()
    const navigate = useNavigate()

    const { profile, loading, reload } = useProfile(profileId)
    const [search, setSearch] = useState('')

    const [settingsModalOpen, setSettingsModalOpen] = useState(false)

    const onClickStart = () => {
        if (profile === null) {
            return
        }

        switch (profile.loaderStatus) {
            case LoaderStatus.NOT_INSTALLED:
                break
            case LoaderStatus.READY: {
                startProfile(profileId).then()
                break
            }
        }
    }

    const onClickDelete = (modId: string) => {
        uninstallMod(profileId, modId).then((result) => {
            if (!result) {
                toast.error(`Failed to uninstall mod ${modId}!`)
                return
            }

            reload()
            toast.success(`Successfully uninstalled mod ${modId}!`)
        })
    }

    if (profile === null || loading) {
        return null
    }

    return (
        <motion.main className="w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {profile && (
                <div className="flex flex-col gap-5">
                    <ProfileSettingsModal
                        open={settingsModalOpen}
                        onChangeOpen={setSettingsModalOpen}
                        profile={profile}
                    />
                    <div className="flex justify-between">
                        <div>
                            <h1 className="font-bold text-3xl">{profile.name}</h1>
                        </div>
                        <div className="flex gap-2">
                            <Button className="flex gap-2" onClick={() => onClickStart()}>
                                {profile.loaderStatus === LoaderStatus.NOT_INSTALLED && (
                                    <>
                                        <Hammer />
                                        Repair
                                    </>
                                )}
                                {profile.loaderStatus === LoaderStatus.INSTALLING && (
                                    <>
                                        <LoaderCircle className="animate-spin" />
                                        Installing
                                    </>
                                )}
                                {profile.loaderStatus === LoaderStatus.READY && (
                                    <>
                                        <Play />
                                        Play
                                    </>
                                )}
                            </Button>
                            <Button size="icon" variant="secondary" onClick={() => setSettingsModalOpen(true)}>
                                <Settings />
                            </Button>
                        </div>
                    </div>

                    <Separator />

                    <div className="w-full flex gap-4">
                        <Input
                            placeholder="Search mods..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Button
                            className="ml-auto shrink-0 flex gap-1 justify-center items-center"
                            variant="secondary"
                            onClick={() => navigate(`/game/${gameId}/profile/${profileId}/mods`)}
                        >
                            <Plus />
                            Install Mods
                        </Button>
                    </div>

                    {profile.mods.length === 0 && (
                        <div className="flex flex-col gap-4 items-center justify-center h-32">
                            <div className="text-primary-400 bg-primary-600/35 rounded-full p-3">
                                <FolderSearch2 className="w-9 h-9" />
                            </div>
                            <h2 className="font-medium text-xl brightness-90">
                                It seems that no mods are installed on this profile.
                            </h2>
                        </div>
                    )}

                    {profile.mods.length > 0 && (
                        <div className="w-full rounded-2xl bg-background-800/50 border-2 border-background-700/80 flex flex-col">
                            {profile.mods
                                .filter((v) => v.name.toLowerCase().includes(search))
                                .map((mod, index) => (
                                    <div
                                        className={`w-full h-18 flex gap-3 p-2 ${index < profile.mods.length - 1 ? 'border-b-2 border-background-900/30' : ''}`}
                                        key={mod.id}
                                    >
                                        <div className="h-full aspect-square overflow-hidden rounded-lg shrink-0 outline-1 outline-white/20">
                                            <img
                                                className="w-full h-full object-cover"
                                                src={`profile://${profile.id}/${mod.id}/icon`}
                                                alt={`${mod.name}'s icon`}
                                            />
                                        </div>
                                        <div className="flex flex-col h-full justify-center">
                                            <p className="font-semibold">{mod.name}</p>
                                            <p className="font-normal opacity-60">{mod.author}</p>
                                        </div>
                                        <div className="ml-auto mr-2 h-full flex items-center">
                                            <Button size="icon" onClick={() => onClickDelete(mod.id)}>
                                                <TrashIcon />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            )}
        </motion.main>
    )
}

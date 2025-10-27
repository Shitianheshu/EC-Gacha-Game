import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { KeyboardEvent, MouseEvent, useEffect, useState } from 'react'
import { Mod } from '@preload/types/service'
import { Input } from '@renderer/components/ui/input'
import { Button } from '@renderer/components/ui/button'
import { Check, Download, LoaderCircle, RefreshCcw } from 'lucide-react'
import { motion } from 'framer-motion'
import Select from '@renderer/components/ui/Select'
import ModStats from '@renderer/components/mod/ModStats'
import { getPendingInstalls, getProfile, installMod } from '@renderer/api/game'
import useModsSearch from '@renderer/hooks/useModsSearch'
import { PaginationOverflow } from '@renderer/components/ui/pagination'
import { clamp } from 'motion'

type ModStatus = 'notInstalled' | 'installing' | 'installed'

function ModCard(props: {
    mod: Mod
    index: number
    gameId: string
    profileId: string
    status: ModStatus
    onClickInstall: () => void
}) {
    const onClickInstall = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        props.onClickInstall()
    }

    return (
        <motion.div
            className="w-full h-27 bg-background-800/50 p-3 rounded-xl drop-shadow-2xl brightness-100 hover:brightness-88 transition-all duration-150 cursor-pointer relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.065 * props.index }}
        >
            <div className="absolute right-0 top-0 h-full w-80 brightness-75 overflow-hidden mask-l-from-00% mask-l-to-100%">
                <img
                    className={`w-full h-full object-cover ${props.mod.nsfw ? 'blur-sm' : ''}`}
                    src={props.mod.media[0].smallImage.url}
                    alt={`${props.mod.name}'s screenshot`}
                />
            </div>
            <Link
                className="w-full h-full flex gap-4 overflow-hidden"
                to={`/game/${props.gameId}/profile/${props.profileId}/mods/${props.mod.id}`}
            >
                <div className="flex flex-col justify-between overflow-hidden grow-0">
                    <div className="flex flex-col">
                        <div className="flex gap-2 items-center">
                            <p className="font-semibold text-xl text-nowrap">{props.mod.name}</p>
                            {props.mod.nsfw && (
                                <p className="font-bold px-1.5 py-0.5 text-sm rounded-lg text-red-400 min-w-0 bg-red-600/30 grow-0 flex-none flex flex-row gap-4 h-6">
                                    NSFW
                                </p>
                            )}
                        </div>
                        <p className="font-medium text-base text-background-400 text-nowrap -mt-1">
                            {props.mod.author.name}
                        </p>
                    </div>
                    <ModStats mod={props.mod} />
                </div>
                <div className="ml-auto h-full flex flex-col gap-2 shrink-0 z-1">
                    <Button
                        className="mt-auto flex gap-2 shadow-2xl"
                        onClick={(e) => onClickInstall(e)}
                        disabled={props.status !== 'notInstalled'}
                    >
                        {props.status === 'notInstalled' && <Download />}
                        {props.status === 'installing' && (
                            <RefreshCcw className="animate-[spin_2s_linear_infinite_reverse]" />
                        )}
                        {props.status === 'installed' && <Check />}

                        {props.status === 'notInstalled' && 'Install'}
                        {props.status === 'installing' && 'Installing'}
                        {props.status === 'installed' && 'Installed'}
                    </Button>
                </div>
            </Link>
        </motion.div>
    )
}

export default function ModsPage() {
    const { gameId, profileId } = useParams()
    const navigate = useNavigate()
    const location = useLocation()

    const [pendingInstalls, setPendingInstalls] = useState<string[]>([])
    const [installedMods, setInstalledMods] = useState<string[]>([])

    const [lastInput, setLastInput] = useState('')
    const [input, setInput] = useState('')
    const [sort, setSort] = useState<'new' | 'default' | 'updated'>('default')
    const [page, setPage] = useState(-1)

    const searchHook = useModsSearch(gameId)

    const search = (force: boolean) => {
        if ((searchHook.loading && !force) || (!force && input === lastInput)) {
            return
        }

        setLastInput(input)

        if (input !== lastInput) {
            searchHook.search(input, 1)
            setPage(0)
        } else {
            searchHook.search(input, page + 1)
        }
    }

    const onInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            search(false)
        }
    }

    useEffect(() => {
        if (page < 0) {
            return
        }

        search(true)
    }, [sort, page])

    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const page = params.get('page')

        if (page) {
            setPage(Number(page))
        } else {
            setPage(0)
        }
    }, [])

    useEffect(() => {
        const event = window.electron.ipc.on('game/profiles/mods/install', (modId: string, successful: boolean) => {
            if (successful && !installedMods.includes(modId)) {
                setInstalledMods((prev) => [...prev, modId])
            }
        })

        getProfile(profileId).then((result) => {
            setInstalledMods(result.mods.map((v) => v.id))
        })

        getPendingInstalls(profileId, 'gamebanana').then((result) => setPendingInstalls(result))

        return () => {
            event()
        }
    }, [profileId])

    const maxPages = () => {
        return Math.ceil(searchHook.total / 15)
    }

    return (
        <motion.main className="w-full h-full overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex flex-col gap-4 pb-4 h-full">
                <div className="flex gap-2.5">
                    <Input
                        placeholder="Search mods..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={onInputKeyDown}
                    />
                    <Button onClick={() => search(true)} disabled={searchHook.loading}>
                        <RefreshCcw className={searchHook.loading ? 'animate-[spin_2s_linear_infinite_reverse]' : ''} />
                    </Button>
                </div>

                <div className="flex gap-3 h-full pb-8">
                    <div className="flex flex-col gap-3 flex-none h-[0%] w-60">
                        <div className="flex flex-col gap-2 p-4 bg-background-800/50 rounded-2xl">
                            <h1 className="font-semibold text-xl">Options</h1>
                            <Select
                                prefix="Sort by: "
                                values={[
                                    {
                                        value: 'default',
                                        label: 'Ripe'
                                    },
                                    {
                                        value: 'new',
                                        label: 'Newest'
                                    },
                                    {
                                        value: 'updated',
                                        label: 'Updated'
                                    }
                                ]}
                                defaultValue="default"
                                onSelect={(value) => {
                                    setSort(value as any)
                                }}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 w-full">
                        <PaginationOverflow
                            currentPage={page + 1}
                            maxPages={maxPages()}
                            onPageChange={(newPage: number) => {
                                const value = clamp(0, maxPages() - 1, newPage - 1)
                                setPage(value)
                                navigate(`/game/${gameId}/profile/${profileId}/mods?page=${value}`)
                            }}
                        />
                        <div className="flex flex-col gap-3 flex-auto overflow-y-auto pb-4">
                            {searchHook.loading && (
                                <div className="flex gap-1.5 justify-center items-center p-4 bg-background-800/20 rounded-2xl w-full h-32">
                                    <LoaderCircle className="animate-spin" />
                                    <h1>Loading</h1>
                                </div>
                            )}

                            {!searchHook.loading && searchHook.mods.length === 0 && (
                                <div className="flex gap-1.5 justify-center items-center p-4 bg-background-800/20 rounded-2xl w-full h-32">
                                    <h1>No results found for your query!</h1>
                                </div>
                            )}

                            {!searchHook.loading && searchHook.mods.length > 0 && (
                                <div className="w-full flex flex-col gap-2">
                                    {searchHook.mods.map((mod: Mod, index) => (
                                        <ModCard
                                            key={mod.id}
                                            mod={mod}
                                            index={index}
                                            gameId={gameId}
                                            profileId={profileId}
                                            status={
                                                installedMods.includes(String(mod.id))
                                                    ? 'installed'
                                                    : pendingInstalls.includes(String(mod.id))
                                                      ? 'installing'
                                                      : 'notInstalled'
                                            }
                                            onClickInstall={() => {
                                                installMod(profileId, 'gamebanana', mod.id)
                                                setPendingInstalls((prev) => [...prev, mod.id])
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.main>
    )
}

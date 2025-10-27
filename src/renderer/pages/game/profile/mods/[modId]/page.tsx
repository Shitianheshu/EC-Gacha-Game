import { useParams } from 'react-router'
import { motion } from 'framer-motion'
import React, { useEffect, useState } from 'react'
import { Comment, Media, Mod } from '@preload/types/service'
import { getMod, getModComments } from '@renderer/api/mods'
import { Download, LoaderCircle, SquareArrowOutUpRight } from 'lucide-react'

import { Button } from '@renderer/components/ui/button'
import Tabs from '@renderer/components/ui/Tabs'
import Tab from '@renderer/components/ui/Tab'
import ModStats from '@renderer/components/mod/ModStats'
import { Interweave, Node } from 'interweave'
import { Separator } from '@renderer/components/ui/separator'

export default function ModPage() {
    const { gameId, modId } = useParams()
    const [loading, setLoading] = useState(true)
    const [mod, setMod] = useState<Mod | null>(null)
    const [comments, setComments] = useState<Comment[]>([])
    const [fullscreenMedia, setFullscreenMedia] = useState<Media | null>(null)

    const transformContent = (node: HTMLElement, _children: Node[]): any => {
        if (node.tagName === 'HR') {
            return <Separator />
        }
    }

    useEffect(() => {
        setLoading(true)
        getMod(gameId, modId).then((result) => {
            console.log('[ModPage] Mod result:', result)
            setMod(result)
            setLoading(false)

            getModComments(gameId, modId, {}).then((result2) => {
                setComments(result2)
            })
        })
    }, [gameId, modId])

    return (
        <main className="w-full h-full">
            <div
                className={`overflow-hidden transition-all flex items-center justify-center absolute top-0 left-0 p-20 w-full h-full z-50 bg-background-900/70 backdrop-blur-lg ${fullscreenMedia ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            >
                <div className="absolute top-0 left-0 w-full h-full" onClick={() => setFullscreenMedia(null)} />
                {fullscreenMedia && mod && (
                    <img
                        className="z-60 rounded-xl max-w-full max-h-full object-contain bg-background-900/90"
                        src={fullscreenMedia.originalImage.url}
                        alt={`${mod.name}'s screenshot`}
                    />
                )}
            </div>

            <motion.div className="flex flex-col gap-4 pb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {loading && (
                    <div className="flex gap-1.5 justify-center items-center p-4 bg-background-800/20 rounded-2xl w-full h-32">
                        <LoaderCircle className="animate-spin" />
                        <h1>Loading</h1>
                    </div>
                )}

                {!loading && mod !== null && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="flex flex-col gap-4 w-full">
                            <div className="flex gap-3 h-22">
                                <div className="h-full aspect-square overflow-hidden rounded-lg shrink-0 outline-1 outline-white/20">
                                    <img
                                        className="w-full h-full object-cover"
                                        src={mod.media[0].originalImage.url}
                                        alt={`${mod.name}'s screenshot`}
                                    />
                                </div>
                                <div className="flex flex-col justify-between">
                                    <h1 className="text-2xl font-semibold">{mod.name}</h1>
                                    <ModStats mod={mod} />
                                </div>
                                <div className="flex items-center ml-auto h-full">
                                    <Button className="flex gap-2">
                                        <Download />
                                        Install
                                    </Button>
                                </div>
                            </div>
                            <Separator />

                            <div className="flex gap-4">
                                <Tabs
                                    classNames={{
                                        wrapper: 'w-full',
                                        contentWrapper: 'w-full'
                                    }}
                                >
                                    <Tab title="Description">
                                        <div className="p-4 bg-background-800/50 rounded-2xl">
                                            <Interweave content={mod.content ?? ''} transform={transformContent} />
                                        </div>
                                    </Tab>
                                    <Tab title="Gallery">
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                                            {mod.media.map((media) => (
                                                <div
                                                    className="p-2 bg-background-800 rounded-2xl flex-none"
                                                    key={media.originalImage.url}
                                                    onClick={() => setFullscreenMedia(media)}
                                                >
                                                    <div className="overflow-hidden rounded-xl">
                                                        <img
                                                            className="w-full h-full object-contain"
                                                            src={media.smallImage.url}
                                                            alt={`${mod.name}'s screenshot`}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Tab>
                                    <Tab title="Comments">
                                        <div className="p-4 bg-background-800/50 rounded-2xl flex flex-col gap-2 overflow-hidden">
                                            {comments.map((comment) => (
                                                <div
                                                    className="p-3 bg-background-800/60 rounded-xl w-full flex flex-col gap-2"
                                                    key={comment.id}
                                                >
                                                    {comment.author && (
                                                        <div className="flex gap-2 items-center">
                                                            <img
                                                                className="w-11 h-11 rounded-sm bg-background-900/50"
                                                                src={comment.author.avatarUrl}
                                                                alt={`${comment.author.name}'s avatar`}
                                                            />
                                                            <p className="text-lg">{comment.author.name}</p>
                                                        </div>
                                                    )}
                                                    <div
                                                        className="text-background-300"
                                                        dangerouslySetInnerHTML={{
                                                            __html: comment.content
                                                        }}
                                                    ></div>
                                                </div>
                                            ))}
                                        </div>
                                    </Tab>
                                </Tabs>
                                <div className="w-64 p-4 bg-background-800/50 rounded-2xl flex-none-height flex flex-col gap-2">
                                    <div className="flex flex-col gap-2">
                                        <h1 className="font-bold text-lg underline underline-offset-3 decoration-background-300/30">
                                            Submitter
                                        </h1>
                                        <div className="flex gap-2 items-center text-background-200">
                                            <img
                                                className="w-10 h-10 rounded-full"
                                                src={mod.author.avatarUrl}
                                                alt={`${mod.author.name}'s avatar`}
                                            />
                                            <div className="flex flex-col justify-center">
                                                <p className="font-semibold">{mod.author.name}</p>
                                                <p className="text-sm">Creator</p>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    <a
                                        className="mx-auto flex gap-1 items-center"
                                        href={`https://gamebanana.com/mods/${mod.id}`}
                                        target="_blank"
                                    >
                                        Open in Browser
                                        <SquareArrowOutUpRight className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </main>
    )
}

import { ReactNode, useEffect, useRef, useState } from 'react'
import { GameInformationWithVerified, listGames, verifyGame } from '@renderer/api/game'
import { GameInformation } from '@preload/types/game'
import { useNavigate } from 'react-router'
import SetupGameModal from '@renderer/components/modals/SetupGameModal'
import { motion } from 'framer-motion'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@renderer/components/ui/collapsible'
import { Button } from '@renderer/components/ui/button'
import { ChevronDown } from 'lucide-react'
import { twJoin } from 'tailwind-merge'
import { cn } from '@renderer/lib/style'

type GameCardProps = {
    game: GameInformationWithVerified
    onClick: () => void
}

type ContainerProps = { className?: string; title: string; children: ReactNode | ReactNode[] }

function GameCard(props: GameCardProps) {
    return (
        <div
            className="relative w-50 aspect-2/3 shrink-0 flex flex-col border-background-700 hover:border-primary-500 transition-color duration-300 drop-shadow-lg border-2 rounded-lg overflow-hidden cursor-pointer group"
            onClick={() => props.onClick()}
        >
            <div className="relative w-full h-full pointer-events-none select-none">
                <div className="absolute group-hover:opacity-100 opacity-0 transition-opacity duration-300 top-0 left-0 w-full h-full bg-linear-to-t from-background-900 via-background-900/35 to-background-900/0 z-2" />
                <img
                    className={twJoin(
                        'w-full h-full object-cover group-hover:scale-103 transition-translate duration-300',
                        !props.game.verified && 'saturate-10 brightness-90'
                    )}
                    src={props.game.cover}
                    alt={`${props.game.name}'s banner`}
                />
            </div>
            <div className="absolute -bottom-12 left-0 opacity-0 group-hover:bottom-0 group-hover:opacity-100 select-none z-4 p-2 transition-translate duration-300 pointer-events-none">
                <div className="flex items-center gap-2">
                    <div className="flex flex-col text-sm">
                        <p className="font-semibold">{props.game.name}</p>
                        <p className="-mt-1 font-semibold text-background-400">{props.game.developer}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

function Container(props: ContainerProps) {
    const [open, setOpen] = useState(true)

    return (
        <Collapsible open={open} onOpenChange={setOpen} className={cn('flex flex-col gap-1', props.className)}>
            <div className="flex gap-3 items-center py-2">
                <h4 className="font-medium text-lg">{props.title}</h4>
                <CollapsibleTrigger>
                    <Button variant="ghost" size="icon" className="size-8">
                        <ChevronDown
                            className={twJoin('transition-all ease-in-out duration-200', open && 'rotate-180')}
                        />
                        <span className="sr-only">Toggle</span>
                    </Button>
                </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="flex gap-3">{props.children}</CollapsibleContent>
        </Collapsible>
    )
}

export default function HomePage() {
    const navigate = useNavigate()
    const [setupModalOpen, setSetupModalOpen] = useState(false)
    const [games, setGames] = useState<GameInformationWithVerified[]>([])
    const [context, setContext] = useState<GameInformation | null>(null)
    const setupInputRef = useRef<HTMLInputElement>(null)

    const onClickGame = (game: GameInformation) => {
        setContext(game)
        verifyGame(game.id).then((result) => {
            if (result.success) {
                navigate(`/game/${game.id}`)
                return
            }

            const reason: string = result.reason
            switch (reason) {
                case 'GAME_NOT_INITIALIZED': {
                    setSetupModalOpen(true)
                    if (setupInputRef.current) {
                        setupInputRef.current.value = result.path as string
                    }
                    break
                }
            }
        })
    }

    useEffect(() => {
        listGames().then((result) => {
            setGames(result)
        })
    }, [])

    const installedGames = games.filter((v) => v.verified)

    return (
        <main className="relative w-full h-full">
            <SetupGameModal
                open={setupModalOpen}
                onChangeOpen={setSetupModalOpen}
                game={context}
                inputRef={setupInputRef}
                onClickCancel={() => setSetupModalOpen(false)}
                onSetupSuccess={() => {
                    setSetupModalOpen(false)
                    onClickGame(context)
                }}
            />
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col gap-12 w-full h-full"
            >
                <Container title="Installed">
                    {installedGames.map((game) => (
                        <GameCard game={game} onClick={() => onClickGame(game)} />
                    ))}
                    {installedGames.length === 0 && (
                        <div className="w-full flex flex-col items-center justify-center gap-2 px-4 py-8 bg-background-800/50 rounded-2xl">
                            <p className="font-semibold text-xl">No games installed</p>
                            <p className="font-medium text-base text-background-400">
                                You can install games by clicking them on the game card.
                            </p>
                        </div>
                    )}
                </Container>
                <Container title="All Games" className="pb-4">
                    {games.map((game) => (
                        <GameCard game={game} onClick={() => onClickGame(game)} />
                    ))}
                </Container>
            </motion.div>
        </main>
    )
}

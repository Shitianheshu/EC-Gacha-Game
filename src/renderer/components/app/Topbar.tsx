import { Maximize, Minus, Settings, X } from 'lucide-react'
import { closeWindow, maximizeWindow, minimizeWindow } from '../../api/window'
import { ReactNode } from 'react'
import useTopbar from '@renderer/hooks/useTopbar'
import { Link, useNavigate } from 'react-router'
import { Button } from '@renderer/components/ui/button'

function WindowButton(props: { onClick: () => void; icon: ReactNode }) {
    return (
        <button
            className="flex items-center justify-center p-1 w-8 rounded-full transition-colors duration-100 hover:bg-background-600/40 ml-auto cursor-pointer app-region-nodrag"
            onClick={() => props.onClick()}
        >
            <div className="aspect-square text-text-100/70">{props.icon}</div>
        </button>
    )
}

const WINDOW_BUTTONS = [
    {
        onClick: () => minimizeWindow(),
        icon: <Minus className="w-4 aspect-square" />
    },
    {
        onClick: () => maximizeWindow(),
        icon: <Maximize className="w-4 aspect-square" />
    },
    {
        onClick: () => closeWindow(),
        icon: <X className="w-4 aspect-square" />
    }
]

export default function Topbar() {
    const router = useNavigate()
    const enabled = useTopbar()

    const buttons = [
        {
            onClick: () => router('/settings'),
            icon: <Settings />
        }
    ]

    return (
        <div className="w-screen h-14 shrink-0 app-region-drag pointer-events-auto flex items-center justify-between bg-background-default/60">
            <div className="pl-4 flex gap-38 app-region-nodrag">
                <h1 className="text-primary-500 font-bold text-xl">Plugboo</h1>
                <div className="flex gap-8">
                    <Link className="cursor-pointer" to="/">
                        Library
                    </Link>
                </div>
            </div>
            <div className="flex gap-12 items-center h-full pr-4 app-region-nodrag">
                <div className="flex gap-4 h-full items-center">
                    {buttons.map((button) => (
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                                button.onClick()
                            }}
                        >
                            {button.icon}
                        </Button>
                    ))}
                </div>
                <div className="flex gap-1 items-center h-full app-region-nodrag z-100 ">
                    {enabled &&
                        WINDOW_BUTTONS.map((button) => <WindowButton onClick={button.onClick} icon={button.icon} />)}
                </div>
            </div>
        </div>
    )
}

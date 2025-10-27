import { ReactNode } from 'react'

type Props = {
    children: ReactNode
}

export default function Layout(props: Props) {
    return (
        <div className="text-text-50 w-screen max-h-screen h-screen antialiased flex overflow-hidden flex-col bg-background-800/70">
            {props.children}
        </div>
    )
}

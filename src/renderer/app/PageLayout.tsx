import { ReactNode } from 'react'

type Props = {
    children: ReactNode
}

export default function PageLayout(props: Props) {
    return (
        <div className="w-full overflow-hidden grow p-4 pb-0">
            <div className="bg-background-default h-full w-full overflow-y-auto rounded-t-2xl p-4 pb-0">
                {props.children}
            </div>
        </div>
    )
}

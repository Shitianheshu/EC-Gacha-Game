import { ReactNode } from 'react'

export type TabProps = {
    title?: string
    children?: ReactNode | ReactNode[]
}

export default function Tab(props: TabProps) {
    return props.children
}

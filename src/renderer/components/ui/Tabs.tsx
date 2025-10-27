import { ReactNode, useEffect, useRef, useState } from 'react'
import { TabProps } from '@renderer/components/ui/Tab'

type Props = {
    children?: ReactNode | ReactNode[]
    classNames?: {
        wrapper?: string
        contentWrapper?: string
    }
}

export default function Tabs(props: Props) {
    const children = (Array.isArray(props.children) ? props.children : [props.children]).filter(
        (v) => (v as any).type.name === 'Tab'
    )
    const [activeIndex, setActiveIndex] = useState(0)
    const itemRefs = useRef([])

    const getCursorOffset = () => {
        let offset = 0

        for (let i = 0; i < activeIndex; i++) {
            offset += itemRefs.current[i].clientWidth
        }

        return offset
    }

    useEffect(() => {
        itemRefs.current = itemRefs.current.slice(0, children.length)
    }, [children])

    const classNames = props.classNames ?? {}
    const wrapperClassNames = classNames.wrapper ?? ''
    const contentWrapperClassNames = classNames.contentWrapper ?? ''

    return (
        <div className={`${wrapperClassNames} flex flex-col gap-4`}>
            <div className="relative flex bg-background-800 rounded-2xl overflow-hidden self-start">
                {activeIndex < children.length && children[activeIndex] && (
                    <div
                        className={`absolute h-full bg-primary-500/30 rounded-2xl pointer-events-none transition-all ${itemRefs.current[activeIndex] ? 'opacity-100' : 'opacity-0'}`}
                        style={{
                            marginLeft: getCursorOffset(),
                            width: itemRefs.current[activeIndex] ? itemRefs.current[activeIndex].clientWidth : 0
                        }}
                    />
                )}
                {children.map((v, index) => {
                    const props = (v as any).props as TabProps
                    return (
                        <div
                            className="cursor-pointer p-3"
                            key={props.title}
                            ref={(el) => {
                                itemRefs.current[index] = el
                            }}
                            onClick={() => setActiveIndex(index)}
                        >
                            <p className="select-none">{props.title}</p>
                        </div>
                    )
                })}
            </div>

            {activeIndex < children.length && children[activeIndex] && (
                <div className={contentWrapperClassNames}>{children[activeIndex]}</div>
            )}
        </div>
    )
}

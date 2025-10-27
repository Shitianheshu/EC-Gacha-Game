import { useState } from 'react'

interface SelectValue {
    value: string
    label: string
}

type Props = {
    prefix?: string
    classNames?: {
        wrapper?: string
        option?: string
    }
    defaultValue?: string
    placeholder?: string
    values: SelectValue[]
    onSelect?: (value: string) => void
}

export default function Select(props: Props) {
    const placeholder = props.placeholder ?? ''

    const [value, setValue] = useState<SelectValue | null>(
        props.defaultValue ? (props.values.find((val) => val.value === props.defaultValue) ?? null) : null
    )
    const [open, setOpen] = useState(false)

    const onClickOption = (value: SelectValue) => {
        setValue(value)
        if (props.onSelect) {
            props.onSelect(value.value)
        }
        setOpen(false)
    }

    return (
        <div className="relative flex flex-col items-center">
            <div
                className={`${props.classNames ? (props.classNames.wrapper ?? '') : ''} ${value === null ? 'text-background-400' : ''} w-full h-9.5 bg-background-700/50 z-20 px-3 py-1.5 rounded-lg cursor-pointer`}
                onClick={() => setOpen(!open)}
            >
                <p className="select-none">{`${props.prefix ?? ''}${value !== null ? value.label : placeholder}`}</p>
            </div>
            <div
                className={`absolute top-10 w-full z-10 flex flex-col bg-background-700 rounded-lg transition-all duration-100 ease-in-out drop-shadow-lg overflow-hidden ${open ? 'pointer-events-auto opacity-100 z-100' : 'pointer-events-none opacity-0 z-10'}`}
            >
                {props.values.map((val) => {
                    const customClassNames = props.classNames ? (props.classNames.option ?? '') : ''
                    const selected = val.value === (value ? value.value : '______ASDOJ')

                    return (
                        <div
                            className={`${customClassNames} ${selected ? 'bg-primary-500 text-primary-900' : 'text-background-400'} select-none bg-background-700 font-medium hover:brightness-90 cursor-pointer px-3 py-1.5`}
                            key={val.value}
                            onClick={() => onClickOption(val)}
                        >
                            {val.label}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'

import { cn } from '@renderer/lib/style'
import { cva } from 'class-variance-authority'

const switchVariants = cva('', {
    variants: {
        size: {
            sm: 'h-4',
            md: 'h-5 w-10',
            lg: 'h-6 w-12'
        }
    },
    defaultVariants: {
        size: 'sm'
    }
})

type SwitchProps = React.ComponentProps<typeof SwitchPrimitive.Root> & {
    size?: 'sm' | 'md' | 'lg'
}

function Switch({ size, className, ...props }: SwitchProps) {
    const variant = switchVariants({ size })
    return (
        <SwitchPrimitive.Root
            data-slot="switch"
            className={cn(
                'peer data-[state=checked]:bg-primary-600 data-[state=unchecked]:bg-primary-800 focus-visible:border-primary-300 focus-visible:ring-primary-900/50 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
                variant,
                className
            )}
            {...props}
        >
            <SwitchPrimitive.Thumb
                data-slot="switch-thumb"
                className="w-1/2 h-full data-[state=unchecked]:bg-background-500 data-[state=checked]:bg-background-200 pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
            />
        </SwitchPrimitive.Root>
    )
}

export { Switch }

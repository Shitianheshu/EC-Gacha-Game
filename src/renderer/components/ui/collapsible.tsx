import * as CollapsiblePrimitive from '@radix-ui/react-collapsible'
import { ComponentProps } from 'react'
import { cn } from '@renderer/lib/style'

function Collapsible({ className, ...props }: ComponentProps<typeof CollapsiblePrimitive.Root>) {
    return <CollapsiblePrimitive.Root className={cn('relative', className)} data-slot="collapsible" {...props} />
}

function CollapsibleTrigger({ ...props }: ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
    return <CollapsiblePrimitive.CollapsibleTrigger data-slot="collapsible-trigger" {...props} />
}

function CollapsibleContent({ className, ...props }: ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
    return (
        <CollapsiblePrimitive.CollapsibleContent
            className={cn(
                'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
                className
            )}
            data-slot="collapsible-content"
            {...props}
        />
    )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }

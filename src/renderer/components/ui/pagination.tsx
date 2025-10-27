import * as React from 'react'
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from 'lucide-react'

import { cn } from '@renderer/lib/style'
import { Button, buttonVariants } from '@renderer/components/ui/button'

function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
    return (
        <nav
            role="navigation"
            aria-label="pagination"
            data-slot="pagination"
            className={cn('mx-auto flex w-full justify-center', className)}
            {...props}
        />
    )
}

function PaginationContent({ className, ...props }: React.ComponentProps<'ul'>) {
    return (
        <ul data-slot="pagination-content" className={cn('flex flex-row items-center gap-1', className)} {...props} />
    )
}

function PaginationItem({ ...props }: React.ComponentProps<'li'>) {
    return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
    isActive?: boolean
    disabled?: boolean
} & Pick<React.ComponentProps<typeof Button>, 'size'> &
    React.ComponentProps<'div'>

function PaginationLink({ className, isActive, size = 'icon', ...props }: PaginationLinkProps) {
    return (
        <div
            aria-current={isActive ? 'page' : undefined}
            data-slot="pagination-link"
            data-active={isActive}
            aria-disabled={props.disabled}
            className={cn(
                buttonVariants({
                    variant: isActive ? 'outline' : 'ghost',
                    size
                }),
                'select-none aria-disabled:brightness-70 aria-disabled:cursor-not-allowed cursor-pointer',
                className
            )}
            {...props}
            onClick={props.disabled ? undefined : props.onClick}
        />
    )
}

function PaginationPrevious({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
    return (
        <PaginationLink
            aria-label="Go to previous page"
            size="default"
            className={cn('gap-1 px-2.5 sm:pl-2.5', className)}
            {...props}
        >
            <ChevronLeftIcon />
            <span className="hidden sm:block">Previous</span>
        </PaginationLink>
    )
}

function PaginationNext({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
    return (
        <PaginationLink
            aria-label="Go to next page"
            size="default"
            className={cn('gap-1 px-2.5 sm:pr-2.5', className)}
            {...props}
        >
            <span className="hidden sm:block">Next</span>
            <ChevronRightIcon />
        </PaginationLink>
    )
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
    return (
        <span
            aria-hidden
            data-slot="pagination-ellipsis"
            className={cn('flex size-9 items-center justify-center', className)}
            {...props}
        >
            <MoreHorizontalIcon className="size-4" />
            <span className="sr-only">More pages</span>
        </span>
    )
}

type PaginationOverflowProps = {
    currentPage: number
    maxPages: number
    onPageChange: (page: number) => void
}

function PaginationOverflow({ currentPage, maxPages, onPageChange }: PaginationOverflowProps) {
    if (currentPage > maxPages || currentPage < 1) {
        return null
    }

    const renderEllipsis = () => (
        <PaginationItem>
            <PaginationEllipsis />
        </PaginationItem>
    )

    const renderPageLink = (pageNumber: number) => (
        <PaginationItem>
            <PaginationLink onClick={() => onPageChange(pageNumber)} isActive={pageNumber === currentPage}>
                {pageNumber}
            </PaginationLink>
        </PaginationItem>
    )

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                        tabIndex={currentPage <= 1 ? -1 : undefined}
                    />
                </PaginationItem>
                {currentPage === 1 ? null : renderPageLink(1)}
                {currentPage === 1 || currentPage - 1 === 1 || currentPage - 2 === maxPages ? null : renderEllipsis()}
                {currentPage === 1 || currentPage - 1 === 1 ? null : renderPageLink(currentPage - 1)}
                <PaginationItem>
                    <PaginationLink onClick={() => onPageChange(currentPage)} isActive>
                        {currentPage}
                    </PaginationLink>
                </PaginationItem>
                {currentPage === maxPages || currentPage + 1 === maxPages ? null : renderPageLink(currentPage + 1)}
                {currentPage === maxPages || currentPage + 1 === maxPages || currentPage + 2 === maxPages
                    ? null
                    : renderEllipsis()}
                {currentPage === maxPages ? null : renderPageLink(maxPages)}
                <PaginationItem>
                    <PaginationNext
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage >= maxPages}
                        tabIndex={currentPage >= maxPages ? -1 : undefined}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    )
}

export {
    Pagination,
    PaginationContent,
    PaginationLink,
    PaginationItem,
    PaginationPrevious,
    PaginationNext,
    PaginationEllipsis,
    PaginationOverflow
}

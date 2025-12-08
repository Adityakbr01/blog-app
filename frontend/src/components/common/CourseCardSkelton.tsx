import React from 'react'
import { Skeleton } from '../ui/skeleton'

function CourseCardSkelton({ idx }: { idx: number }) {
    return (
        <div key={idx} className="flex flex-col gap-4">
            <Skeleton className="h-48 w-full rounded-t-md animate-pulse bg-[var(--custom-inputColor)]" />
            <Skeleton className="h-6 w-3/4 animate-pulse bg-[var(--custom-inputColor)]" />
            <Skeleton className="h-4 w-1/2 animate-pulse bg-[var(--custom-inputColor)]" />
            <Skeleton className="h-6 w-full animate-pulse bg-[var(--custom-inputColor)]" />
            <Skeleton className="h-8 w-full animate-pulse mt-4 bg-[var(--custom-inputColor)]" />
        </div>
    )
}

export default CourseCardSkelton
import { cn } from '@/lib/utils';

export interface SkeletonProps {
    className?: string;
}

// Placeholder block for loading states. Pulses subtly; static under
// prefers-reduced-motion.
export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            aria-hidden="true"
            className={cn(
                'animate-pulse rounded-md bg-surface-muted motion-reduce:animate-none',
                className,
            )}
        />
    );
}

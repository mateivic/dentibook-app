import { cn } from '@/lib/utils';

export interface SpinnerProps {
    className?: string;
    label?: string;
}

// Subtle circular loading indicator in the brand color. Size/spacing are
// controlled by the caller via `className` (defaults to a small 1rem ring), so
// it can be reused inline, in buttons, or as a page-level loader.
export function Spinner({ className, label = 'Loading' }: SpinnerProps) {
    return (
        <span
            role="status"
            aria-label={label}
            className={cn(
                'inline-block size-4 animate-spin rounded-full',
                'border-2 border-brand/25 border-t-brand',
                'motion-reduce:animate-none',
                className,
            )}
        />
    );
}

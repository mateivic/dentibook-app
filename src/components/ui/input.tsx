import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
    <input
        ref={ref}
        className={cn(
            'flex h-10 w-full rounded-md border border-border bg-surface px-3 text-sm',
            'placeholder:text-ink-muted',
            'focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className,
        )}
        {...props}
    />
));
Input.displayName = 'Input';

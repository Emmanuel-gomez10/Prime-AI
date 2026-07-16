import React from 'react';
import { cn } from '../../lib/utils';

export interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'flex h-12 w-full rounded-button px-4 py-2 text-sm text-textPrimary placeholder:text-textMuted',
          'glass focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all',
          error && 'border-red-500/50 focus:ring-red-500/50',
          className
        )}
        {...props}
      />
    );
  }
);
GlassInput.displayName = 'GlassInput';

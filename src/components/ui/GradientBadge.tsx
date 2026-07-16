import React from 'react';
import { cn } from '../../lib/utils';

interface GradientBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const GradientBadge = React.forwardRef<HTMLDivElement, GradientBadgeProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium',
          'bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 border border-divider',
          className
        )}
        {...props}
      >
        <span className="text-gradient font-semibold tracking-wide">
          {children}
        </span>
      </div>
    );
  }
);
GradientBadge.displayName = 'GradientBadge';

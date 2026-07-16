import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';
import { hoverLift } from '../../lib/animations';

interface PrimaryButtonProps extends HTMLMotionProps<'button'> {
  children: React.ReactNode;
  className?: string;
}

export const PrimaryButton = React.forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        {...hoverLift}
        className={cn(
          'inline-flex items-center justify-center px-6 py-3 rounded-button font-medium text-primary-text transition-all',
          'bg-primary shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)]',
          'border border-primary/50',
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
PrimaryButton.displayName = 'PrimaryButton';

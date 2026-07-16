import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';
import { hoverLift } from '../../lib/animations';

interface SecondaryButtonProps extends HTMLMotionProps<'button'> {
  children: React.ReactNode;
  className?: string;
}

export const SecondaryButton = React.forwardRef<HTMLButtonElement, SecondaryButtonProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        {...hoverLift}
        className={cn(
          'inline-flex items-center justify-center px-6 py-3 rounded-button font-medium text-textPrimary transition-all',
          'glass hover:bg-surface/70 hover:border-white/20',
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
SecondaryButton.displayName = 'SecondaryButton';

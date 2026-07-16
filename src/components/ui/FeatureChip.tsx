import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';

interface FeatureChipProps extends HTMLMotionProps<'div'> {
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const FeatureChip = React.forwardRef<HTMLDivElement, FeatureChipProps>(
  ({ icon, children, className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={{ scale: 1.05 }}
        className={cn(
          'inline-flex items-center gap-2 rounded-button px-4 py-2 text-sm text-textSecondary',
          'glass hover:bg-surface/60 transition-colors',
          className
        )}
        {...props}
      >
        {icon && <span className="text-primary">{icon}</span>}
        {children}
      </motion.div>
    );
  }
);
FeatureChip.displayName = 'FeatureChip';

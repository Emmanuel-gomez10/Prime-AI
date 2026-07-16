import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';
import { fadeUp } from '../../lib/animations';

interface AnimatedHeadingProps extends HTMLMotionProps<'h1'> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children: React.ReactNode;
  className?: string;
}

export const AnimatedHeading = React.forwardRef<HTMLHeadingElement, AnimatedHeadingProps>(
  ({ as: Component = 'h2', children, className, ...props }, ref) => {
    const MotionComponent = motion(Component as any);

    return (
      <MotionComponent
        ref={ref}
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className={cn(
          'font-bold text-textPrimary leading-tight',
          Component === 'h1' && 'text-5xl md:text-7xl',
          Component === 'h2' && 'text-4xl md:text-5xl',
          Component === 'h3' && 'text-2xl md:text-3xl',
          className
        )}
        {...props}
      >
        {children}
      </MotionComponent>
    );
  }
);
AnimatedHeading.displayName = 'AnimatedHeading';

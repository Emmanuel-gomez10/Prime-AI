import React from 'react';
import { cn } from '../../lib/utils';

interface SectionContainerProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const SectionContainer = React.forwardRef<HTMLElement, SectionContainerProps>(
  ({ children, className, id, ...props }, ref) => {
    return (
      <section
        id={id}
        ref={ref}
        className={cn('w-full py-16 lg:py-24 max-w-[1280px] px-6 lg:px-8 mx-auto', className)}
        {...props}
      >
        {children}
      </section>
    );
  }
);
SectionContainer.displayName = 'SectionContainer';

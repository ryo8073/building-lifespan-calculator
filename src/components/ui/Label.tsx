"use client";
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref) => (
    <label
      ref={ref}
      className={cn('block text-sm font-medium leading-6 text-foreground mb-1', className)}
      {...props}
    >
      {children}
      {required && <span className="sr-only">（必須）</span>}
    </label>
  )
);
Label.displayName = 'Label'; 
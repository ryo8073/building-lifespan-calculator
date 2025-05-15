import * as React from "react";

export interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Select({ value, onChange, children, className = "" }: SelectProps) {
  return (
    <div className={`relative ${className}`}>
      {children}
    </div>
  );
}

export interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ children, className = "", ...props }, ref) => (
    <button
      ref={ref}
      className={`flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm font-medium shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${className}`}
      {...props}
    >
      {children}
    </button>
  )
);
SelectTrigger.displayName = "SelectTrigger";

export interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

export function SelectContent({ children, className = "" }: SelectContentProps) {
  return (
    <div className={`absolute z-10 mt-1 w-full rounded-md bg-popover shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${className}`} role="listbox">
      {children}
    </div>
  );
}

export interface SelectItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  children: React.ReactNode;
}

export const SelectItem = React.forwardRef<HTMLButtonElement, SelectItemProps>(
  ({ value, children, className = "", ...props }, ref) => (
    <button
      ref={ref}
      role="option"
      aria-selected={props['aria-selected']}
      data-value={value}
      className={`w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground rounded-md ${className}`}
      {...props}
    >
      {children}
    </button>
  )
);
SelectItem.displayName = "SelectItem"; 
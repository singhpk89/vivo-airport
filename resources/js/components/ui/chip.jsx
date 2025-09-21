import React from 'react';
import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';

const chipVariants = cva(
  // Base styles
  "inline-flex items-center justify-center gap-1 rounded-lg border font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        filled: "bg-primary text-on-primary border-transparent hover:shadow-elevation-1",
        outlined: "border-outline text-on-surface hover:bg-surface-variant/50",
        elevated: "bg-surface text-on-surface border-transparent shadow-elevation-1 hover:shadow-elevation-2",
        suggestion: "bg-surface-variant text-on-surface-variant border-transparent hover:bg-surface-variant/80",
        filter: "border-outline text-on-surface hover:bg-surface-variant/50 data-[selected=true]:bg-secondary-container data-[selected=true]:text-on-secondary-container data-[selected=true]:border-secondary-container",
        input: "bg-input-field text-on-surface border-outline hover:bg-input-field/80",
      },
      size: {
        sm: "h-6 px-2 text-label-small",
        default: "h-8 px-3 text-label-medium",
        lg: "h-10 px-4 text-body-small",
      },
    },
    defaultVariants: {
      variant: "filled",
      size: "default",
    },
  }
);

const Chip = React.forwardRef(({
  className,
  variant,
  size,
  selected,
  onClose,
  children,
  ...props
}, ref) => {
  return (
    <div
      className={cn(chipVariants({ variant, size, className }))}
      ref={ref}
      data-selected={selected}
      {...props}
    >
      {children}
      {onClose && (
        <button
          onClick={onClose}
          className="ml-1 h-4 w-4 rounded-full hover:bg-black/10 flex items-center justify-center transition-colors"
          type="button"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3"
          >
            <path
              d="M9 3L3 9M3 3L9 9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
});

Chip.displayName = "Chip";

export { Chip, chipVariants };

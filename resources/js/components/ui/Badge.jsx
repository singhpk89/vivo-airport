import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center font-medium transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        // Material 3 Badge variants
        filled: "bg-primary text-on-primary",
        outlined: "border border-outline bg-transparent text-primary",
        tonal: "bg-secondary-container text-on-secondary-container",

        // Status badges
        success: "bg-success text-on-success",
        warning: "bg-warning text-on-warning",
        error: "bg-error text-on-error",

        // Legacy variants for compatibility
        default: "bg-primary text-on-primary",
        secondary: "bg-secondary-container text-on-secondary-container",
        destructive: "bg-error text-on-error",
        outline: "border border-outline text-on-surface",
      },
      size: {
        sm: "px-2 py-0.5 text-label-small rounded-md h-5",
        default: "px-3 py-1 text-label-medium rounded-lg h-6",
        lg: "px-4 py-1.5 text-label-large rounded-lg h-8",
      },
      shape: {
        rounded: "",
        pill: "rounded-full",
      }
    },
    defaultVariants: {
      variant: "filled",
      size: "default",
      shape: "rounded",
    },
  }
)

const Badge = React.forwardRef(({ className, variant, size, shape, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(badgeVariants({ variant, size, shape, className }))}
      {...props}
    />
  )
})
Badge.displayName = "Badge"

// Material 3 Chip Component
const chipVariants = cva(
  "inline-flex items-center gap-2 font-medium transition-all duration-200 focus:outline-none cursor-pointer m3-state-layer",
  {
    variants: {
      variant: {
        // Material 3 Chip variants
        assist: "bg-transparent border border-outline text-on-surface rounded-lg hover:bg-on-surface/8",
        filter: "bg-transparent border border-outline text-on-surface rounded-lg hover:bg-on-surface/8 data-[selected]:bg-secondary-container data-[selected]:text-on-secondary-container data-[selected]:border-transparent",
        input: "bg-transparent border border-outline text-on-surface rounded-lg hover:bg-on-surface/8",
        suggestion: "bg-transparent border border-outline text-on-surface rounded-lg hover:bg-on-surface/8",
      },
      size: {
        default: "px-4 py-2 text-label-large h-8",
        sm: "px-3 py-1.5 text-label-medium h-6",
      }
    },
    defaultVariants: {
      variant: "assist",
      size: "default",
    },
  }
)

const Chip = React.forwardRef(({
  className,
  variant,
  size,
  selected,
  onRemove,
  children,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(chipVariants({ variant, size, className }))}
      data-selected={selected}
      {...props}
    >
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 p-0.5 rounded-full hover:bg-on-surface/12 focus:bg-on-surface/12 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
})
Chip.displayName = "Chip"

export { Badge, Chip, badgeVariants, chipVariants }

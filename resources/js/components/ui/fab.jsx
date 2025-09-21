import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

// Material 3 Floating Action Button variants
const fabVariants = cva(
  "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-38 relative overflow-hidden m3-state-layer",
  {
    variants: {
      variant: {
        // Material 3 FAB variants
        primary: "bg-primary-container text-on-primary-container shadow-elevation-3 hover:shadow-elevation-4 active:shadow-elevation-3",
        surface: "bg-surface text-primary shadow-elevation-3 hover:shadow-elevation-4 active:shadow-elevation-3",
        secondary: "bg-secondary-container text-on-secondary-container shadow-elevation-3 hover:shadow-elevation-4 active:shadow-elevation-3",
        tertiary: "bg-tertiary-container text-on-tertiary-container shadow-elevation-3 hover:shadow-elevation-4 active:shadow-elevation-3",
      },
      size: {
        small: "h-10 w-10 rounded-lg",
        default: "h-14 w-14 rounded-lg",
        large: "h-16 w-16 rounded-lg",
        extended: "h-14 px-4 rounded-lg min-w-20",
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

const FloatingActionButton = React.forwardRef(({
  className,
  variant,
  size,
  icon,
  label,
  extended = false,
  ...props
}, ref) => {
  const actualSize = extended ? "extended" : size

  return (
    <button
      ref={ref}
      className={cn(fabVariants({ variant, size: actualSize, className }))}
      {...props}
    >
      {icon && (
        <div className={cn(
          "flex items-center justify-center",
          extended && label && "mr-2"
        )}>
          {icon}
        </div>
      )}
      {extended && label && (
        <span className="text-label-large font-medium">
          {label}
        </span>
      )}
    </button>
  )
})
FloatingActionButton.displayName = "FloatingActionButton"

// Material 3 Extended FAB
const ExtendedFAB = React.forwardRef(({
  className,
  variant = "primary",
  icon,
  label,
  ...props
}, ref) => (
  <FloatingActionButton
    ref={ref}
    className={className}
    variant={variant}
    extended={true}
    icon={icon}
    label={label}
    {...props}
  />
))
ExtendedFAB.displayName = "ExtendedFAB"

// FAB with positioning utilities
const PositionedFAB = React.forwardRef(({
  className,
  position = "bottom-right",
  offset = "m-4",
  ...props
}, ref) => {
  const positionClasses = {
    "bottom-right": "fixed bottom-0 right-0",
    "bottom-left": "fixed bottom-0 left-0",
    "top-right": "fixed top-0 right-0",
    "top-left": "fixed top-0 left-0",
    "bottom-center": "fixed bottom-0 left-1/2 transform -translate-x-1/2",
    "top-center": "fixed top-0 left-1/2 transform -translate-x-1/2",
  }

  return (
    <FloatingActionButton
      ref={ref}
      className={cn(positionClasses[position], offset, className)}
      {...props}
    />
  )
})
PositionedFAB.displayName = "PositionedFAB"

export {
  FloatingActionButton,
  ExtendedFAB,
  PositionedFAB,
  fabVariants
}

import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const inputVariants = cva(
  "flex w-full bg-transparent transition-all duration-200 file:border-0 file:bg-transparent file:text-label-medium file:font-medium placeholder:text-on-surface-variant/60 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-38",
  {
    variants: {
      variant: {
        // Material 3 Outlined Text Field
        outlined: "h-12 rounded-md border border-outline px-4 py-3 text-body-large hover:border-on-surface focus:border-primary focus:border-2 focus:px-3.5 focus:py-2.5",

        // Material 3 Filled Text Field
        filled: "h-12 rounded-t-md bg-surface-variant border-b-2 border-outline px-4 pt-4 pb-2 text-body-large hover:bg-surface-variant/80 focus:border-primary focus:bg-surface-variant",

        // Legacy variant for compatibility
        default: "h-10 rounded-md border border-outline bg-surface px-3 py-2 text-body-medium hover:border-on-surface focus:border-primary focus:border-2",
      }
    },
    defaultVariants: {
      variant: "outlined",
    },
  }
)

const Input = React.forwardRef(({ className, variant, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(inputVariants({ variant, className }))}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

// Material 3 Text Field with Label
const TextField = React.forwardRef(({
  className,
  variant = "outlined",
  label,
  supportingText,
  error,
  required,
  children,
  startIcon,
  endIcon,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = React.useState(false)
  const [hasValue, setHasValue] = React.useState(false)

  const handleFocus = (e) => {
    setIsFocused(true)
    props.onFocus?.(e)
  }

  const handleBlur = (e) => {
    setIsFocused(false)
    setHasValue(e.target.value !== '')
    props.onBlur?.(e)
  }

  const labelClasses = cn(
    "absolute left-4 text-on-surface-variant transition-all duration-200 pointer-events-none",
    {
      // Outlined variant label positioning
      "top-3 text-body-large": variant === "outlined" && !isFocused && !hasValue,
      "-top-2 left-3 bg-surface px-1 text-label-small text-primary": variant === "outlined" && (isFocused || hasValue),

      // Filled variant label positioning
      "top-2 text-label-small": variant === "filled" && (isFocused || hasValue),
      "top-4 text-body-large": variant === "filled" && !isFocused && !hasValue,

      // Error state
      "text-error": error,
    }
  )

  return (
    <div className={cn("relative w-full", className)}>
      {variant === "outlined" && (
        <div className="relative">
          {startIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
              {startIcon}
            </div>
          )}
          <Input
            ref={ref}
            variant={variant}
            className={cn(
              error && "border-error focus:border-error",
              startIcon && "pl-10",
              endIcon && "pr-10"
            )}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
          {endIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
              {endIcon}
            </div>
          )}
          {label && (
            <label className={labelClasses}>
              {label}
              {required && <span className="text-error ml-1">*</span>}
            </label>
          )}
        </div>
      )}

      {variant === "filled" && (
        <div className="relative">
          {startIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
              {startIcon}
            </div>
          )}
          <Input
            ref={ref}
            variant={variant}
            className={cn(
              error && "border-error focus:border-error",
              startIcon && "pl-10",
              endIcon && "pr-10"
            )}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
          {endIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
              {endIcon}
            </div>
          )}
          {label && (
            <label className={labelClasses}>
              {label}
              {required && <span className="text-error ml-1">*</span>}
            </label>
          )}
        </div>
      )}

      {(supportingText || error) && (
        <div className={cn(
          "text-label-small mt-1 px-4",
          error ? "text-error" : "text-on-surface-variant"
        )}>
          {error || supportingText}
        </div>
      )}
    </div>
  )
})
TextField.displayName = "TextField"

export { Input, TextField, inputVariants }

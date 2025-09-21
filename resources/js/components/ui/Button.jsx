import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden",
  {
    variants: {
      variant: {
        // Primary Actions - Blue gradient family
        filled: "bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-800 active:shadow-sm transform hover:scale-[1.01] transition-all duration-200",

        // Secondary Actions - Light blue gradient
        "filled-tonal": "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-lg shadow-sm hover:shadow-md hover:from-blue-100 hover:to-blue-200 active:shadow-sm border border-blue-200 hover:border-blue-300 transform hover:scale-[1.01] transition-all duration-200",

        // Outlined Actions - Consistent border and hover
        outlined: "border-2 border-blue-600 bg-white text-blue-600 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:border-blue-700 active:bg-blue-100 shadow-sm hover:shadow-md transform hover:scale-[1.01] transition-all duration-200",

        // Text Actions - Minimal style
        text: "bg-transparent text-blue-600 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 active:bg-blue-100 hover:shadow-sm transform hover:scale-[1.01] transition-all duration-200",

        // Elevated Actions - White with shadow
        elevated: "bg-white text-blue-600 rounded-lg shadow-md hover:shadow-lg border border-gray-200 hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transform hover:scale-[1.01] transition-all duration-200",

        // Success Actions - Green gradient family
        success: "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg shadow-md hover:shadow-lg hover:from-emerald-700 hover:to-emerald-800 active:shadow-sm transform hover:scale-[1.01] transition-all duration-200",

        // Warning Actions - Orange gradient family
        warning: "bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg shadow-md hover:shadow-lg hover:from-orange-700 hover:to-orange-800 active:shadow-sm transform hover:scale-[1.01] transition-all duration-200",

        // Error Actions - Red gradient family
        error: "bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg shadow-md hover:shadow-lg hover:from-red-700 hover:to-red-800 active:shadow-sm transform hover:scale-[1.01] transition-all duration-200",

        // Ghost Actions - Transparent with subtle hover
        ghost: "bg-transparent text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200 transform hover:scale-[1.01] transition-all duration-200",

        // FAB variants - Larger shadows and rounded corners
        fab: "bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 active:shadow-md transform hover:scale-[1.02] transition-all duration-200",
        "fab-primary": "bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-2xl shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-purple-800 active:shadow-md transform hover:scale-[1.02] transition-all duration-200",

        // Legacy variants for compatibility - Consistent with new design
        default: "bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transform hover:scale-[1.01] transition-all duration-200",
        destructive: "bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg shadow-md hover:shadow-lg hover:from-red-700 hover:to-red-800 transform hover:scale-[1.01] transition-all duration-200",
        outline: "border-2 border-blue-600 bg-white text-blue-600 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:border-blue-700 shadow-sm hover:shadow-md transform hover:scale-[1.01] transition-all duration-200",
        secondary: "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-lg shadow-sm hover:shadow-md hover:from-gray-200 hover:to-gray-300 border border-gray-300 hover:border-gray-400 transform hover:scale-[1.01] transition-all duration-200",
        link: "text-blue-600 underline-offset-4 hover:underline rounded-lg hover:text-blue-700 hover:bg-blue-50 px-2 py-1 transition-all duration-200",
      },
      size: {
        // Standard button sizes - Consistent height and padding ratios
        xs: "h-8 px-3 text-sm min-w-16 gap-1.5",
        sm: "h-9 px-4 text-sm min-w-20 gap-2",
        default: "h-10 px-6 text-sm min-w-24 gap-2",
        lg: "h-11 px-8 text-base min-w-28 gap-2.5",
        xl: "h-12 px-10 text-base min-w-32 gap-3",

        // Icon button sizes - Perfect squares
        icon: "h-10 w-10 rounded-lg p-0",
        "icon-xs": "h-8 w-8 rounded-lg p-0",
        "icon-sm": "h-9 w-9 rounded-lg p-0",
        "icon-lg": "h-11 w-11 rounded-lg p-0",
        "icon-xl": "h-12 w-12 rounded-lg p-0",

        // FAB sizes - Consistent circular design
        fab: "h-14 w-14 rounded-2xl p-0",
        "fab-sm": "h-12 w-12 rounded-xl p-0",
        "fab-lg": "h-16 w-16 rounded-2xl p-0",

        // Full width variants
        full: "h-10 w-full px-6 text-sm gap-2",
        "full-lg": "h-11 w-full px-8 text-base gap-2.5",
      },
    },
    defaultVariants: {
      variant: "filled",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, children, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    >
      {children}
    </Comp>
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }

import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

// Material 3 Navigation Rail
const navigationRailVariants = cva(
  "flex flex-col w-20 h-screen bg-surface border-r border-outline-variant py-4",
  {
    variants: {
      variant: {
        default: "bg-surface",
        filled: "bg-surface-variant",
      }
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const NavigationRail = React.forwardRef(({ className, variant, children, ...props }, ref) => (
  <nav
    ref={ref}
    className={cn(navigationRailVariants({ variant, className }))}
    {...props}
  >
    {children}
  </nav>
))
NavigationRail.displayName = "NavigationRail"

// Material 3 Navigation Rail Item
const navigationRailItemVariants = cva(
  "flex flex-col items-center justify-center w-14 h-16 mx-auto rounded-lg transition-all duration-200 m3-state-layer cursor-pointer",
  {
    variants: {
      active: {
        true: "bg-secondary-container text-on-secondary-container",
        false: "text-on-surface-variant hover:bg-surface-variant/50",
      }
    },
    defaultVariants: {
      active: false,
    },
  }
)

const NavigationRailItem = React.forwardRef(({
  className,
  active,
  icon,
  label,
  badge,
  onClick,
  ...props
}, ref) => (
  <button
    ref={ref}
    className={cn(navigationRailItemVariants({ active, className }))}
    onClick={onClick}
    {...props}
  >
    <div className="relative">
      {icon}
      {badge && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-error text-on-error rounded-full text-xs flex items-center justify-center">
          {badge}
        </div>
      )}
    </div>
    {label && (
      <span className="text-label-small mt-1 text-center leading-tight max-w-12 truncate">
        {label}
      </span>
    )}
  </button>
))
NavigationRailItem.displayName = "NavigationRailItem"

// Material 3 Navigation Drawer
const navigationDrawerVariants = cva(
  "flex flex-col w-80 h-screen bg-surface border-r border-outline-variant transition-transform duration-300",
  {
    variants: {
      open: {
        true: "translate-x-0",
        false: "-translate-x-full",
      },
      variant: {
        standard: "relative",
        modal: "fixed left-0 top-0 z-50 shadow-elevation-3",
      }
    },
    defaultVariants: {
      open: true,
      variant: "standard",
    },
  }
)

const NavigationDrawer = React.forwardRef(({
  className,
  open,
  variant,
  header,
  children,
  ...props
}, ref) => (
  <>
    {variant === "modal" && open && (
      <div className="fixed inset-0 bg-black/50 z-40" />
    )}
    <nav
      ref={ref}
      className={cn(navigationDrawerVariants({ open, variant, className }))}
      {...props}
    >
      {header && (
        <div className="p-6 border-b border-outline-variant">
          {header}
        </div>
      )}
      <div className="flex-1 overflow-y-auto py-2">
        {children}
      </div>
    </nav>
  </>
))
NavigationDrawer.displayName = "NavigationDrawer"

// Material 3 Navigation Drawer Item
const navigationDrawerItemVariants = cva(
  "flex items-center w-full px-6 py-3 text-left transition-all duration-200 m3-state-layer",
  {
    variants: {
      active: {
        true: "bg-secondary-container text-on-secondary-container font-medium",
        false: "text-on-surface hover:bg-surface-variant/50",
      }
    },
    defaultVariants: {
      active: false,
    },
  }
)

const NavigationDrawerItem = React.forwardRef(({
  className,
  active,
  icon,
  label,
  badge,
  onClick,
  ...props
}, ref) => (
  <button
    ref={ref}
    className={cn(navigationDrawerItemVariants({ active, className }))}
    onClick={onClick}
    {...props}
  >
    {icon && (
      <div className="flex items-center justify-center w-6 h-6 mr-3 relative">
        {icon}
        {badge && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-error text-on-error rounded-full text-xs flex items-center justify-center">
            {badge}
          </div>
        )}
      </div>
    )}
    <span className="text-label-large">{label}</span>
  </button>
))
NavigationDrawerItem.displayName = "NavigationDrawerItem"

// Material 3 Top App Bar
const topAppBarVariants = cva(
  "flex items-center justify-between w-full px-4 py-2 bg-surface border-b border-outline-variant",
  {
    variants: {
      variant: {
        small: "h-16",
        medium: "h-20",
        large: "h-24",
      },
      elevated: {
        true: "shadow-elevation-2",
        false: "",
      }
    },
    defaultVariants: {
      variant: "small",
      elevated: false,
    },
  }
)

const TopAppBar = React.forwardRef(({
  className,
  variant,
  elevated,
  title,
  subtitle,
  navigation,
  actions,
  ...props
}, ref) => (
  <header
    ref={ref}
    className={cn(topAppBarVariants({ variant, elevated, className }))}
    {...props}
  >
    <div className="flex items-center gap-4">
      {navigation}
      {(title || subtitle) && (
        <div className="flex flex-col">
          {title && (
            <h1 className={cn(
              "font-medium text-on-surface",
              variant === "small" && "text-title-large",
              variant === "medium" && "text-headline-small",
              variant === "large" && "text-headline-medium"
            )}>
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-body-medium text-on-surface-variant">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>

    {actions && (
      <div className="flex items-center gap-2">
        {actions}
      </div>
    )}
  </header>
))
TopAppBar.displayName = "TopAppBar"

// Material 3 Bottom Navigation
const bottomNavigationVariants = cva(
  "flex items-center justify-around w-full h-20 bg-surface border-t border-outline-variant"
)

const BottomNavigation = React.forwardRef(({ className, children, ...props }, ref) => (
  <nav
    ref={ref}
    className={cn(bottomNavigationVariants({ className }))}
    {...props}
  >
    {children}
  </nav>
))
BottomNavigation.displayName = "BottomNavigation"

// Material 3 Bottom Navigation Item
const bottomNavigationItemVariants = cva(
  "flex flex-col items-center justify-center min-w-16 h-16 px-2 py-1 rounded-lg transition-all duration-200 m3-state-layer cursor-pointer",
  {
    variants: {
      active: {
        true: "text-on-surface",
        false: "text-on-surface-variant",
      }
    },
    defaultVariants: {
      active: false,
    },
  }
)

const BottomNavigationItem = React.forwardRef(({
  className,
  active,
  icon,
  label,
  badge,
  onClick,
  ...props
}, ref) => (
  <button
    ref={ref}
    className={cn(bottomNavigationItemVariants({ active, className }))}
    onClick={onClick}
    {...props}
  >
    <div className="relative mb-1">
      {icon}
      {badge && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-error text-on-error rounded-full text-xs flex items-center justify-center">
          {badge}
        </div>
      )}
    </div>
    <span className="text-label-small text-center leading-tight">
      {label}
    </span>
  </button>
))
BottomNavigationItem.displayName = "BottomNavigationItem"

export {
  NavigationRail,
  NavigationRailItem,
  NavigationDrawer,
  NavigationDrawerItem,
  TopAppBar,
  BottomNavigation,
  BottomNavigationItem,
}

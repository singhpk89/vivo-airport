/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./resources/**/*.blade.php",
    "./resources/**/*.js",
    "./resources/**/*.jsx",
    "./resources/**/*.ts",
    "./resources/**/*.tsx",
    "./resources/**/*.vue",
  ],
  theme: {
    extend: {
      colors: {
        // Material 3 Color System
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        "on-background": "hsl(var(--on-background))",
        surface: "hsl(var(--surface))",
        "on-surface": "hsl(var(--on-surface))",
        "surface-variant": "hsl(var(--surface-variant))",
        "on-surface-variant": "hsl(var(--on-surface-variant))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--on-primary))",
          container: "hsl(var(--primary-container))",
          "container-foreground": "hsl(var(--on-primary-container))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--on-secondary))",
          container: "hsl(var(--secondary-container))",
          "container-foreground": "hsl(var(--on-secondary-container))",
        },
        tertiary: {
          DEFAULT: "hsl(var(--tertiary))",
          foreground: "hsl(var(--on-tertiary))",
          container: "hsl(var(--tertiary-container))",
          "container-foreground": "hsl(var(--on-tertiary-container))",
        },
        error: {
          DEFAULT: "hsl(var(--error))",
          foreground: "hsl(var(--on-error))",
          container: "hsl(var(--error-container))",
          "container-foreground": "hsl(var(--on-error-container))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--on-warning))",
          container: "hsl(var(--warning-container))",
          "container-foreground": "hsl(var(--on-warning-container))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--on-success))",
          container: "hsl(var(--success-container))",
          "container-foreground": "hsl(var(--on-success-container))",
        },
        outline: "hsl(var(--outline))",
        "outline-variant": "hsl(var(--outline-variant))",
        "inverse-surface": "hsl(var(--inverse-surface))",
        "inverse-on-surface": "hsl(var(--inverse-on-surface))",
        "inverse-primary": "hsl(var(--inverse-primary))",

        // Legacy support for existing components
        border: "hsl(var(--outline-variant))",
        input: "hsl(var(--outline))",
        ring: "hsl(var(--primary))",
        destructive: {
          DEFAULT: "hsl(var(--error))",
          foreground: "hsl(var(--on-error))",
        },
        muted: {
          DEFAULT: "hsl(var(--surface-variant))",
          foreground: "hsl(var(--on-surface-variant))",
        },
        accent: {
          DEFAULT: "hsl(var(--tertiary-container))",
          foreground: "hsl(var(--on-tertiary-container))",
        },
        popover: {
          DEFAULT: "hsl(var(--surface))",
          foreground: "hsl(var(--on-surface))",
        },
        card: {
          DEFAULT: "hsl(var(--surface))",
          foreground: "hsl(var(--on-surface))",
        },
      },
      borderRadius: {
        none: "0px",
        xs: "4px",    // Material 3 Extra Small
        sm: "8px",    // Material 3 Small
        md: "12px",   // Material 3 Medium
        lg: "16px",   // Material 3 Large
        xl: "20px",   // Material 3 Extra Large
        "2xl": "28px", // Material 3 Extra Extra Large
        full: "9999px",
      },
      fontFamily: {
        sans: [
          "Vivo",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif"
        ],
        mono: [
          "JetBrains Mono",
          "Menlo",
          "Monaco",
          "monospace"
        ],
      },
      fontSize: {
        // Material 3 Typography Scale
        "display-large": ["57px", { lineHeight: "64px", fontWeight: "400" }],
        "display-medium": ["45px", { lineHeight: "52px", fontWeight: "400" }],
        "display-small": ["36px", { lineHeight: "44px", fontWeight: "400" }],
        "headline-large": ["32px", { lineHeight: "40px", fontWeight: "400" }],
        "headline-medium": ["28px", { lineHeight: "36px", fontWeight: "400" }],
        "headline-small": ["24px", { lineHeight: "32px", fontWeight: "400" }],
        "title-large": ["22px", { lineHeight: "28px", fontWeight: "500" }],
        "title-medium": ["16px", { lineHeight: "24px", fontWeight: "500" }],
        "title-small": ["14px", { lineHeight: "20px", fontWeight: "500" }],
        "label-large": ["14px", { lineHeight: "20px", fontWeight: "500" }],
        "label-medium": ["12px", { lineHeight: "16px", fontWeight: "500" }],
        "label-small": ["11px", { lineHeight: "16px", fontWeight: "500" }],
        "body-large": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-medium": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "body-small": ["12px", { lineHeight: "16px", fontWeight: "400" }],
      },
      spacing: {
        // Material 3 spacing increments (4dp base)
        0.5: "2px",   // 0.5 * 4dp
        1: "4px",     // 1 * 4dp
        1.5: "6px",   // 1.5 * 4dp
        2: "8px",     // 2 * 4dp
        2.5: "10px",  // 2.5 * 4dp
        3: "12px",    // 3 * 4dp
        3.5: "14px",  // 3.5 * 4dp
        4: "16px",    // 4 * 4dp
        5: "20px",    // 5 * 4dp
        6: "24px",    // 6 * 4dp
        7: "28px",    // 7 * 4dp
        8: "32px",    // 8 * 4dp
        9: "36px",    // 9 * 4dp
        10: "40px",   // 10 * 4dp
        11: "44px",   // 11 * 4dp
        12: "48px",   // 12 * 4dp
        14: "56px",   // 14 * 4dp
        16: "64px",   // 16 * 4dp
        20: "80px",   // 20 * 4dp
        24: "96px",   // 24 * 4dp
        28: "112px",  // 28 * 4dp
        32: "128px",  // 32 * 4dp
      },
      boxShadow: {
        // Material 3 Elevation
        "elevation-1": "0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)",
        "elevation-2": "0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)",
        "elevation-3": "0px 4px 8px 3px rgba(0, 0, 0, 0.15), 0px 1px 3px 0px rgba(0, 0, 0, 0.3)",
        "elevation-4": "0px 6px 10px 4px rgba(0, 0, 0, 0.15), 0px 2px 3px 0px rgba(0, 0, 0, 0.3)",
        "elevation-5": "0px 8px 12px 6px rgba(0, 0, 0, 0.15), 0px 4px 4px 0px rgba(0, 0, 0, 0.3)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // Material 3 Animations
        "state-layer": {
          "0%": { opacity: "0", transform: "scale(0)" },
          "100%": { opacity: "0.12", transform: "scale(1)" },
        },
        "fab-scale": {
          "0%": { transform: "scale(0)" },
          "50%": { transform: "scale(1.2)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "state-layer": "state-layer 0.15s ease-out",
        "fab-scale": "fab-scale 0.2s ease-out",
      },
    },
  },
  plugins: [],
}

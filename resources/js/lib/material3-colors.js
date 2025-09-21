import {
  argbFromHex,
  themeFromSourceColor,
  applyTheme,
} from "@material/material-color-utilities";

/**
 * Generate Material 3 theme from a source color
 * @param {string} sourceColor - Hex color string (e.g., "#6750A4")
 * @param {boolean} isDark - Whether to generate dark theme
 * @returns {Object} Theme object with CSS custom properties
 */
export function generateMaterial3Theme(sourceColor, isDark = false) {
  // Get the source color in ARGB format
  const argb = argbFromHex(sourceColor);

  // Generate the theme
  const theme = themeFromSourceColor(argb);

  // Get the appropriate scheme
  const scheme = isDark ? theme.schemes.dark : theme.schemes.light;

  // Convert to CSS custom properties
  const cssProperties = {
    // Primary Colors
    '--primary': `${scheme.primary >> 16 & 255} ${scheme.primary >> 8 & 255} ${scheme.primary & 255}`,
    '--on-primary': `${scheme.onPrimary >> 16 & 255} ${scheme.onPrimary >> 8 & 255} ${scheme.onPrimary & 255}`,
    '--primary-container': `${scheme.primaryContainer >> 16 & 255} ${scheme.primaryContainer >> 8 & 255} ${scheme.primaryContainer & 255}`,
    '--on-primary-container': `${scheme.onPrimaryContainer >> 16 & 255} ${scheme.onPrimaryContainer >> 8 & 255} ${scheme.onPrimaryContainer & 255}`,

    // Secondary Colors
    '--secondary': `${scheme.secondary >> 16 & 255} ${scheme.secondary >> 8 & 255} ${scheme.secondary & 255}`,
    '--on-secondary': `${scheme.onSecondary >> 16 & 255} ${scheme.onSecondary >> 8 & 255} ${scheme.onSecondary & 255}`,
    '--secondary-container': `${scheme.secondaryContainer >> 16 & 255} ${scheme.secondaryContainer >> 8 & 255} ${scheme.secondaryContainer & 255}`,
    '--on-secondary-container': `${scheme.onSecondaryContainer >> 16 & 255} ${scheme.onSecondaryContainer >> 8 & 255} ${scheme.onSecondaryContainer & 255}`,

    // Tertiary Colors
    '--tertiary': `${scheme.tertiary >> 16 & 255} ${scheme.tertiary >> 8 & 255} ${scheme.tertiary & 255}`,
    '--on-tertiary': `${scheme.onTertiary >> 16 & 255} ${scheme.onTertiary >> 8 & 255} ${scheme.onTertiary & 255}`,
    '--tertiary-container': `${scheme.tertiaryContainer >> 16 & 255} ${scheme.tertiaryContainer >> 8 & 255} ${scheme.tertiaryContainer & 255}`,
    '--on-tertiary-container': `${scheme.onTertiaryContainer >> 16 & 255} ${scheme.onTertiaryContainer >> 8 & 255} ${scheme.onTertiaryContainer & 255}`,

    // Error Colors
    '--error': `${scheme.error >> 16 & 255} ${scheme.error >> 8 & 255} ${scheme.error & 255}`,
    '--on-error': `${scheme.onError >> 16 & 255} ${scheme.onError >> 8 & 255} ${scheme.onError & 255}`,
    '--error-container': `${scheme.errorContainer >> 16 & 255} ${scheme.errorContainer >> 8 & 255} ${scheme.errorContainer & 255}`,
    '--on-error-container': `${scheme.onErrorContainer >> 16 & 255} ${scheme.onErrorContainer >> 8 & 255} ${scheme.onErrorContainer & 255}`,

    // Surface Colors
    '--background': `${scheme.background >> 16 & 255} ${scheme.background >> 8 & 255} ${scheme.background & 255}`,
    '--on-background': `${scheme.onBackground >> 16 & 255} ${scheme.onBackground >> 8 & 255} ${scheme.onBackground & 255}`,
    '--surface': `${scheme.surface >> 16 & 255} ${scheme.surface >> 8 & 255} ${scheme.surface & 255}`,
    '--on-surface': `${scheme.onSurface >> 16 & 255} ${scheme.onSurface >> 8 & 255} ${scheme.onSurface & 255}`,
    '--surface-variant': `${scheme.surfaceVariant >> 16 & 255} ${scheme.surfaceVariant >> 8 & 255} ${scheme.surfaceVariant & 255}`,
    '--on-surface-variant': `${scheme.onSurfaceVariant >> 16 & 255} ${scheme.onSurfaceVariant >> 8 & 255} ${scheme.onSurfaceVariant & 255}`,

    // Outline Colors
    '--outline': `${scheme.outline >> 16 & 255} ${scheme.outline >> 8 & 255} ${scheme.outline & 255}`,
    '--outline-variant': `${scheme.outlineVariant >> 16 & 255} ${scheme.outlineVariant >> 8 & 255} ${scheme.outlineVariant & 255}`,

    // Inverse Colors
    '--inverse-surface': `${scheme.inverseSurface >> 16 & 255} ${scheme.inverseSurface >> 8 & 255} ${scheme.inverseSurface & 255}`,
    '--inverse-on-surface': `${scheme.inverseOnSurface >> 16 & 255} ${scheme.inverseOnSurface >> 8 & 255} ${scheme.inverseOnSurface & 255}`,
    '--inverse-primary': `${scheme.inversePrimary >> 16 & 255} ${scheme.inversePrimary >> 8 & 255} ${scheme.inversePrimary & 255}`,
  };

  return cssProperties;
}

/**
 * Apply Material 3 theme to the document
 * @param {string} sourceColor - Hex color string
 * @param {boolean} isDark - Whether to apply dark theme
 */
export function applyMaterial3Theme(sourceColor, isDark = false) {
  const theme = generateMaterial3Theme(sourceColor, isDark);
  const root = document.documentElement;

  // Apply CSS custom properties
  Object.entries(theme).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });

  // Add legacy compatibility properties
  root.style.setProperty('--foreground', theme['--on-background']);
  root.style.setProperty('--border', theme['--outline-variant']);
  root.style.setProperty('--input', theme['--outline']);
  root.style.setProperty('--ring', theme['--primary']);
}

/**
 * Predefined Material 3 color palettes
 */
export const MATERIAL3_COLORS = {
  purple: "#6750A4",
  blue: "#0061A4",
  teal: "#006A6B",
  green: "#006E1C",
  yellow: "#8A6600",
  orange: "#C4500A",
  red: "#C5282F",
  pink: "#8E4A7A",
  // Additional colors
  indigo: "#4F46E5",
  cyan: "#0891B2",
  emerald: "#059669",
  lime: "#65A30D",
  amber: "#D97706",
  rose: "#E11D48",
};

/**
 * React hook for Material 3 dynamic theming
 */
export function useMaterial3Theme() {
  const [sourceColor, setSourceColor] = React.useState(MATERIAL3_COLORS.purple);
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  React.useEffect(() => {
    applyMaterial3Theme(sourceColor, isDarkMode);
  }, [sourceColor, isDarkMode]);

  return {
    sourceColor,
    setSourceColor,
    isDarkMode,
    setIsDarkMode,
    applyTheme: (color, dark = isDarkMode) => {
      setSourceColor(color);
      setIsDarkMode(dark);
    },
    colors: MATERIAL3_COLORS,
  };
}

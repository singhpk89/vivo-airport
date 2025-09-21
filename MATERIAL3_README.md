# Material 3 UI Theme Implementation

This project has been updated to use **Material 3 Design System** (also known as Material You). The implementation includes:

## 🎨 What's New

### **Complete Material 3 Color System**
- Dynamic color tokens for light and dark themes
- Primary, Secondary, Tertiary color palettes
- Surface variants and outline colors
- Error, Warning, Success color schemes

### **Material 3 Components**
- **Buttons**: Filled, Filled Tonal, Outlined, Text, FAB variants
- **Cards**: Elevated, Filled, Outlined variants
- **Text Fields**: Outlined and Filled variants with floating labels
- **Badges & Chips**: Multiple variants with interactive features
- **Navigation**: Rail, Drawer, Top App Bar, Bottom Navigation
- **Dialogs**: Updated with Material 3 styling

### **Typography Scale**
- Display (Large, Medium, Small)
- Headline (Large, Medium, Small)
- Title (Large, Medium, Small)
- Label (Large, Medium, Small)
- Body (Large, Medium, Small)

### **Elevation & Shadows**
- 5 levels of elevation with proper shadows
- State layers for interactive feedback
- Ripple effects for touch interactions

## 🚀 How to Use

### **Theme Provider**
The entire app is wrapped in a `ThemeProvider` that manages light/dark mode:

```jsx
import { ThemeProvider, useTheme } from './components/ui/theme-provider';

// In your app
<ThemeProvider defaultTheme="light" storageKey="your-app-theme">
  <YourApp />
</ThemeProvider>
```

### **Using Components**
```jsx
import { Button } from './components/ui/Button';
import { Card, CardHeader, CardTitle } from './components/ui/Card';
import { TextField } from './components/ui/Input';

// Material 3 Button variants
<Button variant="filled">Primary Action</Button>
<Button variant="filled-tonal">Secondary Action</Button>
<Button variant="outlined">Outlined Button</Button>

// Material 3 Cards
<Card variant="elevated">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
</Card>

// Material 3 Text Fields
<TextField 
  variant="outlined" 
  label="Enter text"
  supportingText="This is helper text"
/>
```

### **Dynamic Colors**
```jsx
import { applyMaterial3Theme, MATERIAL3_COLORS } from './lib/material3-colors';

// Apply a dynamic theme from any color
applyMaterial3Theme(MATERIAL3_COLORS.blue, false); // Light theme
applyMaterial3Theme(MATERIAL3_COLORS.green, true); // Dark theme
```

## 📱 Live Demo

Visit `/material3-showcase` to see all components in action with interactive examples.

## 🎯 Key Features

- **Accessible**: WCAG compliant color contrasts
- **Responsive**: Works on all screen sizes
- **Themeable**: Easy light/dark mode switching
- **Dynamic**: Generate themes from any color
- **Modern**: Latest Material 3 specifications
- **Compatible**: Backward compatible with existing code

## 🔧 Customization

All color tokens are defined as CSS custom properties and can be overridden:

```css
:root {
  --primary: 103 80 164; /* Custom primary color */
  --surface: 255 255 255; /* Custom surface color */
}
```

## 📚 Documentation

- [Material 3 Design Guidelines](https://m3.material.io/)
- [Component Documentation](./components/ui/)
- [Color System](./lib/material3-colors.js)

The theme system is fully integrated and ready to use throughout your application!

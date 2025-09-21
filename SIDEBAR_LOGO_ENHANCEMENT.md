# Sidebar Header Logo Area Enhancement

## Changes Made
Updated the sidebar header to give the rectangular logo more space while maintaining consistency with the AppLayout header.

### Key Improvements:
1. **Header Height**: Maintained `h-16` (64px) to match AppLayout header symmetry
2. **Logo Size**: Increased from `h-8` (32px) to `h-10` (40px) for expanded state
3. **Logo Width**: Added `max-w-[160px]` constraint to allow wider rectangular logos
4. **Horizontal Spacing**: Increased padding from `px-4` to `px-6` for more breathing room
5. **Centering**: Used `flex-1 justify-center` to center logo in available space
6. **Minimize Button**: Restored to original position and behavior

### Technical Details:

#### Mobile Sidebar:
- Header height: `h-16` (64px)
- Logo size: `h-10` (40px) with `max-w-[160px]`
- Logo is centered with margin-right to accommodate close button

#### Desktop Sidebar:
- **Expanded State**: 
  - Logo size: `h-10` (40px) with `max-w-[160px]`
  - Logo centered in available space
- **Collapsed State**: 
  - Logo size: `h-8` (32px) with `max-w-[32px]`
  - Logo centered in narrow sidebar
- **Minimize Button**: Always visible in top-right corner

### Layout Consistency:
- ✅ Header height matches AppLayout (`h-16`)
- ✅ Minimize button maintains original position and size
- ✅ Logo gets significantly more space for rectangular layouts
- ✅ Smooth transitions between collapsed/expanded states
- ✅ Responsive design works across mobile and desktop

### Logo Specifications:
- **Expanded Sidebar**: 40px height × up to 160px width
- **Collapsed Sidebar**: 32px height × up to 32px width
- **Mobile Sidebar**: 40px height × up to 160px width
- **Format**: Maintains aspect ratio with `object-contain`

This provides much more space for rectangular logos while keeping the overall layout structure and header symmetry intact.

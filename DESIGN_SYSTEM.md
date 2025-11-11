# 🎨 Design System Documentation

## Overview

This document defines the standardized design system for the Spotlight Real Estate SaaS application. All components, colors, spacing, and typography should follow these guidelines.

## Color Palette

### Primary Colors

```css
--background: #FFFFFF          /* Pure white background */
--foreground: #333333          /* Dark gray/black for main text */
--primary: #333333             /* Dark gray/black for buttons */
--primary-foreground: #FFFFFF   /* White text on dark buttons */
```

### Accent Colors

```css
--accent: #E50000              /* Red accent (#E50000 or #CC0000) */
--accent-foreground: #FFFFFF   /* White text on red */
--property-red: #E50000        /* Primary red accent */
--property-red-alt: #CC0000    /* Alternative red */
--property-red-light: #FF3333  /* Light red for hover */
```

### Gray Scale

```css
--property-gray-dark: #333333        /* Main text */
--property-gray-medium: #666666      /* Secondary text */
--property-gray-light: #E0E0E0       /* Borders */
--property-gray-very-light: #F0F0F0 /* Tag backgrounds */
--property-gray-ultra-light: #F8F8F8 /* Subtle backgrounds */
```

### Semantic Colors

```css
--secondary: #F0F0F0           /* Very light gray for tags/features */
--secondary-foreground: #333333 /* Dark text on light gray */
--muted: #F8F8F8               /* Very light gray backgrounds */
--muted-foreground: #666666     /* Medium gray for locations/details */
--destructive: #DC3545         /* Red for errors */
--destructive-foreground: #FFFFFF
--border: #E0E0E0              /* Light gray borders */
--input: #E0E0E0               /* Input borders */
--ring: #CCCCCC                /* Focus rings */
```

## Typography

### Font Family

- **Primary**: Inter (from `app/layout.tsx`)
- **Fallback**: system-ui, -apple-system, sans-serif

### Font Sizes

```css
text-xs    /* 12px - Small labels, captions */
text-sm    /* 14px - Secondary text, descriptions */
text-base  /* 16px - Body text (default) */
text-lg    /* 18px - Large body text */
text-xl    /* 20px - Section headings */
text-2xl   /* 24px - Page subheadings */
text-3xl   /* 30px - Page titles */
text-4xl   /* 36px - Hero titles */
text-5xl   /* 48px - Large hero titles */
```

### Font Weights

```css
font-normal  /* 400 - Body text */
font-medium  /* 500 - Emphasis */
font-semibold /* 600 - Headings */
font-bold    /* 700 - Strong emphasis */
```

## Spacing

### Standard Spacing Scale

```css
space-1   /* 4px */
space-2   /* 8px */
space-3   /* 12px */
space-4   /* 16px */
space-6   /* 24px */
space-8   /* 32px */
space-12  /* 48px */
space-16  /* 64px */
space-24  /* 96px */
```

### Component Spacing

- **Card Padding**: `p-6` (24px) or `p-8` (32px)
- **Section Padding**: `py-12` (48px vertical) or `py-24` (96px vertical)
- **Container Padding**: `px-6` (24px) or `px-8` (32px)
- **Gap Between Items**: `gap-4` (16px) or `gap-8` (32px)

## Border Radius

```css
--radius: 0.5rem  /* 8px - Standard rounded corners */
rounded-sm   /* 2px */
rounded      /* 4px */
rounded-md   /* 6px */
rounded-lg   /* 8px */
rounded-xl   /* 12px */
rounded-2xl   /* 16px */
rounded-3xl   /* 24px - Hero sections, cards */
```

## Shadows

```css
shadow-sm    /* Subtle shadow for cards */
shadow       /* Standard shadow */
shadow-md    /* Medium shadow for elevated elements */
shadow-lg    /* Large shadow for modals */
shadow-xl    /* Extra large shadow for hero sections */
```

## Layout

### Container Widths

- **Edge-to-Edge**: `w-full` (no max-width constraint)
- **Content Padding**: `px-6 lg:px-8` (responsive horizontal padding)
- **Max Content Width**: Use `max-w-3xl` or `max-w-4xl` for text content only

### Grid System

```css
grid-cols-1        /* Mobile: 1 column */
md:grid-cols-2     /* Tablet: 2 columns */
lg:grid-cols-3     /* Desktop: 3 columns */
xl:grid-cols-4     /* Large desktop: 4 columns */
```

## Components

### Buttons

```tsx
// Primary Button
<Button variant="default" className="bg-[#333333] text-white">
  Primary Action
</Button>

// Accent Button
<Button variant="default" className="bg-[#E50000] text-white">
  CTA Button
</Button>

// Outline Button
<Button variant="outline" className="border-[#E0E0E0]">
  Secondary Action
</Button>
```

### Cards

```tsx
<Card className="bg-white border border-[#E0E0E0]">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Card content
  </CardContent>
</Card>
```

### Badges

```tsx
// Default Badge
<Badge className="bg-[#F0F0F0] text-[#333333]">
  Tag
</Badge>

// Accent Badge
<Badge className="bg-[#E50000] text-white">
  Featured
</Badge>
```

### Inputs

```tsx
<Input 
  className="border-[#E0E0E0] focus:ring-[#CCCCCC]"
  placeholder="Enter text..."
/>
```

## Loading States

### Skeleton Components

Use the standardized skeleton components from `components/loading-skeletons.tsx`:

```tsx
import { PropertyCardSkeleton, TableSkeleton, FormSkeleton } from "@/components/loading-skeletons"

// Property cards
<PropertyListSkeleton count={6} />

// Tables
<TableSkeleton rows={10} cols={6} />

// Forms
<FormSkeleton />
```

## Animation

### Transitions

```css
transition-all duration-300 ease-in-out  /* Standard transition */
transition-colors duration-200           /* Color transitions */
```

### Hover Effects

```css
hover:bg-[#F8F8F8]        /* Light background on hover */
hover:shadow-md           /* Elevate on hover */
hover:scale-105           /* Slight zoom on hover */
```

## Responsive Breakpoints

```css
sm:  640px   /* Small devices (landscape phones) */
md:  768px   /* Medium devices (tablets) */
lg:  1024px  /* Large devices (desktops) */
xl:  1280px  /* Extra large devices */
2xl: 1536px  /* 2X Extra large devices */
```

## Best Practices

1. **Consistency**: Always use the defined color variables and spacing scale
2. **Accessibility**: Ensure sufficient contrast (WCAG AA minimum)
3. **Responsive**: Design mobile-first, then enhance for larger screens
4. **Loading States**: Always show loading skeletons during data fetching
5. **Error States**: Use destructive color for errors, provide clear messages
6. **Edge-to-Edge**: Use `w-full` for sections, add padding with `px-6 lg:px-8`

## File Locations

- **Global Styles**: `app/globals.css`
- **UI Components**: `components/ui/`
- **Loading Skeletons**: `components/loading-skeletons.tsx`
- **Design Tokens**: Defined in `app/globals.css` CSS variables

---

**Last Updated**: January 9, 2025


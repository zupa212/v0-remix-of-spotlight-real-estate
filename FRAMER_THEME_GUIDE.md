# 🎨 Framer-Style Global Property Theme Guide

## 📋 Overview

This theme is based on the clean, minimalist Framer-style design with precise color matching from the property listing examples.

---

## 🎨 Color Palette

### Primary Colors
- **White Background**: `#FFFFFF` - Pure white for backgrounds
- **Dark Gray Text**: `#333333` - Main text color (titles, prices, body)
- **Medium Gray**: `#666666` - Secondary text (locations, details, breadcrumbs)
- **Light Gray Borders**: `#E0E0E0` or `#CCCCCC` - Borders and dividers
- **Very Light Gray**: `#F0F0F0` - Feature tags, inactive elements
- **Ultra Light Gray**: `#F8F8F8` - Subtle backgrounds

### Accent Colors
- **Red Primary**: `#E50000` - Main CTA buttons, accents, highlights
- **Red Alternative**: `#CC0000` - Hover states, alternative red
- **Red Light**: `#FF3333` - Light red for hover effects

### CSS Variables
```css
--property-red: #E50000;
--property-red-alt: #CC0000;
--property-red-light: #FF3333;
--property-gray-dark: #333333;
--property-gray-medium: #666666;
--property-gray-light: #E0E0E0;
--property-gray-very-light: #F0F0F0;
--property-gray-ultra-light: #F8F8F8;
```

---

## 🔤 Typography

### Font Family
- **Primary**: Inter (Google Fonts)
- **Fallback**: Roboto, Arial, Helvetica Neue, system fonts
- **Usage**: Same font for both headings and body (Framer-style)

### Font Sizes
- **H1**: `2rem` (32px) - Main titles
- **H2**: `1.5rem` (24px) - Section headings
- **H3**: 1.25rem (20px) - Subsection headings
- **Body**: 1rem (16px) - Regular text
- **Secondary**: 0.875rem (14px) - Locations, details
- **Small**: 0.75rem (12px) - Breadcrumbs, captions

### Font Weights
- **Headings**: 700 (Bold)
- **Subheadings**: 600 (Semi-bold)
- **Body**: 400 (Regular)
- **Buttons**: 500 (Medium)

### Letter Spacing
- **Headings**: `-0.02em` (Tighter for modern look)
- **Buttons**: `0.01em` (Slightly tighter)

---

## 📐 Layout & Spacing

### Container Spacing
- **Mobile**: `1.5rem` (24px) horizontal padding
- **Desktop**: `3rem` (48px) horizontal padding

### Section Spacing
- **Vertical**: `4rem` (64px) between major sections

### Border Radius
- **Default**: `0.5rem` (8px) - Subtle rounding
- **Small**: `0.375rem` (6px) - Tags, small elements
- **Large**: `0.75rem` (12px) - Cards, larger elements

---

## 🎯 Component Styles

### Property Cards
```css
.property-card {
  background: #FFFFFF;
  border: 1px solid #E0E0E0;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.property-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}
```

### Feature Tags
```css
.feature-tag {
  background: #F0F0F0;
  color: #333333;
  border: none;
  border-radius: 0.375rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}
```

### Buttons
- **Primary (Dark)**: `#333333` background, `#FFFFFF` text
- **Accent (Red)**: `#E50000` background, `#FFFFFF` text
- **Secondary**: `#FFFFFF` background, `#333333` text, `#E0E0E0` border

### Input Fields
- **Border**: `#E0E0E0`
- **Focus Border**: `#333333`
- **Background**: `#FFFFFF`
- **Text**: `#333333`
- **Placeholder**: `#666666`

---

## 🎨 Usage Examples

### Text Colors
```tsx
// Main text
<p className="text-[#333333]">Main content</p>

// Secondary text (locations, details)
<p className="text-[#666666] text-sm">Location details</p>

// Small text (breadcrumbs)
<p className="text-[#666666] text-xs">Breadcrumb</p>
```

### Buttons
```tsx
// Primary dark button
<button className="bg-[#333333] text-white px-6 py-3 rounded-lg font-medium">
  Click Me
</button>

// Red accent button
<button className="bg-[#E50000] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#CC0000]">
  Request Info
</button>

// Secondary button
<button className="bg-white text-[#333333] border border-[#E0E0E0] px-6 py-3 rounded-lg font-medium">
  Secondary
</button>
```

### Cards
```tsx
<div className="property-card p-6">
  <h3 className="text-[#333333] font-bold text-lg">Property Title</h3>
  <p className="text-[#666666] text-sm">Location</p>
  <p className="text-[#333333] font-bold text-2xl">€350,000</p>
</div>
```

### Feature Tags
```tsx
<span className="feature-tag">Air Conditioning</span>
<span className="bg-[#F0F0F0] text-[#333333] px-3 py-1 rounded-md text-sm">
  Garden
</span>
```

### Accent Line
```tsx
<div className="flex items-center gap-4">
  <div className="w-1 h-12 bg-[#E50000]"></div>
  <h2 className="text-[#333333] font-bold text-2xl">Section Title</h2>
</div>
```

---

## 📱 Responsive Design

### Breakpoints
- **Mobile**: Default (< 768px)
- **Tablet**: `md:` (≥ 768px)
- **Desktop**: `lg:` (≥ 1024px)
- **Large Desktop**: `xl:` (≥ 1280px)

### Container Widths
- **Mobile**: Full width with padding
- **Desktop**: Max-width container with centered content

---

## ✨ Key Design Principles

1. **Clean & Minimal**: Generous whitespace, uncluttered layouts
2. **Consistent Typography**: Single font family (Inter) for everything
3. **Subtle Shadows**: Light shadows on cards for depth
4. **Smooth Transitions**: 0.2s ease for all interactions
5. **Red Accents**: Strategic use of red for CTAs and highlights
6. **Gray Scale**: Monochrome palette with red accent
7. **Card-Based UI**: Properties presented in distinct cards
8. **Rounded Corners**: Subtle 8px radius for modern feel

---

## 🔧 Implementation

All theme variables are defined in `app/globals.css`:
- CSS custom properties in `:root`
- Utility classes in `@layer base`
- Component-specific styles

Use Tailwind classes with the color values or the utility classes defined in the CSS.

---

## 📝 Notes

- This theme is optimized for property listings
- Colors are carefully matched to the Framer-style examples
- Typography follows modern web design best practices
- All colors are accessible (WCAG AA compliant)
- The theme is fully responsive

---

**Last Updated**: Based on Framer-style property listing design patterns


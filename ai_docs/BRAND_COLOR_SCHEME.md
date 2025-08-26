# Streamline AI Brand Color Scheme & Design System

This document defines the complete color palette, typography, and design tokens used throughout the Streamline AI platform. Use these values consistently across all components, pages, and design elements.

## 🎨 Primary Color Palette

### Core Brand Colors
- **Electric Blue (Primary)**: `#0088CC`
  - Used for: Primary actions, links, highlights, brand elements
  - CSS Variable: `--color-electric-blue`
  - Tailwind Class: `electric-blue`

- **Neon Green (Secondary)**: `#00CC44`
  - Used for: Success states, completed items, positive actions
  - CSS Variable: `--color-neon-green`
  - Tailwind Class: `neon-green`

### Background Colors
- **Dark Background (Primary)**: `#0A0A0B`
  - Used for: Main page backgrounds, body background
  - CSS Variable: `--color-dark-bg`
  - Tailwind Class: `dark-bg`

- **Dark Card Background**: `#1A1A1B`
  - Used for: Card backgrounds, modal backgrounds, section backgrounds
  - CSS Variable: `--color-dark-card`
  - Tailwind Class: `dark-card`

- **Dark Border**: `#2A2A2B`
  - Used for: Borders, dividers, subtle separators
  - CSS Variable: `--color-dark-border`
  - Tailwind Class: `dark-border`

### Accent & Utility Colors
- **Cyan Blue**: `#00D4FF`
  - Used for: Scrollbars, glowing effects, hover states
  - CSS Variable: `--color-cyan-blue`

- **Bright Green**: `#39FF14`
  - Used for: Scrollbar hover, success highlights
  - CSS Variable: `--color-bright-green`

- **Purple Accent**: `#A855F7` (from Tailwind purple-500)
  - Used for: Special highlights, premium features

## 🔤 Typography System

### Font Families
- **Primary Sans**: `Inter` (Google Fonts)
  - Weights: 300, 400, 500, 600, 700
  - Used for: Body text, headings, UI elements
  - CSS Variable: `--font-inter`

- **Monospace**: `JetBrains Mono` (Google Fonts)
  - Weights: 300, 400, 500, 600, 700
  - Used for: Code, technical content, terminal-style elements
  - CSS Variable: `--font-mono`

### Font Sizes & Weights
- **H1**: `text-4xl md:text-5xl font-bold` (36px/48px)
- **H2**: `text-3xl md:text-4xl font-bold` (30px/36px)
- **H3**: `text-2xl font-semibold` (24px)
- **H4**: `text-xl font-semibold` (20px)
- **Body Large**: `text-lg` (18px)
- **Body Default**: `text-base` (16px)
- **Body Small**: `text-sm` (14px)
- **Caption**: `text-xs` (12px)

## ✨ Special Effects & Animations

### Glow Effects
- **Blue Glow Text**: `.glow-text`
  ```css
  text-shadow: 0 0 10px #00D4FF, 0 0 20px #00D4FF, 0 0 30px #00D4FF;
  ```

- **Green Glow Text**: `.glow-text-green`
  ```css
  text-shadow: 0 0 10px #39FF14, 0 0 20px #39FF14, 0 0 30px #39FF14;
  ```

### Button Styles
- **Terminal Button**: `.btn-terminal`
  ```css
  @apply bg-dark-card border border-electric-blue text-electric-blue px-6 py-3 font-mono text-sm hover:bg-electric-blue hover:text-black transition-all duration-300;
  ```

- **Service Card**: `.service-card`
  ```css
  @apply bg-dark-card border border-dark-border p-6 rounded-lg hover:border-electric-blue transition-all duration-300 hover:shadow-lg;
  ```

### Animations
- **Glow Animation**: `animate-glow` (2s ease-in-out infinite alternate)
- **Float Animation**: `animate-float` (6s ease-in-out infinite)
- **Pulse Slow**: `animate-pulse-slow` (3s ease-in-out infinite)

## 🎯 Component-Specific Colors

### Form Elements
- **Input Background**: `#374151` (gray-800)
- **Input Border**: `#4B5563` (gray-600)
- **Input Focus Ring**: `#3B82F6` (blue-500)
- **Input Placeholder**: `#9CA3AF` (gray-400)

### Status Colors
- **Success**: `#10B981` (emerald-500)
- **Warning**: `#F59E0B` (amber-500)
- **Error**: `#EF4444` (red-500)
- **Info**: `#3B82F6` (blue-500)

### Table Styling
- **Table Header**: `#0A0A0B` (dark-bg)
- **Table Row**: `#1A1A1B` (dark-card)
- **Table Border**: `#2A2A2B` (dark-border)
- **Hover State**: `rgba(0, 136, 204, 0.1)` (electric-blue with opacity)

## 🎨 Color Usage Guidelines

### Primary Actions
- Use **Electric Blue** (`#0088CC`) for:
  - Primary buttons
  - Links
  - Call-to-action elements
  - Brand highlights
  - Focus states

### Secondary Actions
- Use **Neon Green** (`#00CC44`) for:
  - Success messages
  - Completed states
  - Positive confirmations
  - Progress indicators

### Background Hierarchy
1. **Dark Background** (`#0A0A0B`) - Main page background
2. **Dark Card** (`#1A1A1B`) - Content containers
3. **Dark Border** (`#2A2A2B`) - Subtle separators

### Text Colors
- **Primary Text**: `white` (`#FFFFFF`)
- **Secondary Text**: `#D1D5DB` (gray-300)
- **Muted Text**: `#9CA3AF` (gray-400)
- **Accent Text**: Use brand colors for emphasis

## 🚀 Implementation Examples

### Tailwind CSS Classes
```jsx
// Primary button
<button className="bg-electric-blue hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors">
  Get Started
</button>

// Card container
<div className="bg-dark-card border border-dark-border rounded-lg p-6 hover:border-electric-blue transition-all duration-300">
  Content here
</div>

// Glowing text
<h1 className="glow-text text-electric-blue">Streamline AI</h1>
```

### CSS Variables
```css
:root {
  --color-electric-blue: #0088CC;
  --color-neon-green: #00CC44;
  --color-dark-bg: #0A0A0B;
  --color-dark-card: #1A1A1B;
  --color-dark-border: #2A2A2B;
  --color-cyan-blue: #00D4FF;
  --color-bright-green: #39FF14;
}
```

### React Component with Theme
```tsx
const ThemedButton = ({ children, variant = 'primary' }) => {
  const baseClasses = "px-6 py-3 rounded-lg font-medium transition-all duration-300";
  
  const variants = {
    primary: `${baseClasses} bg-electric-blue hover:bg-blue-600 text-white`,
    secondary: `${baseClasses} bg-dark-card border border-electric-blue text-electric-blue hover:bg-electric-blue hover:text-black`,
    success: `${baseClasses} bg-neon-green hover:bg-green-600 text-black`
  };
  
  return (
    <button className={variants[variant]}>
      {children}
    </button>
  );
};
```

## 📱 Responsive Design Considerations

### Mobile-First Approach
- Use `text-4xl` on mobile, `md:text-5xl` on larger screens
- Maintain consistent spacing with `space-y-6` (24px) between sections
- Ensure touch-friendly button sizes (minimum 44px)

### Breakpoint Strategy
```css
/* Mobile: 320px - 767px */
/* Tablet: 768px - 1023px */
/* Desktop: 1024px+ */
```

## 🔧 Maintenance & Updates

### When to Update This Document
- New color additions
- Component style changes
- Design system updates
- Brand evolution

### Version Control
- Keep this document in sync with `tailwind.config.js`
- Update when `globals.css` changes
- Document any new utility classes or components

---

**Last Updated**: [Current Date]
**Maintained By**: Development Team
**Review Cycle**: Monthly or with major design updates

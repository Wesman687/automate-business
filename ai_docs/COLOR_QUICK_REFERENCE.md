# 🎨 Color Quick Reference Card

## Primary Colors (Most Used)
```css
/* Electric Blue - Primary brand color */
.electric-blue { color: #0088CC; }
.bg-electric-blue { background-color: #0088CC; }

/* Neon Green - Success/secondary */
.neon-green { color: #00CC44; }
.bg-neon-green { background-color: #00CC44; }
```

## Background Colors
```css
/* Main background */
.dark-bg { background-color: #0A0A0B; }

/* Card/container backgrounds */
.dark-card { background-color: #1A1A1B; }

/* Borders and dividers */
.dark-border { border-color: #2A2A2B; }
```

## Text Colors
```css
/* Primary text */
.text-white { color: #FFFFFF; }

/* Secondary text */
.text-gray-300 { color: #D1D5DB; }

/* Muted text */
.text-gray-400 { color: #9CA3AF; }
```

## Common Tailwind Classes
```jsx
// Primary button
className="bg-electric-blue hover:bg-blue-600 text-white px-6 py-3 rounded-lg"

// Card container
className="bg-dark-card border border-dark-border rounded-lg p-6"

// Glowing text
className="glow-text text-electric-blue"

// Terminal button
className="btn-terminal"
```

## CSS Variables (for custom CSS)
```css
:root {
  --electric-blue: #0088CC;
  --neon-green: #00CC44;
  --dark-bg: #0A0A0B;
  --dark-card: #1A1A1B;
  --dark-border: #2A2A2B;
}
```

## Quick Copy Colors
- **Primary Blue**: `#0088CC`
- **Success Green**: `#00CC44`
- **Background**: `#0A0A0B`
- **Card**: `#1A1A1B`
- **Border**: `#2A2A2B`
- **Cyan**: `#00D4FF`
- **Bright Green**: `#39FF14`

---
*For complete documentation, see `BRAND_COLOR_SCHEME.md`*

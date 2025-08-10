# @streamlineai/badge

Professional, ultra-compact React badges for StreamlineAI-powered applications with 9 stunning styles and advanced customization.

## 🚀 Quick Start

### Installation

```bash
npm install @streamlineai/badge
# or
yarn add @streamlineai/badge
```

### Basic Usage

```jsx
import StreamlineAIBadge from '@streamlineai/badge';

function App() {
  return (
    <div>
      <StreamlineAIBadge />
    </div>
  );
}
```

## 🎨 Available Styles

### Minimalist (default)
```jsx
<StreamlineAIBadge style="minimalist" size="small" />
```

### Professional Card
```jsx
<StreamlineAIBadge style="professional" size="medium" />
```

### Glassmorphism
```jsx
<StreamlineAIBadge style="glassmorphism" size="large" />
```

### Dark Theme
```jsx
<StreamlineAIBadge style="dark" size="small" />
```

### Neon Effect
```jsx
<StreamlineAIBadge style="neon" animation="glow" />
```

### Gradient Animation
```jsx
<StreamlineAIBadge style="gradient" animation="pulse" />
```

### Outline Style
```jsx
<StreamlineAIBadge style="outline" size="medium" />
```

### Corner Badge
```jsx
<StreamlineAIBadge style="corner" position="fixed" fixedPosition="bottom-right" />
```

### Ultra Minimal
```jsx
<StreamlineAIBadge style="minimal" size="small" />
```

### Dark Theme
```jsx
<StreamlineAIBadge style="dark" />
```

### Glassmorphism
```jsx
<StreamlineAIBadge style="glassmorphism" />
```

## 🔧 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `style` | `'minimalist' \| 'professional' \| 'glassmorphism' \| 'dark' \| 'neon' \| 'gradient' \| 'outline' \| 'corner' \| 'minimal'` | `'minimalist'` | Badge style variant |
| `size` | `'small' \| 'medium' \| 'large' \| 'xl'` | `'medium'` | Badge size (ultra-compact sizing) |
| `position` | `'inline' \| 'fixed'` | `'inline'` | Positioning mode |
| `fixedPosition` | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right' \| 'center-top' \| 'center-bottom'` | `'bottom-right'` | Fixed position location |
| `animation` | `'none' \| 'pulse' \| 'bounce' \| 'glow' \| 'float' \| 'shake'` | `'none'` | Animation effect |
| `customUrl` | `string` | `'https://stream-lineai.com'` | Link destination |
| `text` | `string` | `'Designed by StreamlineAI'` | Badge text content |
| `textColor` | `string` | `undefined` | Custom text color |
| `backgroundColor` | `string` | `undefined` | Custom background color |
| `borderColor` | `string` | `undefined` | Custom border color |
| `className` | `string` | `''` | Additional CSS classes |
| `onClick` | `() => void` | `undefined` | Click handler (overrides link) |

## 📏 Ultra-Compact Sizes

- **Small**: 1px 3px padding, 8px font, 9px icons
- **Medium**: 2px 4px padding, 10px font, 11px icons  
- **Large**: 3px 6px padding, 12px font, 13px icons
- **XL**: 4px 8px padding, 14px font, 15px icons

## 💡 Examples

### Custom URL and Text
```jsx
<StreamlineAIBadge 
  style="professional"
  customUrl="https://your-website.com"
  text="Built with StreamlineAI"
/>
```

### Custom Click Handler
```jsx
<StreamlineAIBadge 
  style="minimalist"
  onClick={() => console.log('Badge clicked!')}
/>
```

### With Custom Styling
```jsx
<StreamlineAIBadge 
  style="minimal"
  className="my-custom-class"
/>
```

## 🎯 Use Cases

- **Portfolio websites** - Show your tech stack
- **Client projects** - Subtle branding
- **Landing pages** - Professional credibility
- **Documentation** - Tool attribution
- **Apps & dashboards** - Powered by badges

## 📱 Responsive Design

All badges are fully responsive and work perfectly on:
- ✅ Desktop computers
- ✅ Tablets  
- ✅ Mobile phones
- ✅ All modern browsers

## 🚀 Performance

- **Lightweight** - Less than 5KB gzipped
- **Zero dependencies** - Only requires React
- **Tree-shakable** - Only imports what you use
- **TypeScript** - Full type support included

## 📄 License

MIT © [StreamlineAI](https://stream-lineai.com)

---

**Made with ❤️ by StreamlineAI** ⚡

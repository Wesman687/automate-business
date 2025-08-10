# 🚀 StreamlineAI Badge Integration Guide

## 📦 Option 1: Copy & Paste (Recommended for Quick Start)

### For React Projects

1. **Download the component**: Copy `StreamlineAIBadge-simple.jsx` to your project
2. **Import and use**:

```jsx
import StreamlineAIBadge from './components/StreamlineAIBadge-simple';

function App() {
  return (
    <div>
      <StreamlineAIBadge style="minimalist" />
    </div>
  );
}
```

### For HTML Projects

1. **Choose a style** from the individual HTML files:
   - `badge-minimalist.html`
   - `badge-professional.html` 
   - `badge-corner.html`
   - `badge-minimal.html`

2. **Copy the HTML code** and paste into your website

## 📦 Option 2: NPM Package (Coming Soon)

We're preparing an official NPM package for easier installation:

```bash
# This will be available soon:
npm install @streamlineai/badge
```

```jsx
import StreamlineAIBadge from '@streamlineai/badge';

<StreamlineAIBadge style="professional" />
```

## 🎨 Quick Examples

### React Component Usage

```jsx
// Basic badge
<StreamlineAIBadge />

// Professional style
<StreamlineAIBadge style="professional" />

// Custom URL and text
<StreamlineAIBadge 
  style="minimalist"
  customUrl="https://your-website.com"
  text="Built with StreamlineAI"
/>

// Corner floating badge
<StreamlineAIBadge style="corner" />

// With click handler
<StreamlineAIBadge 
  style="minimal"
  onClick={() => window.open('https://stream-lineai.com')}
/>
```

### HTML Direct Usage

```html
<!-- Minimalist Badge -->
<a href="https://stream-lineai.com" target="_blank" style="display: inline-flex; align-items: center; padding: 8px 16px; background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); color: white; text-decoration: none; border-radius: 25px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 500; box-shadow: 0 2px 8px rgba(0, 212, 255, 0.3); transition: all 0.3s ease;">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 6px;">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
    Designed by StreamlineAI
</a>
```

## 🛠️ Customization

### Change Colors
Update the gradient colors in the style attribute:
```css
background: linear-gradient(135deg, #your-color 0%, #your-color-2 100%);
```

### Modify Text
Replace the badge text:
```jsx
text="Your Custom Text"
```

### Update URL
Point to your website:
```jsx
customUrl="https://your-website.com"
```

## 📋 Integration Checklist

- [ ] Choose your preferred style
- [ ] Copy the appropriate file to your project
- [ ] Update the URL to `https://stream-lineai.com` (already done)
- [ ] Customize text if needed
- [ ] Test on mobile devices
- [ ] Verify click functionality

## 🎯 Best Practices

1. **Placement**: Footer, header, or about sections work best
2. **Styling**: Keep original colors for brand consistency
3. **Mobile**: All badges are responsive by default
4. **Performance**: Badges are lightweight and fast-loading

## 🆘 Need Help?

- 📧 Email: support@stream-lineai.com
- 🌐 Website: https://stream-lineai.com
- 📖 Documentation: Check the README.md files

---

**Ready to showcase your StreamlineAI-powered projects!** ⚡

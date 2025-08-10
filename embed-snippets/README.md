# 🚀 StreamlineAI Embed Badges

Professional, customizable badges to showcase your StreamlineAI-powered websites and applications.

## 📋 Quick Start

1. **Choose a style** from the demo page
2. **Copy the HTML code**
3. **Paste into your website**
4. **Update the URL** if needed

## 🎨 Available Styles

### 1. **Minimalist Badge** (`badge-minimalist.html`)
- Clean gradient design with lightning icon
- Perfect for headers and footers
- Compact and eye-catching

### 2. **Professional Card** (`badge-professional.html`) 
- Corporate-friendly design
- "Powered by" branding
- Great for business websites

### 3. **Corner Badge** (`badge-corner.html`)
- Fixed position bottom-right
- Floating design with blur effect
- Non-intrusive but visible

### 4. **Ultra Minimal** (`badge-minimal.html`)
- Text-only with heart emoji
- Extremely lightweight
- Perfect for clean designs

## 🔧 Customization

### Change the URL
Replace `https://streamlineai.com` with your actual website URL:

```html
<a href="https://your-website.com" target="_blank" ...>
```

### Modify Text
Update the badge text to match your branding:

```html
<!-- Change from -->
Designed by StreamlineAI

<!-- To -->
Built with StreamlineAI
Powered by StreamlineAI
Created using StreamlineAI
```

### Adjust Colors
Modify the CSS colors in the `style` attribute:

```html
<!-- Primary color: #00d4ff (StreamlineAI blue) -->
<!-- Secondary: #0099cc (darker blue) -->
<!-- You can change these to match your brand -->
```

## ⚛️ React Component

For React applications, use the `StreamlineAIBadge.jsx` component:

```jsx
import StreamlineAIBadge from './StreamlineAIBadge';

// Basic usage
<StreamlineAIBadge />

// Different styles
<StreamlineAIBadge style="professional" />
<StreamlineAIBadge style="corner" />
<StreamlineAIBadge style="minimal" />

// Custom options
<StreamlineAIBadge 
  style="minimalist" 
  customUrl="https://your-website.com"
  text="Built with StreamlineAI"
/>
```

## 📱 Mobile Responsive

All badges are fully responsive and work perfectly on:
- ✅ Desktop computers
- ✅ Tablets
- ✅ Mobile phones
- ✅ All modern browsers

## 🎯 Best Practices

### Placement Recommendations

1. **Minimalist Badge**: Header, navigation, or footer
2. **Professional Card**: Footer or about section
3. **Corner Badge**: Any page (non-intrusive)
4. **Ultra Minimal**: Footer or copyright area

### SEO Benefits

- All badges include `target="_blank"` for external links
- Proper `rel="noopener noreferrer"` attributes (in React component)
- No impact on page load speed
- Clean, semantic HTML

## 🚀 Performance

- **Zero dependencies** - All styles are inline
- **Lightweight** - Under 1KB each
- **Fast loading** - No external CSS or JS files
- **Smooth animations** - Hardware-accelerated transitions

## 🎨 Preview

Open `streamline-badge.html` in your browser to see all styles in action with copy-to-clipboard functionality.

## 📞 Support

Need custom badge designs or have questions?
- 🌐 Visit: https://streamlineai.com
- 📧 Email: support@streamlineai.com

## 📄 License

These badges are free to use for any website or application powered by StreamlineAI.

---

**Made with ❤️ by StreamlineAI** ⚡

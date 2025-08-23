# Embedded Authentication

This directory contains the JavaScript files for handling embedded authentication in iframes.

## Files

### `embedded-auth.js`
Standalone JavaScript that automatically:
- Detects if the page is running in an iframe
- Applies custom styling for embedded mode
- Monitors for authentication success
- Sends postMessage to parent window on login

## Usage

### 1. Include in your login page:
```html
<script src="/js/embedded-auth.js"></script>
```

### 2. Embed the login in your app:
```html
<iframe src="http://localhost:3000/portal?embedded=true" 
        width="400" height="500" 
        style="border:none; border-radius:8px;">
</iframe>
```

### 3. Listen for authentication success:
```javascript
window.addEventListener('message', (event) => {
  if (event.data.type === 'AUTH_SUCCESS') {
    console.log('🎉 User logged in successfully!');
    // Handle successful login (hide iframe, show content, etc.)
  }
});
```

## Features

- ✅ **Automatic detection** of iframe embedding
- ✅ **Custom styling** for embedded mode
- ✅ **Cookie monitoring** for auth state changes
- ✅ **PostMessage communication** with parent window
- ✅ **Dark theme** optimized for video app integration
- ✅ **Responsive design** for different iframe sizes

## Testing

Open `/test-embedded-login.html` to test the embedded login in different sizes and configurations.

# Facebook Open Graph Debugging Guide

## 🔧 Issue Fixed: Duplicate Meta Tags

**Problem:** Your Facebook OG cards stopped working because you had conflicting meta tags defined in two places:
1. `layout.tsx` (Next.js 13+ metadata API) ✅ 
2. `page.tsx` (manual `<meta>` tags) ❌ **REMOVED**

## ✅ Solution Applied

### 1. Removed Duplicate Meta Tags
- ❌ Removed all manual `<meta>` tags from `page.tsx`
- ❌ Removed `Head` component import
- ✅ Kept only the Next.js metadata API in `layout.tsx`

### 2. Improved Open Graph Configuration
- ✅ Changed image URLs from relative `/og-banner-desktop.png` to absolute `https://stream-lineai.com/og-banner-desktop.png`
- ✅ Added `type: 'image/png'` to image metadata
- ✅ Ensured all URLs are absolute for better Facebook scraping

### 3. Current Open Graph Meta Tags (from layout.tsx)
```typescript
openGraph: {
  type: 'website',
  locale: 'en_US',
  url: 'https://stream-lineai.com',
  siteName: 'Streamline AI',
  title: 'Streamline AI - Business Automation Experts | AI-Powered Solutions',
  description: 'Transform your business with AI automation. Custom chatbots, mobile apps, and workflow solutions that save time and boost productivity.',
  images: [
    {
      url: 'https://stream-lineai.com/og-banner-desktop.png',
      width: 1200,
      height: 630,
      alt: 'Streamline AI - Automate Your Business with AI-powered tools',
      type: 'image/png',
    },
  ],
}
```

## 🧪 Testing Your Fix

### 1. Facebook Sharing Debugger
Visit: https://developers.facebook.com/tools/debug/
- Enter your URL: `https://stream-lineai.com`
- Click "Debug" to see how Facebook sees your meta tags
- Click "Scrape Again" if you see old cached data

### 2. LinkedIn Post Inspector
Visit: https://www.linkedin.com/post-inspector/
- Enter your URL: `https://stream-lineai.com`
- Check if the preview looks correct

### 3. Twitter Card Validator
Visit: https://cards-dev.twitter.com/validator
- Enter your URL: `https://stream-lineai.com`
- Verify the card preview

## 📋 Verification Checklist

- [ ] No duplicate meta tags (check page source)
- [ ] OG image loads correctly at: `https://stream-lineai.com/og-banner-desktop.png`
- [ ] Facebook debugger shows clean meta tags
- [ ] LinkedIn preview works correctly
- [ ] Twitter card displays properly

## 🚀 Deploy Instructions

1. **Deploy your changes** to production
2. **Wait 5-10 minutes** for deployment
3. **Test with Facebook Debugger** using production URL
4. **Clear old cache** by clicking "Scrape Again" in Facebook debugger

## 🔍 Why This Happened

**Duplicate Meta Tags Issue:**
- Next.js 13+ uses the metadata API in `layout.tsx`
- Your `page.tsx` had manual `<meta>` tags using the old `<Head>` component
- This created conflicting meta tags that confused Facebook's scraper
- Facebook couldn't determine which meta tags to use

**Solution:**
- Use ONLY the Next.js metadata API in `layout.tsx`
- Remove all manual meta tags from `page.tsx`
- Use absolute URLs for all images and links

## 🛠️ Future Prevention

- ✅ Always use Next.js metadata API for meta tags
- ✅ Use absolute URLs for social media images
- ✅ Test with Facebook debugger after any meta tag changes
- ✅ Clear cache using "Scrape Again" when testing
- ❌ Don't mix metadata API with manual `<meta>` tags

Your Facebook sharing should now work correctly! 🎉

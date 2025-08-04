import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://stream-lineai.com'),
  title: {
    default: 'Streamline AI - Business Automation, Websites & Mobile Apps',
    template: '%s | Streamline AI'
  },
  description: 'We help businesses automate workflows, build custom websites, and develop powerful mobile apps using AI-powered tools. Save time, reduce costs, and scale your business with our expert automation services.',
  keywords: [
    'business automation',
    'AI chatbot development', 
    'custom website design',
    'mobile app development',
    'workflow automation',
    'AI consulting',
    'process optimization',
    'digital transformation',
    'streamline AI',
    'business efficiency'
  ],
  authors: [{ name: 'Streamline AI Team' }],
  creator: 'Streamline AI',
  publisher: 'Streamline AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://stream-lineai.com',
    siteName: 'Streamline AI',
    title: 'Streamline AI - Business Automation Experts | AI-Powered Solutions',
    description: 'Transform your business with AI automation. Custom chatbots, mobile apps, and workflow solutions that save time and boost productivity. Free consultation available.',
    images: [
      {
        url: '/og-banner-desktop.png',
        width: 1200,
        height: 630,
        alt: 'Streamline AI - Automate Your Business with AI-powered tools and custom solutions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Streamline AI - Automate Your Business with AI',
    description: 'Custom AI tools, websites, and mobile apps to streamline your business. Get your free consultation today!',
    creator: '@StreamlineAI',
    images: ['/og-banner-mobile.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  verification: {
    google: 'your-google-verification-code',
  },
}

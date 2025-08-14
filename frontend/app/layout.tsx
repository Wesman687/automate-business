import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import ChatBot from '@/components/ChatBot'
import ParticleBackground from '@/components/ParticleBackground'
import { AuthProvider } from '@/hooks/useAuth'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
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
  metadataBase: new URL('https://stream-lineai.com'),
  alternates: {
    canonical: 'https://stream-lineai.com',
  },
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
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Streamline AI - Automate Your Business with AI',
    description: 'Custom AI tools, websites, and mobile apps to streamline your business.',
    creator: '@StreamlineAI',
    images: ['https://stream-lineai.com/og-banner-mobile.png'],
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
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0088CC',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="bg-dark-bg text-white">
        {/* Google Tag Manager (noscript) */}
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TX2RM6CL"
          height="0" width="0" style={{ display: 'none', visibility: 'hidden' }}></iframe></noscript>
        {/* End Google Tag Manager (noscript) */}
        <ParticleBackground />
        <AuthProvider>
          {children}
          <ChatBot />
        </AuthProvider>
      </body>
    </html>
  )
}

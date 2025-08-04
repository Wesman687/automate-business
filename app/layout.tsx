import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import ChatBot from '@/components/ChatBot'
import ParticleBackground from '@/components/ParticleBackground'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'Streamline Tech Solutions | We Automate. You Scale.',
  description: 'Custom AI and automation tools built by expert developers. Streamline your business with intelligent automation solutions.',
  keywords: 'AI automation, business automation, custom software development, chatbots, workflow automation, API integrations',
  authors: [{ name: 'Streamline Tech Solutions' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#00D4FF',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="bg-dark-bg text-white">
        <ParticleBackground />
        {children}
        <ChatBot />
      </body>
    </html>
  )
}

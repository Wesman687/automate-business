import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Services - AI Automation & Development Solutions',
  description: 'Discover our comprehensive suite of AI-powered services including chatbot development, custom websites, mobile apps, and business process automation. Transform your business today.',
  keywords: [
    'AI services',
    'chatbot development',
    'website development', 
    'mobile app development',
    'business automation',
    'AI integration',
    'custom software development'
  ],
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

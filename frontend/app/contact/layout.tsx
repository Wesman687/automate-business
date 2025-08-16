import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us - Get Your AI Automation Project Started',
  description: 'Ready to transform your business with AI? Contact StreamlineAI for a free consultation. We respond within 24 hours and offer quick project turnaround.',
  keywords: [
    'contact streamline ai',
    'AI consultation',
    'business automation quote',
    'custom development inquiry',
    'AI project consultation'
  ],
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

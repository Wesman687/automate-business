import Hero from '@/components/Hero'
import Services from '@/components/Services'
import HowItWorks from '@/components/HowItWorks'
import TechCredibility from '@/components/TechCredibility'
import About from '@/components/About'
import Contact from '@/components/Contact'
import Head from 'next/head'

export default function Home() {
  return (
    <main className="min-h-screen">
<Head>
  <title>Streamline AI - Business Automation, Websites & Mobile Apps</title>
  <meta
    name="description"
    content="We help businesses automate workflows, build custom websites, and develop powerful mobile apps using AI-powered tools."
  />
  <meta
    name="keywords"
    content="business automation, website design, ai chatbots, mobile app development, custom dashboards, ai automation, streamlineai, workflow optimization, small business apps, real-time analytics, professional automation services"
  />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta charSet="UTF-8" />

  {/* Open Graph */}
  <meta property="og:title" content="Streamline AI - Business Automation & AI Solutions" />
  <meta property="og:description" content="We build custom automation, chatbots, websites, and mobile apps for businesses that want to scale." />
  <meta property="og:image" content="https://stream-lineai.com/og-banner.png" />
  <meta property="og:url" content="https://stream-lineai.com" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Streamline AI" />

  {/* Twitter Card */}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Streamline AI - Business Automation & AI Solutions" />
  <meta name="twitter:description" content="We build custom automation, chatbots, websites, and mobile apps for businesses that want to scale." />
  <meta name="twitter:image" content="https://stream-lineai.com/og-banner.png" />

  {/* Structured Data */}
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: "Streamline AI",
        url: "https://stream-lineai.com",
        email: "sales@stream-lineai.com",
        description:
          "Streamline AI builds AI-powered tools for business automation, websites, and mobile apps.",
        keywords: [
          "business automation",
          "ai chatbot",
          "custom website design",
          "mobile app development",
          "real-time dashboards",
        ],
      }),
    }}
  />
</Head>

      <Hero />
      <Services />
      <HowItWorks />
      <TechCredibility />
      <About />
      <Contact />
    </main>
  )
}

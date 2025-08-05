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
  {/* ✅ Primary Meta Tags */}
  <title>Streamline AI - Business Automation, Websites & Mobile Apps</title>
  <meta
    name="description"
    content="We help businesses automate workflows, build custom websites, and develop powerful mobile apps using AI-powered tools. Save time, reduce costs, and scale your business with our expert automation services."
  />
  <meta
    name="keywords"
    content="business automation, website design, ai chatbots, mobile app development, custom dashboards, ai automation, streamlineai, workflow optimization, small business apps, real-time analytics, professional automation services, AI consulting, process automation, digital transformation"
  />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta charSet="UTF-8" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
  <meta name="author" content="Streamline AI" />
  <meta name="language" content="English" />
  <meta name="revisit-after" content="7 days" />
  
  {/* ✅ Canonical URL */}
  <link rel="canonical" href="https://stream-lineai.com" />
  
  {/* ✅ Favicon and App Icons */}
  <link rel="icon" href="/favicon.ico" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
  <link rel="manifest" href="/site.webmanifest" />
  <meta name="theme-color" content="#0088CC" />

  {/* ✅ Enhanced Open Graph (Facebook, LinkedIn) */}
  <meta property="og:title" content="Streamline AI - Business Automation Experts | AI-Powered Solutions" />
  <meta property="og:description" content="Transform your business with AI automation. Custom chatbots, mobile apps, and workflow solutions that save time and boost productivity. Free consultation available." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://stream-lineai.com" />
  <meta property="og:image" content="https://stream-lineai.com/og-banner-desktop.png?v=2025" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="Streamline AI - Automate Your Business with AI-powered tools and custom solutions" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:site_name" content="Streamline AI" />
  <meta property="og:locale" content="en_US" />
  <meta property="article:author" content="Streamline AI" />

  {/* ✅ Enhanced Twitter Card */}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Streamline AI - Automate Your Business with AI" />
  <meta name="twitter:description" content="Custom AI tools, websites, and mobile apps to streamline your business. Get your free consultation today!" />
  <meta name="twitter:image" content="https://stream-lineai.com/og-banner-mobile.png?v=2025" />
  <meta name="twitter:image:alt" content="Streamline AI mobile banner with logo and automation solutions" />
  <meta name="twitter:creator" content="@StreamlineAI" />
  <meta name="twitter:site" content="@StreamlineAI" />

  {/* ✅ Enhanced JSON-LD Structured Data for SEO */}
  <script type="application/ld+json" dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Streamline AI",
      "url": "https://stream-lineai.com",
      "logo": "https://stream-lineai.com/logo.png",
      "email": "sales@stream-lineai.com",
      "telephone": "+1-XXX-XXX-XXXX",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "US"
      },
      "description": "Streamline AI specializes in AI-powered business automation, custom website development, and mobile app creation. We help businesses reduce manual work and increase efficiency through intelligent automation solutions.",
      "keywords": [
        "business automation",
        "ai chatbot development",
        "custom website design", 
        "mobile app development",
        "workflow automation",
        "AI consulting",
        "process optimization",
        "digital transformation"
      ],
      "serviceArea": "Worldwide",
      "areaServed": "Global",
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Automation Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "AI Chatbot Development",
              "description": "Custom AI chatbots for 24/7 customer support and lead generation"
            }
          },
          {
            "@type": "Offer", 
            "itemOffered": {
              "@type": "Service",
              "name": "Workflow Automation",
              "description": "Custom automation scripts and process optimization"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service", 
              "name": "Mobile App Development",
              "description": "Native iOS and Android apps with automation features"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Custom Integrations", 
              "description": "API development and third-party service connections"
            }
          }
        ]
      },
      "founder": {
        "@type": "Person",
        "name": "Streamline AI Team"
      },
      "foundingDate": "2024",
      "slogan": "We Automate. You Scale.",
      "sameAs": [
        "https://www.linkedin.com/company/streamline-ai",
        "https://twitter.com/StreamlineAI",
        "https://github.com/streamline-ai"
      ]
    })
  }} />
  
  {/* ✅ Additional Structured Data - Organization */}
  <script type="application/ld+json" dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Streamline AI",
      "url": "https://stream-lineai.com",
      "logo": "https://stream-lineai.com/logo.png",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-XXX-XXX-XXXX",
        "contactType": "Sales",
        "email": "sales@stream-lineai.com",
        "availableLanguage": "English"
      },
      "address": {
        "@type": "PostalAddress", 
        "addressCountry": "US"
      },
      "description": "Leading AI automation company specializing in business process optimization, custom software development, and intelligent automation solutions.",
      "knowsAbout": [
        "Artificial Intelligence",
        "Business Process Automation", 
        "Mobile App Development",
        "Web Development",
        "API Integration",
        "Workflow Optimization"
      ]
    })
  }} />

  {/* ✅ Website Structured Data */}
  <script type="application/ld+json" dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Streamline AI",
      "url": "https://stream-lineai.com",
      "description": "Professional AI automation services for businesses worldwide",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://stream-lineai.com/?q={search_term_string}",
        "query-input": "required name=search_term_string"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Streamline AI"
      }
    })
  }} />

  {/* ✅ Article Structured Data for Better Social Sharing */}
  <script type="application/ld+json" dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Streamline AI - Business Automation Experts",
      "description": "Transform your business with AI automation. Custom chatbots, mobile apps, and workflow solutions that save time and boost productivity.",
      "image": "https://stream-lineai.com/og-banner-desktop.png?v=2025",
      "author": {
        "@type": "Organization",
        "name": "Streamline AI"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Streamline AI",
        "logo": {
          "@type": "ImageObject",
          "url": "https://stream-lineai.com/logo.png"
        }
      },
      "datePublished": "2025-01-04",
      "dateModified": "2025-01-04"
    })
  }} />
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

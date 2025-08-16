import Hero from '@/components/Hero'
import Services from '@/components/Services'
import HowItWorks from '@/components/HowItWorks'
import TechCredibility from '@/components/TechCredibility'
import About from '@/components/About'
import Contact from '@/components/Contact'
import Script from 'next/script'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Google Tag Manager Script */}
      <Script id="google-tag-manager" strategy="afterInteractive">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-TX2RM6CL');
        `}
      </Script>

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
  

      {/* Add padding-top to account for fixed navigation */}
      <div className="pt-16">
        <Hero />
        <div id="services">
          <Services />
        </div>
        <HowItWorks />
        <TechCredibility />
        <div id="about">
          <About />
        </div>
        <div id="contact">
          <Contact />
        </div>
      </div>
    </main>
  )
}

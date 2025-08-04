import Hero from '@/components/Hero'
import Services from '@/components/Services'
import HowItWorks from '@/components/HowItWorks'
import TechCredibility from '@/components/TechCredibility'
import About from '@/components/About'
import Contact from '@/components/Contact'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Services />
      <HowItWorks />
      <TechCredibility />
      <About />
      <Contact />
    </main>
  )
}

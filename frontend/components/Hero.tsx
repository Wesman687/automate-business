'use client'

import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

export default function Hero() {
  const scrollToServices = () => {
    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark-bg via-dark-bg to-dark-card opacity-90 z-10"></div>
      
      <div className="container mx-auto px-6 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-6xl md:text-8xl lg:text-9xl font-bold mb-6 leading-tight"
          >
            <span className="text-white">We</span>{' '}
            <span className="glow-text text-electric-blue">Automate</span>
            <span className="text-white">.</span>
            <br />
            <span className="text-white">You</span>{' '}
            <span className="glow-text-green text-neon-green">Scale</span>
            <span className="text-white">.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
          >
            Custom AI and automation tools built by{' '}
            <span className="text-electric-blue font-semibold">expert developers</span>.
            <br />
            Stop wasting time on repetitive tasks. Start scaling your business.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <button
              onClick={() => {
                // Try multiple methods to open the chatbot
                console.log('Get Started button clicked!')
                
                // Method 1: Direct window function call
                if ((window as any).openStreamlineAIChatbot) {
                  (window as any).openStreamlineAIChatbot()
                  return
                }
                
                // Method 2: Custom event
                const event = new CustomEvent('openChatbot')
                window.dispatchEvent(event)
                
                // Method 3: Direct DOM manipulation as fallback
                setTimeout(() => {
                  const chatbotButton = document.querySelector('[data-chatbot-toggle]') as HTMLElement
                  if (chatbotButton && !document.querySelector('[data-chatbot-open="true"]')) {
                    console.log('Fallback: Clicking chatbot button directly')
                    chatbotButton.click()
                  }
                }, 100)
              }}
              className="btn-terminal text-lg px-8 py-4 rounded-lg font-mono hover:animate-glow"
            >
              {'>'} Get Started
            </button>
          </motion.div>

          {/* Terminal Command Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-16 max-w-2xl mx-auto"
          >
            <div className="bg-dark-card border border-dark-border rounded-lg p-6 font-mono text-sm">
              <div className="flex items-center mb-3">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="ml-4 text-gray-400">~/streamline-ai</span>
              </div>
              <div className="text-left">
                <span className="text-electric-blue">$</span>{' '}
                <span className="text-gray-300">streamline --automate business</span>
                <br />
                <span className="text-neon-green">✓</span>{' '}
                <span className="text-gray-300">Analyzing workflows...</span>
                <br />
                <span className="text-neon-green">✓</span>{' '}
                <span className="text-gray-300">Building custom solution...</span>
                <br />
                <span className="text-neon-green">✓</span>{' '}
                <span className="text-gray-300">Your time: SAVED</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
          onClick={scrollToServices}
        >
          <ChevronDown className="w-8 h-8 text-electric-blue animate-bounce" />
        </motion.div>
      </div>
    </section>
  )
}

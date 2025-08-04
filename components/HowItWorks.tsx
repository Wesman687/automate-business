'use client'

import { motion } from 'framer-motion'
import { MessageCircle, Wrench, Clock } from 'lucide-react'

const steps = [
  {
    icon: MessageCircle,
    title: 'Chat with our AI assistant',
    description: 'Tell us about your business challenges and repetitive tasks. Our AI will ask the right questions to understand your needs.',
    color: 'text-electric-blue'
  },
  {
    icon: Wrench,
    title: 'We build your solution',
    description: 'Our expert developers create a custom automation tool tailored specifically for your workflow and requirements.',
    color: 'text-neon-green'
  },
  {
    icon: Clock,
    title: 'You get back your time',
    description: 'Deploy your new automated system and watch as hours of manual work become minutes of effortless execution.',
    color: 'text-purple-400'
  }
]

export default function HowItWorks() {
  return (
    <section className="py-20 bg-dark-card">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-white">How It</span>{' '}
            <span className="glow-text text-electric-blue">Works</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our streamlined process takes you from problem to solution in three simple steps.
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center mb-16 last:mb-0`}
            >
              {/* Step Content */}
              <div className="flex-1 text-center md:text-left mb-8 md:mb-0">
                <div className="flex items-center justify-center md:justify-start mb-4">
                  <div className={`w-16 h-16 ${step.color} bg-dark-bg border-2 border-current rounded-full flex items-center justify-center mr-4`}>
                    <step.icon className="w-8 h-8" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-mono text-gray-400 uppercase tracking-wide">
                      Step {index + 1}
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      {step.title}
                    </h3>
                  </div>
                </div>
                <p className="text-lg text-gray-300 leading-relaxed max-w-md mx-auto md:mx-0">
                  {step.description}
                </p>
              </div>

              {/* Step Visual */}
              <div className="flex-1 flex justify-center">
                <div className="relative">
                  {/* Main Circle */}
                  <div className={`w-40 h-40 rounded-full border-4 ${step.color} bg-dark-bg bg-opacity-50 flex items-center justify-center relative overflow-hidden`}>
                    <div className={`absolute inset-0 ${step.color} opacity-10 rounded-full animate-pulse`}></div>
                    <div className="text-6xl font-bold font-mono text-white relative z-10">
                      {index + 1}
                    </div>
                  </div>

                  {/* Connecting Line */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 left-full w-20 h-px bg-gradient-to-r from-electric-blue to-transparent transform -translate-y-1/2 ml-8">
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-electric-blue rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-electric-blue to-neon-green p-1 rounded-lg max-w-md mx-auto">
            <div className="bg-dark-bg rounded-lg p-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                Ready to start saving time?
              </h3>
              <button
                onClick={() => {
                  const event = new CustomEvent('openChatbot')
                  window.dispatchEvent(event)
                }}
                className="btn-terminal text-lg px-8 py-4 rounded-lg font-mono"
              >
                {'>'} Begin Step 1
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

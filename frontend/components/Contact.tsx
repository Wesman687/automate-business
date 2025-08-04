'use client'

import { motion } from 'framer-motion'
import { Mail, MessageSquare, Github, Linkedin } from 'lucide-react'
import { useState } from 'react'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Reset form
    setFormData({ name: '', email: '', message: '' })
    setIsSubmitting(false)
    alert('Thank you! We\'ll get back to you within 24 hours.')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <section className="py-20 bg-dark-bg">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-white">Let's</span>{' '}
            <span className="glow-text text-electric-blue">Talk</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Ready to automate your business? Get in touch and let's discuss how we can save you time and money.
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl font-bold text-white mb-8">Get Started Today</h3>
            
            <div className="space-y-6 mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-electric-blue bg-opacity-20 border border-electric-blue rounded-lg flex items-center justify-center">
                  <Mail className="w-6 h-6 text-electric-blue" />
                </div>
                <div>
                  <div className="text-white font-semibold">Email Us</div>
                  <div className="text-gray-300">sales@stream-lineai.com</div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-neon-green bg-opacity-20 border border-neon-green rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-neon-green" />
                </div>
                <div>
                  <div className="text-white font-semibold">Chat with AI</div>
                  <div className="text-gray-300">Click the chat icon to get started instantly</div>
                </div>
              </div>
            </div>

            {/* Quick Contact Options */}
            <div className="bg-dark-card border border-dark-border rounded-lg p-6">
              <h4 className="text-xl font-bold text-white mb-4">Quick Actions</h4>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    const event = new CustomEvent('openChatbot')
                    window.dispatchEvent(event)
                  }}
                  className="w-full btn-terminal text-left px-4 py-3 rounded-lg font-mono"
                >
                  {'>'} Start AI Consultation
                </button>
                <a
                  href="mailto:sales@stream-lineai.com?subject=Automation Project Inquiry"
                  className="block w-full bg-dark-bg border border-neon-green text-neon-green px-4 py-3 rounded-lg font-mono hover:bg-neon-green hover:text-black transition-all duration-300"
                >
                  {'>'} Send Direct Email
                </a>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-8 flex space-x-4">
              <a href="#" className="w-10 h-10 bg-dark-card border border-dark-border rounded-lg flex items-center justify-center hover:border-electric-blue transition-colors duration-300">
                <Github className="w-5 h-5 text-gray-400 hover:text-electric-blue transition-colors duration-300" />
              </a>
              <a href="#" className="w-10 h-10 bg-dark-card border border-dark-border rounded-lg flex items-center justify-center hover:border-electric-blue transition-colors duration-300">
                <Linkedin className="w-5 h-5 text-gray-400 hover:text-electric-blue transition-colors duration-300" />
              </a>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="bg-dark-card border border-dark-border rounded-lg p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Send us a message</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none transition-colors duration-300"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none transition-colors duration-300"
                    placeholder="john@company.com"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                    Tell us about your automation needs
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none transition-colors duration-300 resize-none"
                    placeholder="I need help automating my customer support process..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-terminal py-4 rounded-lg font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="loading-dots">{'>'} Sending</span>
                  ) : (
                    '> Send Message'
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-20 pt-8 border-t border-dark-border text-center"
        >
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">
              Streamline AI
            </h3>
            <p className="text-gray-400 font-mono text-sm">
              We automate. You scale.
            </p>
          </div>
          
          <div className="text-gray-400 text-sm">
            <p>&copy; 2024 Streamline AI. All rights reserved.</p>
            <p className="mt-2">
              Built with ❤️ using Next.js, TailwindCSS, and cutting-edge AI technology.
            </p>
          </div>
        </motion.footer>
      </div>
    </section>
  )
}

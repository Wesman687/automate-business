'use client'

import { motion } from 'framer-motion'
import { Github, ExternalLink } from 'lucide-react'

const technologies = [
  { name: 'Python', description: 'Backend development & AI integration' },
  { name: 'FastAPI', description: 'High-performance API development' },
  { name: 'GPT-4', description: 'Advanced language model integration' },
  { name: 'React Native', description: 'Cross-platform mobile development' },
  { name: 'Swift/Kotlin', description: 'Native iOS and Android development' },
  { name: 'React/Next.js', description: 'Modern frontend development' },
  { name: 'TailwindCSS', description: 'Responsive UI design' },
  { name: 'Whisper AI', description: 'Speech-to-text processing' }
]

export default function TechCredibility() {
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
            <span className="text-white">Powered By</span>{' '}
            <span className="glow-text text-electric-blue">Modern Tech</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            We use cutting-edge technologies and proven frameworks to build reliable, scalable solutions.
          </p>
        </motion.div>

        {/* Technology Stack */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {technologies.map((tech, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-dark-card border border-dark-border rounded-lg p-6 hover:border-electric-blue transition-all duration-300 group"
            >
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-electric-blue transition-colors duration-300">
                {tech.name}
              </h3>
              <p className="text-gray-400 text-sm">
                {tech.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Terminal Demo */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto mb-16"
        >
          <div className="bg-dark-card border border-dark-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-dark-bg border-b border-dark-border">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <span className="text-gray-400 text-sm font-mono">~/projects/streamline-solutions</span>
            </div>
            <div className="p-6 font-mono text-sm">
              <div className="space-y-2">
                <div>
                  <span className="text-electric-blue">$</span>{' '}
                  <span className="text-gray-300">pip install streamline-ai-toolkit</span>
                </div>
                <div className="text-neon-green">
                  ✓ Successfully installed streamline-ai-toolkit-2.0.0
                </div>
                <div className="mt-4">
                  <span className="text-electric-blue">$</span>{' '}
                  <span className="text-gray-300">streamline init --project="customer-support-bot"</span>
                </div>
                <div className="text-gray-400">
                  🤖 Initializing AI chatbot project...
                  <br />
                  📊 Setting up analytics dashboard...
                  <br />
                  ⚙️ Configuring automation workflows...
                </div>
                <div className="text-neon-green">
                  ✅ Project ready! Run 'streamline deploy' to go live.
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Credibility Badges */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center items-center gap-8"
        >
          <div className="flex items-center space-x-4 text-gray-400 hover:text-electric-blue transition-colors duration-300">
            <Github className="w-6 h-6" />
            <span className="font-mono">Open Source Contributions</span>
          </div>
          <div className="flex items-center space-x-4 text-gray-400 hover:text-electric-blue transition-colors duration-300">
            <ExternalLink className="w-6 h-6" />
            <span className="font-mono">Enterprise Grade Security</span>
          </div>
          <div className="flex items-center space-x-4 text-gray-400 hover:text-electric-blue transition-colors duration-300">
            <span className="text-neon-green text-xl">●</span>
            <span className="font-mono">99.9% Uptime SLA</span>
          </div>
        </motion.div>

        {/* Performance Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16"
        >
          {[
            { metric: '10x', label: 'Faster Processing', description: 'Compared to manual workflows' },
            { metric: '24/7', label: 'Automated Support', description: 'AI assistants never sleep' },
            { metric: '90%', label: 'Time Savings', description: 'Average reduction in manual tasks' }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-electric-blue glow-text mb-2">
                {stat.metric}
              </div>
              <div className="text-xl font-semibold text-white mb-1">
                {stat.label}
              </div>
              <div className="text-gray-400 text-sm">
                {stat.description}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

'use client'

import { motion } from 'framer-motion'
import { Bot, Cog, BarChart, Repeat } from 'lucide-react'

const services = [
  {
    icon: Bot,
    title: 'AI Chatbots for Customer Support',
    description: 'Intelligent chatbots that handle customer inquiries 24/7, reducing response times and improving satisfaction.',
    features: ['Natural language processing', 'Multi-platform integration', 'Analytics dashboard']
  },
  {
    icon: Cog,
    title: 'Workflow Automation & Scripting',
    description: 'Custom automation solutions that eliminate repetitive tasks and streamline your business processes.',
    features: ['Process optimization', 'Custom scripting', 'Task scheduling']
  },
  {
    icon: BarChart,
    title: 'Business Intelligence Dashboards',
    description: 'Real-time data visualization and analytics to make informed decisions faster.',
    features: ['Real-time reporting', 'Custom metrics', 'Data integration']
  },
  {
    icon: Repeat,
    title: 'Custom Integrations',
    description: 'Seamless connections between your tools, APIs, CRMs, and third-party services.',
    features: ['API development', 'CRM integration', 'Data synchronization']
  }
]

export default function Services() {
  return (
    <section id="services" className="py-20 bg-dark-bg">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-white">What We</span>{' '}
            <span className="glow-text text-electric-blue">Build</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            From AI-powered customer support to complex workflow automation, 
            we create solutions that work seamlessly with your existing systems.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="service-card group"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-dark-bg border border-electric-blue rounded-lg flex items-center justify-center group-hover:bg-electric-blue transition-colors duration-300">
                    <service.icon className="w-8 h-8 text-electric-blue group-hover:text-black transition-colors duration-300" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-white mb-3 group-hover:text-electric-blue transition-colors duration-300">
                    {service.title}
                  </h3>
                  <p className="text-gray-300 mb-4 leading-relaxed">
                    {service.description}
                  </p>
                  <ul className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-gray-400">
                        <span className="w-2 h-2 bg-neon-green rounded-full mr-3 flex-shrink-0"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-dark-card border border-dark-border rounded-lg p-8 max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-white mb-4">
              Ready to automate your business?
            </h3>
            <p className="text-gray-300 mb-6 text-lg">
              Let's discuss your specific needs and build a custom solution that saves you time and money.
            </p>
            <button
              onClick={() => {
                const event = new CustomEvent('openChatbot')
                window.dispatchEvent(event)
              }}
              className="btn-terminal text-lg px-8 py-4 rounded-lg font-mono"
            >
              {'>'} Start Your Project
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

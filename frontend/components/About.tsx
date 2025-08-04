'use client'

import { motion } from 'framer-motion'

export default function About() {
  return (
    <section className="py-20 bg-dark-card">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            <span className="text-white">About</span>{' '}
            <span className="glow-text text-electric-blue">Streamline</span>
          </h2>

          <div className="bg-dark-bg border border-dark-border rounded-lg p-8 md:p-12">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-8"
            >
              We're two experienced developers who got tired of watching people waste time on repetitive work. 
              So we built a company that fixes it.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left"
            >
              <div>
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <span className="w-3 h-3 bg-electric-blue rounded-full mr-3"></span>
                  Our Mission
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  To eliminate the tedious, repetitive tasks that drain your energy and steal your time. 
                  We believe every business deserves intelligent automation that actually works.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <span className="w-3 h-3 bg-neon-green rounded-full mr-3"></span>
                  Our Approach
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  We start with understanding your real problems, not selling you solutions. 
                  Every automation we build is custom-designed for your specific workflow and goals.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
              className="mt-12 pt-8 border-t border-dark-border"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-electric-blue mb-2">5+</div>
                  <div className="text-gray-300">Years Experience</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-neon-green mb-2">50+</div>
                  <div className="text-gray-300">Projects Delivered</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-400 mb-2">100%</div>
                  <div className="text-gray-300">Client Satisfaction</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              viewport={{ once: true }}
              className="mt-12"
            >
              <blockquote className="text-xl italic text-gray-300 border-l-4 border-electric-blue pl-6">
                "Automation isn't about replacing humans—it's about freeing them to do what they do best: 
                think, create, and solve meaningful problems."
              </blockquote>
              <div className="text-right mt-4">
                <span className="text-electric-blue font-mono">— The Streamline Team</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

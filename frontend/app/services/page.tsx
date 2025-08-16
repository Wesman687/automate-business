'use client';

import { motion } from 'framer-motion';
import { Bot, Globe, Smartphone, Cog, Zap, Code, Users, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Services - AI Automation & Development Solutions',
  description: 'Discover our comprehensive suite of AI-powered services including chatbot development, custom websites, mobile apps, and business process automation. Transform your business today.',
  keywords: [
    'AI services',
    'chatbot development',
    'website development', 
    'mobile app development',
    'business automation',
    'AI integration',
    'custom software development'
  ],
};

export default function ServicesPage() {
  const services = [
    {
      icon: Bot,
      title: "AI Chatbot Development",
      description: "Custom AI-powered chatbots that understand your business and provide 24/7 customer support with natural conversation capabilities.",
      features: ["Natural Language Processing", "Multi-platform Integration", "Custom Training", "Analytics Dashboard"],
      price: "Starting at $2,999"
    },
    {
      icon: Globe,
      title: "Custom Website Development",
      description: "Modern, responsive websites built with cutting-edge technology. From landing pages to complex web applications.",
      features: ["Responsive Design", "SEO Optimized", "Fast Loading", "Admin Dashboard"],
      price: "Starting at $1,999"
    },
    {
      icon: Smartphone,
      title: "Mobile App Development",
      description: "Native and cross-platform mobile applications that deliver exceptional user experiences on iOS and Android.",
      features: ["iOS & Android", "Cross-platform", "Push Notifications", "App Store Optimization"],
      price: "Starting at $4,999"
    },
    {
      icon: Cog,
      title: "Business Process Automation",
      description: "Streamline your workflows with intelligent automation that reduces manual work and increases efficiency.",
      features: ["Workflow Design", "Integration Setup", "Process Optimization", "Training & Support"],
      price: "Starting at $1,499"
    },
    {
      icon: Zap,
      title: "AI Integration Services",
      description: "Integrate AI capabilities into your existing systems and workflows to unlock new possibilities.",
      features: ["API Integration", "Custom AI Models", "Data Analysis", "Performance Monitoring"],
      price: "Starting at $3,499"
    },
    {
      icon: Code,
      title: "Custom Software Development",
      description: "Tailored software solutions designed specifically for your business needs and requirements.",
      features: ["Custom Solutions", "Scalable Architecture", "Security First", "Ongoing Maintenance"],
      price: "Starting at $5,999"
    }
  ];

  const whyChooseUs = [
    {
      icon: Users,
      title: "Expert Team",
      description: "Our team of experienced developers and AI specialists brings years of expertise to every project."
    },
    {
      icon: TrendingUp,
      title: "Proven Results",
      description: "We've helped hundreds of businesses streamline their operations and increase efficiency."
    },
    {
      icon: Zap,
      title: "Fast Delivery",
      description: "We deliver high-quality solutions quickly without compromising on quality or functionality."
    }
  ];

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center">
        <div className="max-w-6xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Our <span className="text-electric-blue">Services</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto mb-12"
          >
            Transform your business with our comprehensive suite of AI-powered solutions 
            and custom development services designed to streamline operations and drive growth.
          </motion.p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="bg-dark-card border border-gray-800 rounded-xl p-8 hover:border-electric-blue/50 transition-all duration-300 hover:shadow-lg hover:shadow-electric-blue/20"
              >
                <div className="flex items-center mb-6">
                  <service.icon className="w-8 h-8 text-electric-blue mr-3" />
                  <h3 className="text-xl font-bold">{service.title}</h3>
                </div>
                
                <p className="text-gray-300 mb-6">{service.description}</p>
                
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-gray-400">
                      <div className="w-2 h-2 bg-electric-blue rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <div className="border-t border-gray-700 pt-6">
                  <div className="text-electric-blue font-bold text-lg mb-4">{service.price}</div>
                  <Link href="/portal">
                    <button className="w-full bg-electric-blue hover:bg-electric-blue/90 text-black font-semibold py-3 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-electric-blue/30">
                      Get Started
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-4 bg-dark-card/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Why Choose <span className="text-electric-blue">StreamlineAI</span>?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We're not just developers – we're your partners in digital transformation.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whyChooseUs.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="text-center"
              >
                <div className="bg-electric-blue/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <item.icon className="w-8 h-8 text-electric-blue" />
                </div>
                <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                <p className="text-gray-300">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-gray-300 mb-12">
              Let's discuss how our services can help streamline your operations and accelerate your growth.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/portal">
                <button className="bg-electric-blue hover:bg-electric-blue/90 text-black text-lg px-8 py-4 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-electric-blue/30 hover:scale-105 flex items-center">
                  Schedule Consultation
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              </Link>
              
              <Link href="/contact">
                <button className="bg-transparent hover:bg-electric-blue/10 text-electric-blue text-lg px-8 py-4 rounded-lg font-semibold transition-all duration-200 border border-electric-blue hover:shadow-lg hover:shadow-electric-blue/20 hover:scale-105">
                  Contact Us
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

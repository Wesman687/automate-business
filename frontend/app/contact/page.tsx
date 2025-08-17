'use client';

import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, Calendar, Zap } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    service: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        service: '',
        message: ''
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactMethods = [
    {
      icon: MessageCircle,
      title: "Start a Chat",
      description: "Get instant answers from our AI assistant",
      action: "Open Chat",
      onClick: () => {
        // Open chatbot
        const event = new CustomEvent('openChatbot');
        window.dispatchEvent(event);
      }
    },
    {
      icon: Calendar,
      title: "Schedule a Meeting",
      description: "Book a consultation with our team",
      action: "Schedule Now",
      onClick: () => {
        window.location.href = '/portal';
      }
    },
    {
      icon: Mail,
      title: "Send an Email",
      description: "Reach out directly to our team",
      action: "sales@stream-lineai.com",
      onClick: () => {
        window.location.href = 'mailto:sales@stream-lineai.com';
      }
    }
  ];

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      value: "sales@stream-lineai.com",
      description: "We'll respond within 24 hours"
    },
    {
      icon: Phone,
      title: "Phone",
      value: "+1 (555) 123-4567",
      description: "Mon-Fri 9AM-6PM EST"
    },
    {
      icon: MapPin,
      title: "Location",
      value: "United States",
      description: "Serving clients worldwide"
    },
    {
      icon: Clock,
      title: "Response Time",
      value: "< 24 hours",
      description: "Typical response time"
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
            Get in <span className="text-electric-blue">Touch</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto mb-12"
          >
            Ready to transform your business with AI? Lets discuss your project and 
            discover how we can help streamline your operations.
          </motion.p>
        </div>
      </section>

      {/* Quick Contact Methods */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Choose Your Preferred Way to Connect</h2>
            <p className="text-gray-300">We are here to help you get started quickly</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {contactMethods.map((method, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="bg-dark-card border border-gray-800 rounded-xl p-8 text-center hover:border-electric-blue/50 transition-all duration-300 hover:shadow-lg hover:shadow-electric-blue/20 cursor-pointer"
                onClick={method.onClick}
              >
                <div className="bg-electric-blue/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <method.icon className="w-8 h-8 text-electric-blue" />
                </div>
                <h3 className="text-xl font-bold mb-3">{method.title}</h3>
                <p className="text-gray-300 mb-6">{method.description}</p>
                <button className="bg-electric-blue hover:bg-electric-blue/90 text-black font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-electric-blue/30">
                  {method.action}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form and Info */}
      <section className="py-16 px-4 bg-dark-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold mb-8">Send Us a Message</h2>
              
              {submitStatus === 'success' && (
                <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 mb-6">
                  <p className="text-green-400">Thank you! We will get back to you within 24 hours.</p>
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
                  <p className="text-red-400">Something went wrong. Please try again or contact us directly.</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-dark-card border border-gray-700 rounded-lg px-4 py-3 focus:border-electric-blue focus:outline-none transition-colors"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-dark-card border border-gray-700 rounded-lg px-4 py-3 focus:border-electric-blue focus:outline-none transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Company</label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full bg-dark-card border border-gray-700 rounded-lg px-4 py-3 focus:border-electric-blue focus:outline-none transition-colors"
                      placeholder="Your company name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-dark-card border border-gray-700 rounded-lg px-4 py-3 focus:border-electric-blue focus:outline-none transition-colors"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Service of Interest</label>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleInputChange}
                    className="w-full bg-dark-card border border-gray-700 rounded-lg px-4 py-3 focus:border-electric-blue focus:outline-none transition-colors"
                  >
                    <option value="">Select a service</option>
                    <option value="ai-chatbot">AI Chatbot Development</option>
                    <option value="website">Website Development</option>
                    <option value="mobile-app">Mobile App Development</option>
                    <option value="automation">Business Process Automation</option>
                    <option value="ai-integration">AI Integration Services</option>
                    <option value="custom-software">Custom Software Development</option>
                    <option value="consultation">General Consultation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full bg-dark-card border border-gray-700 rounded-lg px-4 py-3 focus:border-electric-blue focus:outline-none transition-colors resize-none"
                    placeholder="Tell us about your project and how we can help..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-electric-blue hover:bg-electric-blue/90 disabled:bg-gray-600 text-black font-semibold py-4 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-electric-blue/30 flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold mb-8">Contact Information</h2>
              
              <div className="space-y-8 mb-12">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start">
                    <div className="bg-electric-blue/10 w-12 h-12 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <info.icon className="w-6 h-6 text-electric-blue" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{info.title}</h3>
                      <p className="text-electric-blue font-medium mb-1">{info.value}</p>
                      <p className="text-gray-400 text-sm">{info.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-electric-blue/10 to-purple-500/10 border border-electric-blue/20 rounded-xl p-8">
                <div className="flex items-center mb-4">
                  <Zap className="w-6 h-6 text-electric-blue mr-3" />
                  <h3 className="text-xl font-bold">Quick Response Guarantee</h3>
                </div>
                <p className="text-gray-300 mb-6">
                  We pride ourselves on fast, professional responses. Expect to hear from us within 24 hours, 
                  often much sooner.
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email inquiries:</span>
                    <span className="text-electric-blue font-medium">&lt; 4 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Project proposals:</span>
                    <span className="text-electric-blue font-medium">&lt; 24 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Technical support:</span>
                    <span className="text-electric-blue font-medium">&lt; 2 hours</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <div className="bg-dark-card border border-gray-800 rounded-lg p-6">
                <h3 className="font-bold mb-3">How quickly can you start my project?</h3>
                <p className="text-gray-300">Most projects can begin within 1-2 weeks after our initial consultation and project scoping.</p>
              </div>
              <div className="bg-dark-card border border-gray-800 rounded-lg p-6">
                <h3 className="font-bold mb-3">Do you offer ongoing support?</h3>
                <p className="text-gray-300">Yes! We provide comprehensive support packages and maintenance plans for all our solutions.</p>
              </div>
              <div className="bg-dark-card border border-gray-800 rounded-lg p-6">
                <h3 className="font-bold mb-3">What is included in the consultation?</h3>
                <p className="text-gray-300">A free 30-minute discussion about your needs, challenges, and how our solutions can help your business.</p>
              </div>
              <div className="bg-dark-card border border-gray-800 rounded-lg p-6">
                <h3 className="font-bold mb-3">Can you work with our existing systems?</h3>
                <p className="text-gray-300">Absolutely! We specialize in integrating new solutions with your current technology stack.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

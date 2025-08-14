import { CheckCircle, Users, Zap, Award, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us - Streamline AI | Business Automation Experts',
  description: 'Learn about Streamline AI\'s mission to help businesses automate workflows and build custom solutions. 5+ years experience, 100+ projects completed.',
  alternates: {
    canonical: 'https://stream-lineai.com/about',
  },
  openGraph: {
    title: 'About Streamline AI - Business Automation Experts',
    description: 'Discover how Streamline AI helps businesses through intelligent automation, modern web solutions, and seamless customer experiences.',
    url: 'https://stream-lineai.com/about',
    type: 'website',
    siteName: 'Streamline AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Streamline AI - Business Automation Experts',
    description: 'Discover how Streamline AI helps businesses through intelligent automation, modern web solutions, and seamless customer experiences.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            About <span className="text-cyan-400">AutoMate Web</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            We're passionate about helping businesses streamline their operations through intelligent automation, 
            modern web solutions, and seamless customer experiences.
          </p>
          <div className="flex justify-center items-center space-x-8 text-gray-400">
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400">5+</div>
              <div className="text-sm">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400">100+</div>
              <div className="text-sm">Projects Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400">50+</div>
              <div className="text-sm">Happy Clients</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
              <p className="text-gray-300 mb-6">
                We believe every business deserves efficient, modern solutions that save time and increase productivity. 
                Our mission is to bridge the gap between complex technology and practical business needs.
              </p>
              <p className="text-gray-300 mb-8">
                From custom web applications to automated workflows, we create solutions that grow with your business 
                and adapt to your unique requirements.
              </p>
              <div className="space-y-4">
                <div className="flex items-center text-cyan-400">
                  <CheckCircle className="w-5 h-5 mr-3" />
                  <span>Customer-first approach</span>
                </div>
                <div className="flex items-center text-cyan-400">
                  <CheckCircle className="w-5 h-5 mr-3" />
                  <span>Cutting-edge technology</span>
                </div>
                <div className="flex items-center text-cyan-400">
                  <CheckCircle className="w-5 h-5 mr-3" />
                  <span>Measurable results</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Why Choose Us?</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Zap className="w-5 h-5 mr-3 mt-1 text-yellow-300" />
                    <span>Lightning-fast development and deployment</span>
                  </li>
                  <li className="flex items-start">
                    <Users className="w-5 h-5 mr-3 mt-1 text-green-300" />
                    <span>Dedicated support and maintenance</span>
                  </li>
                  <li className="flex items-start">
                    <Award className="w-5 h-5 mr-3 mt-1 text-purple-300" />
                    <span>Proven track record of success</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">What We Do</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="w-12 h-12 bg-cyan-600 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Web Automation</h3>
              <p className="text-gray-300">
                Streamline repetitive tasks, automate workflows, and integrate systems 
                to save time and reduce errors in your business processes.
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Custom Development</h3>
              <p className="text-gray-300">
                Tailored web applications, APIs, and software solutions designed 
                specifically for your business requirements and goals.
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Consulting & Support</h3>
              <p className="text-gray-300">
                Expert guidance on technology strategy, system optimization, 
                and ongoing support to ensure your solutions continue to deliver value.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 bg-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Get Started?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Let's discuss how we can help automate and improve your business processes. 
            Schedule a consultation to explore the possibilities.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <Mail className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold mb-1">Email</h3>
              <p className="text-gray-300">hello@automateweb.com</p>
            </div>
            <div className="text-center">
              <Phone className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold mb-1">Phone</h3>
              <p className="text-gray-300">(555) 123-4567</p>
            </div>
            <div className="text-center">
              <MapPin className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold mb-1">Location</h3>
              <p className="text-gray-300">Remote & On-Site</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact"
              className="bg-cyan-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-cyan-700 transition-colors"
            >
              Schedule Consultation
            </Link>
            <Link 
              href="/"
              className="bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              View Our Work
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

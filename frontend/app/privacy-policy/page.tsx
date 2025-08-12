'use client';

import React from 'react';
import { Shield, Mail, Database, Eye, Lock, Globe } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-cyan-900">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Shield className="h-16 w-16 text-cyan-400 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
            <p className="text-gray-300 text-lg">
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
            </p>
            <p className="text-gray-400 mt-2">
              Last updated: August 11, 2025
            </p>
          </div>

          {/* Content */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-8 space-y-8">
            
            {/* Information We Collect */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Database className="h-6 w-6 text-cyan-400" />
                <h2 className="text-2xl font-semibold text-white">Information We Collect</h2>
              </div>
              <div className="text-gray-300 space-y-4">
                <p>We collect information you provide directly to us, such as:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Contact Information:</strong> Name, email address, phone number, and company details</li>
                  <li><strong>Business Information:</strong> Project requirements, business needs, and service preferences</li>
                  <li><strong>Communication Data:</strong> Messages, inquiries, and correspondence with our team</li>
                  <li><strong>Technical Information:</strong> IP address, browser type, device information, and usage data</li>
                </ul>
              </div>
            </section>

            {/* How We Use Information */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Eye className="h-6 w-6 text-cyan-400" />
                <h2 className="text-2xl font-semibold text-white">How We Use Your Information</h2>
              </div>
              <div className="text-gray-300 space-y-4">
                <p>We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide and improve our business automation services</li>
                  <li>Respond to your inquiries and communicate with you</li>
                  <li>Send you relevant information about our services and updates</li>
                  <li>Analyze website usage and improve user experience</li>
                  <li>Comply with legal obligations and protect our rights</li>
                  <li>Process job requests and project management activities</li>
                </ul>
              </div>
            </section>

            {/* Information Sharing */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Globe className="h-6 w-6 text-cyan-400" />
                <h2 className="text-2xl font-semibold text-white">Information Sharing</h2>
              </div>
              <div className="text-gray-300 space-y-4">
                <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Service Providers:</strong> With trusted third-party vendors who assist in our operations</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                  <li><strong>With Your Consent:</strong> When you explicitly agree to share your information</li>
                </ul>
              </div>
            </section>

            {/* Lead Generation Platforms */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Mail className="h-6 w-6 text-cyan-400" />
                <h2 className="text-2xl font-semibold text-white">Lead Generation and Social Media</h2>
              </div>
              <div className="text-gray-300 space-y-4">
                <p>When you interact with our lead generation campaigns on platforms like LinkedIn or other social media:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>We collect information you voluntarily provide through forms and interactions</li>
                  <li>We may use tracking pixels and cookies to measure campaign effectiveness</li>
                  <li>Your information may be subject to the privacy policies of those platforms</li>
                  <li>We use this information solely for business communication and service delivery</li>
                  <li>You can opt out of marketing communications at any time</li>
                </ul>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Lock className="h-6 w-6 text-cyan-400" />
                <h2 className="text-2xl font-semibold text-white">Data Security</h2>
              </div>
              <div className="text-gray-300 space-y-4">
                <p>We implement appropriate security measures to protect your information:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments and updates</li>
                  <li>Access controls and authentication systems</li>
                  <li>Employee training on data protection practices</li>
                  <li>Incident response procedures for security breaches</li>
                </ul>
              </div>
            </section>

            {/* Your Rights */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-cyan-400" />
                <h2 className="text-2xl font-semibold text-white">Your Rights</h2>
              </div>
              <div className="text-gray-300 space-y-4">
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                  <li><strong>Correct:</strong> Update or correct inaccurate personal information</li>
                  <li><strong>Delete:</strong> Request deletion of your personal information</li>
                  <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                  <li><strong>Portability:</strong> Request your data in a structured, machine-readable format</li>
                  <li><strong>Object:</strong> Object to certain types of processing</li>
                </ul>
              </div>
            </section>

            {/* Cookies and Tracking */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Globe className="h-6 w-6 text-cyan-400" />
                <h2 className="text-2xl font-semibold text-white">Cookies and Tracking</h2>
              </div>
              <div className="text-gray-300 space-y-4">
                <p>We use cookies and similar technologies to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Remember your preferences and settings</li>
                  <li>Analyze website traffic and user behavior</li>
                  <li>Improve our services and user experience</li>
                  <li>Measure the effectiveness of our marketing campaigns</li>
                </ul>
                <p>You can control cookies through your browser settings, though this may affect website functionality.</p>
              </div>
            </section>

            {/* Data Retention */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Database className="h-6 w-6 text-cyan-400" />
                <h2 className="text-2xl font-semibold text-white">Data Retention</h2>
              </div>
              <div className="text-gray-300 space-y-4">
                <p>We retain your personal information for as long as necessary to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide our services and maintain our business relationship</li>
                  <li>Comply with legal obligations and resolve disputes</li>
                  <li>Enforce our agreements and protect our rights</li>
                </ul>
                <p>When we no longer need your information, we securely delete or anonymize it.</p>
              </div>
            </section>

            {/* International Transfers */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Globe className="h-6 w-6 text-cyan-400" />
                <h2 className="text-2xl font-semibold text-white">International Data Transfers</h2>
              </div>
              <div className="text-gray-300 space-y-4">
                <p>Your information may be transferred to and processed in countries other than your own. We ensure adequate protection through:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Appropriate safeguards and contractual arrangements</li>
                  <li>Compliance with applicable data protection laws</li>
                  <li>Use of standard contractual clauses where applicable</li>
                </ul>
              </div>
            </section>

            {/* Children's Privacy */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-cyan-400" />
                <h2 className="text-2xl font-semibold text-white">Children's Privacy</h2>
              </div>
              <div className="text-gray-300 space-y-4">
                <p>Our services are not directed to children under 13 years of age. We do not knowingly collect personal information from children under 13. If we learn that we have collected such information, we will delete it promptly.</p>
              </div>
            </section>

            {/* Changes to Policy */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Eye className="h-6 w-6 text-cyan-400" />
                <h2 className="text-2xl font-semibold text-white">Changes to This Policy</h2>
              </div>
              <div className="text-gray-300 space-y-4">
                <p>We may update this privacy policy from time to time. We will notify you of any changes by:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Posting the updated policy on this page</li>
                  <li>Updating the "Last updated" date</li>
                  <li>Sending you a notification for significant changes</li>
                </ul>
                <p>Your continued use of our services after any changes constitutes acceptance of the updated policy.</p>
              </div>
            </section>

            {/* Contact Information */}
            <section className="bg-gray-700/50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="h-6 w-6 text-cyan-400" />
                <h2 className="text-2xl font-semibold text-white">Contact Us</h2>
              </div>
              <div className="text-gray-300 space-y-2">
                <p>If you have any questions about this privacy policy or our data practices, please contact us:</p>
                <div className="space-y-1 mt-4">
                  <p><strong>Email:</strong> privacy@automate-business.com</p>
                </div>
                <p className="mt-4 text-sm text-gray-400">
                  We will respond to your inquiries within 30 days.
                </p>
              </div>
            </section>

            {/* Compliance Notice */}
            <section className="bg-cyan-900/20 border border-cyan-700/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-cyan-300 mb-2">Compliance Notice</h3>
              <p className="text-gray-300 text-sm">
                This privacy policy is designed to comply with applicable data protection laws including GDPR, CCPA, 
                and other relevant privacy regulations. We are committed to protecting your privacy and maintaining 
                transparency in our data practices.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

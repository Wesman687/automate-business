'use client';

import React from 'react';
import { FileText, Shield, AlertTriangle, Scale } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-cyan-900">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <FileText className="h-16 w-16 text-cyan-400 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
            <p className="text-gray-300 text-lg">
              Please read these terms carefully before using our services.
            </p>
            <p className="text-gray-400 mt-2">
              Last updated: August 11, 2025
            </p>
          </div>

          {/* Content */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-8 space-y-8">
            
            {/* Acceptance of Terms */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Scale className="h-6 w-6 text-cyan-400" />
                <h2 className="text-2xl font-semibold text-white">Acceptance of Terms</h2>
              </div>
              <div className="text-gray-300 space-y-4">
                <p>
                  By accessing and using our business automation services, you accept and agree to be bound by the terms 
                  and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </div>
            </section>

            {/* Services Description */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-6 w-6 text-cyan-400" />
                <h2 className="text-2xl font-semibold text-white">Services Description</h2>
              </div>
              <div className="text-gray-300 space-y-4">
                <p>We provide business automation services including but not limited to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Custom software development and automation solutions</li>
                  <li>Project management and consultation services</li>
                  <li>System integration and optimization</li>
                  <li>Technical support and maintenance</li>
                  <li>Lead generation and business development services</li>
                </ul>
              </div>
            </section>

            {/* User Responsibilities */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-cyan-400" />
                <h2 className="text-2xl font-semibold text-white">User Responsibilities</h2>
              </div>
              <div className="text-gray-300 space-y-4">
                <p>As a user of our services, you agree to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the confidentiality of your account credentials</li>
                  <li>Use our services in compliance with applicable laws</li>
                  <li>Not engage in any harmful or malicious activities</li>
                  <li>Respect intellectual property rights</li>
                  <li>Communicate professionally and respectfully</li>
                </ul>
              </div>
            </section>

            {/* Payment Terms */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Scale className="h-6 w-6 text-cyan-400" />
                <h2 className="text-2xl font-semibold text-white">Payment Terms</h2>
              </div>
              <div className="text-gray-300 space-y-4">
                <p>Payment terms for our services:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Payment is due according to the agreed timeline in your service contract</li>
                  <li>Late payments may incur additional fees</li>
                  <li>Refunds are handled on a case-by-case basis as outlined in individual contracts</li>
                  <li>All fees are exclusive of applicable taxes unless otherwise stated</li>
                  <li>We reserve the right to suspend services for non-payment</li>
                </ul>
              </div>
            </section>

            {/* Intellectual Property */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-6 w-6 text-cyan-400" />
                <h2 className="text-2xl font-semibold text-white">Intellectual Property</h2>
              </div>
              <div className="text-gray-300 space-y-4">
                <p>Intellectual property rights are governed as follows:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Custom developments created specifically for clients belong to the client upon full payment</li>
                  <li>General methodologies, frameworks, and pre-existing tools remain our property</li>
                  <li>Third-party software and tools are subject to their respective licenses</li>
                  <li>We retain the right to use general knowledge and experience gained from projects</li>
                  <li>Specific intellectual property terms will be detailed in individual contracts</li>
                </ul>
              </div>
            </section>

            {/* Confidentiality */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-cyan-400" />
                <h2 className="text-2xl font-semibold text-white">Confidentiality</h2>
              </div>
              <div className="text-gray-300 space-y-4">
                <p>We are committed to protecting your confidential information:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>All client information is treated as confidential</li>
                  <li>We will not disclose your business information to third parties without consent</li>
                  <li>Our team members are bound by confidentiality agreements</li>
                  <li>Data security measures are implemented to protect your information</li>
                  <li>Specific confidentiality terms may be outlined in separate NDAs</li>
                </ul>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-cyan-400" />
                <h2 className="text-2xl font-semibold text-white">Limitation of Liability</h2>
              </div>
              <div className="text-gray-300 space-y-4">
                <p>Our liability is limited as follows:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>We provide services on an "as is" basis</li>
                  <li>We are not liable for indirect, incidental, or consequential damages</li>
                  <li>Our total liability is limited to the amount paid for services</li>
                  <li>We are not responsible for third-party software or service failures</li>
                  <li>Force majeure events are beyond our control and responsibility</li>
                </ul>
              </div>
            </section>

            {/* Service Modifications */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-6 w-6 text-cyan-400" />
                <h2 className="text-2xl font-semibold text-white">Service Modifications</h2>
              </div>
              <div className="text-gray-300 space-y-4">
                <p>We reserve the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Modify or discontinue services with reasonable notice</li>
                  <li>Update our processes and methodologies</li>
                  <li>Change pricing for future engagements</li>
                  <li>Improve and enhance our service offerings</li>
                </ul>
              </div>
            </section>

            {/* Termination */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-cyan-400" />
                <h2 className="text-2xl font-semibold text-white">Termination</h2>
              </div>
              <div className="text-gray-300 space-y-4">
                <p>These terms regarding termination apply:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Either party may terminate services with appropriate notice as per contract</li>
                  <li>We may terminate services immediately for breach of terms</li>
                  <li>Upon termination, all outstanding payments become due</li>
                  <li>Data and materials will be handled according to our data retention policy</li>
                  <li>Termination does not affect accrued rights and obligations</li>
                </ul>
              </div>
            </section>

            {/* Governing Law */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Scale className="h-6 w-6 text-cyan-400" />
                <h2 className="text-2xl font-semibold text-white">Governing Law</h2>
              </div>
              <div className="text-gray-300 space-y-4">
                <p>
                  These terms shall be interpreted and governed in accordance with applicable international laws and conventions. 
                  Any disputes arising from these terms or our services shall be resolved through binding arbitration 
                  or in the appropriate jurisdiction where services are provided.
                </p>
              </div>
            </section>

            {/* Changes to Terms */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-6 w-6 text-cyan-400" />
                <h2 className="text-2xl font-semibold text-white">Changes to Terms</h2>
              </div>
              <div className="text-gray-300 space-y-4">
                <p>We may update these terms from time to time. Changes will be communicated through:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Updates to this page with revised date</li>
                  <li>Email notification for significant changes</li>
                  <li>Notice during your next service interaction</li>
                </ul>
                <p>Continued use of our services constitutes acceptance of updated terms.</p>
              </div>
            </section>

            {/* Contact Information */}
            <section className="bg-gray-700/50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-cyan-400" />
                <h2 className="text-2xl font-semibold text-white">Contact Information</h2>
              </div>
              <div className="text-gray-300 space-y-2">
                <p>For questions about these terms of service, please contact us:</p>
                <div className="space-y-1 mt-4">
                  <p><strong>Email:</strong> legal@automate-business.com</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

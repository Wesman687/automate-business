'use client';

import React, { useState } from 'react';
import { formatPhoneNumber, handlePhoneChange, isValidPhoneNumber } from '@/utils/phoneFormatter';

export default function PhoneFormatterTest() {
  const [phoneInput, setPhoneInput] = useState('');
  
  const testNumbers = [
    '3862274629',
    '386-227-4629',
    '(386) 227-4629',
    '13862274629',
    '1-386-227-4629',
    '386227',
    '38622746291234', // Too long
    'abc3862274629def' // With letters
  ];

  const handleInputChange = (value: string) => {
    const formatted = handlePhoneChange(value);
    setPhoneInput(formatted);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-gray-900 text-white rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Phone Number Formatter Test</h2>
      
      {/* Interactive Test */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Test Input (type any phone number):
        </label>
        <input
          type="tel"
          value={phoneInput}
          onChange={(e) => handleInputChange(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          placeholder="Type a phone number..."
          maxLength={14}
        />
        <div className="mt-2 text-sm">
          <div className="text-gray-400">Formatted: <span className="text-cyan-400">{phoneInput}</span></div>
          <div className="text-gray-400">
            Valid: <span className={isValidPhoneNumber(phoneInput) ? 'text-green-400' : 'text-red-400'}>
              {isValidPhoneNumber(phoneInput) ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>

      {/* Batch Tests */}
      <div>
        <h3 className="text-lg font-medium mb-3">Test Cases:</h3>
        <div className="space-y-2">
          {testNumbers.map((testNumber, index) => (
            <div key={index} className="flex justify-between items-center p-2 bg-gray-800 rounded">
              <span className="text-gray-300">Input: <code className="text-yellow-400">{testNumber}</code></span>
              <span className="text-cyan-400">Output: <code>{formatPhoneNumber(testNumber)}</code></span>
              <span className={`text-sm ${isValidPhoneNumber(formatPhoneNumber(testNumber)) ? 'text-green-400' : 'text-red-400'}`}>
                {isValidPhoneNumber(formatPhoneNumber(testNumber)) ? '✓' : '✗'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

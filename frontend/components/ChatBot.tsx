'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot, Mail } from 'lucide-react'

interface Message {
  id: string
  text: string
  isBot: boolean
  timestamp: Date
}

interface CustomerInfo {
  email: string
  name?: string
  business_type?: string
  pain_points?: string
  current_tools?: string
  budget?: string
}

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-domain.com' 
  : 'http://localhost:8001'

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentInput, setCurrentInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [showEmailCapture, setShowEmailCapture] = useState(false)
  const [customerEmail, setCustomerEmail] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Generate unique session ID
    if (!sessionId) {
      setSessionId(Date.now().toString() + Math.random().toString(36).substr(2, 9))
    }

    // Check backend connection
    checkBackendConnection()

    const handleOpenChatbot = () => {
      setIsOpen(true)
      if (messages.length === 0 && isConnected) {
        startConversation()
      }
    }

    window.addEventListener('openChatbot', handleOpenChatbot)
    return () => window.removeEventListener('openChatbot', handleOpenChatbot)
  }, [messages.length, isConnected, sessionId])

  const checkBackendConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`)
      if (response.ok) {
        setIsConnected(true)
      }
    } catch (error) {
      console.error('Backend connection failed:', error)
      setIsConnected(false)
    }
  }

  const startConversation = async () => {
    if (!isConnected) {
      addLocalMessage("Sorry, I'm currently offline. Please try again later or contact us directly at hello@streamlinetech.solutions", true)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: "start",
          session_id: sessionId,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        addLocalMessage(data.response, true)
      }
    } catch (error) {
      console.error('Error starting conversation:', error)
      addLocalMessage("Hi! I'm StreamlineBot. What does your business do?", true)
    }
  }

  const addLocalMessage = (text: string, isBot: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      text,
      isBot,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
  }

  const sendToAI = async (message: string) => {
    setIsTyping(true)
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          session_id: sessionId,
          user_email: customerEmail || undefined,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Check if AI is asking for email
        if (data.response.toLowerCase().includes('email') && !customerEmail) {
          setShowEmailCapture(true)
        }
        
        addLocalMessage(data.response, true)
      } else {
        throw new Error('Failed to get AI response')
      }
    } catch (error) {
      console.error('Error sending to AI:', error)
      addLocalMessage("I'm having trouble connecting right now. Please try again or contact us directly.", true)
    } finally {
      setIsTyping(false)
    }
  }

  const handleSendMessage = () => {
    if (!currentInput.trim()) return

    addLocalMessage(currentInput, false)
    const messageToSend = currentInput
    setCurrentInput('')

    if (isConnected) {
      sendToAI(messageToSend)
    } else {
      // Fallback for offline mode
      setTimeout(() => {
        addLocalMessage("Thanks for your message! Since I'm currently offline, please email us at hello@streamlinetech.solutions and we'll get back to you within 24 hours.", true)
      }, 1000)
    }
  }

  const handleEmailSubmit = async () => {
    if (!customerEmail.trim()) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/save-customer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: customerEmail,
          session_id: sessionId,
        }),
      })

      if (response.ok) {
        setShowEmailCapture(false)
        addLocalMessage(`Perfect! I've saved your email (${customerEmail}). Let me generate a custom proposal for you based on our conversation.`, true)
        
        // Generate proposal
        generateProposal()
      }
    } catch (error) {
      console.error('Error saving email:', error)
      setShowEmailCapture(false)
      addLocalMessage("Thanks for providing your email! Let me continue with your custom proposal.", true)
    }
  }

  const generateProposal = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/generate-proposal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        addLocalMessage(data.proposal, true)
        
        setTimeout(() => {
          addLocalMessage("Would you like to schedule a free consultation call to discuss this further? Just reply with 'yes' and I'll send you a calendar link!", true)
        }, 2000)
      }
    } catch (error) {
      console.error('Error generating proposal:', error)
      addLocalMessage("I'll email you a detailed proposal within the next hour. Thanks for your interest!", true)
    }
  }

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 bg-electric-blue text-black rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ${
          isOpen ? 'scale-0' : 'scale-100'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <MessageCircle className="w-8 h-8 mx-auto" />
        {/* Connection indicator */}
        <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-orange-500'
        } border-2 border-white`}></div>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 100 }}
            className="fixed bottom-6 right-6 z-50 w-96 h-[500px] bg-dark-card border border-electric-blue rounded-lg shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-dark-border">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-electric-blue text-black rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">StreamlineBot</h3>
                  <p className="text-xs text-gray-400">
                    {isConnected ? 'AI Automation Assistant' : 'Offline Mode'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-orange-500'
                }`}></div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg text-sm ${
                      message.isBot
                        ? 'bg-dark-bg text-white border border-dark-border'
                        : 'bg-electric-blue text-black'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.text}</div>
                    <div className={`text-xs mt-1 ${
                      message.isBot ? 'text-gray-400' : 'text-black opacity-70'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-dark-bg text-white border border-dark-border p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-electric-blue rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-electric-blue rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-electric-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Email Capture Modal */}
              {showEmailCapture && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-dark-bg border border-electric-blue rounded-lg p-4"
                >
                  <div className="flex items-center mb-3">
                    <Mail className="w-5 h-5 text-electric-blue mr-2" />
                    <h4 className="text-white font-semibold">Get Your Custom Proposal</h4>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">
                    Enter your email to receive a detailed automation proposal
                  </p>
                  <div className="flex space-x-2">
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="flex-1 bg-dark-card border border-dark-border rounded px-3 py-2 text-white text-sm focus:border-electric-blue focus:outline-none"
                      onKeyPress={(e) => e.key === 'Enter' && handleEmailSubmit()}
                    />
                    <button
                      onClick={handleEmailSubmit}
                      className="bg-electric-blue text-black px-4 py-2 rounded text-sm hover:bg-opacity-80 transition-colors duration-200"
                    >
                      Submit
                    </button>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-dark-border">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                  placeholder={isConnected ? "Type your message..." : "Backend offline - check connection"}
                  className="flex-1 bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white text-sm focus:border-electric-blue focus:outline-none disabled:opacity-50"
                  disabled={isTyping || showEmailCapture}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!currentInput.trim() || isTyping || showEmailCapture}
                  className="bg-electric-blue text-black p-2 rounded-lg hover:bg-opacity-80 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              {!isConnected && (
                <p className="text-xs text-orange-400 mt-2">
                  AI features unavailable - messages will be forwarded to our team
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

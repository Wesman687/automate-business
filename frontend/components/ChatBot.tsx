'use client'

import React, { useState, useRef, useEffect } from 'react'
import { MessageSquare, Send, Upload, X, User, Bot, Mail, Building, Phone, FileUp, MessageCircle, Paperclip } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import NotificationComponent from './NotificationComponent'
import { api } from '@/lib/https'

interface CustomerInfo {
  email: string
  name?: string
  company?: string
  phone?: string
}

interface Message {
  id: string
  text: string
  isBot: boolean
  timestamp: Date
  fileAttachment?: {
    name: string
    type: string
    url?: string
  }
}

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://server.stream-lineai.com' 
  : 'http://localhost:8005'

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentInput, setCurrentInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [showInfoCapture, setShowInfoCapture] = useState(false)
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    email: '',
    name: '',
    company: '',
    phone: ''
  })
  
  const [isConnected, setIsConnected] = useState(false)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null)
  const [showPreviewTyping, setShowPreviewTyping] = useState(false)
  const [showCustomerNotification, setShowCustomerNotification] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isExistingCustomer, setIsExistingCustomer] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'reset'>('login')
  const [customerData, setCustomerData] = useState<any>(null)
  const [authCredentials, setAuthCredentials] = useState({
    email: '',
    password: '',
    resetCode: ''
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle opening chatbot from external buttons
  const handleOpenChatbot = () => {
    setIsOpen(true)
    setShowPreviewTyping(false) // Hide preview when chat opens
    
    // If the user opens chat while preview typing is showing, continue the typing inside
    if (showPreviewTyping || messages.length === 0) {
      // Start with typing indicator, then show the messages
      setIsTyping(true)
      
      setTimeout(() => {
        addInstantMessage("I'd like to see your services", false)
      }, 1000)

      setTimeout(() => {
        addTypingMessage("Absolutely! At StreamlineAI, we specialize in providing the following services:", true)
      }, 2000)

      setTimeout(() => {
        addTypingMessage("🤖 **AI Chatbots & Virtual Assistants**: We create intelligent chatbots that can handle customer inquiries, support tasks, and other interactions, saving your team valuable time.", true)
      }, 5000)

      setTimeout(() => {
        addTypingMessage("⚡ **Process Automation**: Streamline repetitive tasks, data entry, and workflow management to boost efficiency.", true)
      }, 8000)

      setTimeout(() => {
        addTypingMessage("📊 **Custom Integrations**: Connect your existing tools and systems for seamless data flow and automation.", true)
      }, 11000)

      setTimeout(() => {
        addTypingMessage("How can we help you today? Please give us your email, and let us know how we can make automation work for you.", true)
        setShowInfoCapture(true)
      }, 14000)
    }
  }

  // Set up event listener for external buttons (only once)
  useEffect(() => {
    // Add the function to window object for direct access
    (window as any).openStreamlineAIChatbot = () => {
      console.log('Opening StreamlineAI Chatbot...')
      handleOpenChatbot()
    }
    
    window.addEventListener('openChatbot', handleOpenChatbot)
    return () => {
      window.removeEventListener('openChatbot', handleOpenChatbot)
      delete (window as any).openStreamlineAIChatbot
    }
  }, []) // Empty dependency array - only runs once

  useEffect(() => {
    // Generate unique session ID
    if (!sessionId) {
      setSessionId(Date.now().toString() + Math.random().toString(36).substr(2, 9))
    }

    // Check backend connection
    checkBackendConnection()

    // Show preview typing when page loads
    if (!isOpen) {
      const showTimer = setTimeout(() => {
        setShowPreviewTyping(true)
      }, 2000) // Show typing preview after 2 seconds

      const hideTimer = setTimeout(() => {
        setShowPreviewTyping(false)
      }, 8000) // Hide typing preview after 8 seconds total

      return () => {
        clearTimeout(showTimer)
        clearTimeout(hideTimer)
      }
    }
  }, [messages.length, isConnected, sessionId])

  const checkBackendConnection = async () => {
    try {
      // Add timeout and better error handling
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
      
              const response = await api.get(`/health`)
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        setIsConnected(true)
        console.log('Backend connected successfully')
      } else {
        console.warn('Backend responded but not healthy:', response.status)
        setIsConnected(false)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.warn('Backend connection failed (will use offline mode):', errorMessage)
      setIsConnected(false)
      
      // If it's an SSL error, we'll just work in offline mode
      if (errorMessage.includes('certificate') || errorMessage.includes('SSL') || errorMessage.includes('CERT_')) {
        console.log('SSL certificate issue detected - operating in offline mode')
      }
    }
  }

  const startConversation = async () => {
    // Always show the professional welcome sequence with typing effects
    setTimeout(() => {
      addInstantMessage("I'd like to see your services", false)
    }, 500)

    setTimeout(() => {
      addTypingMessage("Absolutely! At StreamlineAI, we specialize in providing the following services:", true)
    }, 1500)

    setTimeout(() => {
      addTypingMessage("🤖 **AI Chatbots & Virtual Assistants**: We create intelligent chatbots that can handle customer inquiries, support tasks, and other interactions, saving your team valuable time.", true)
    }, 4000)

    setTimeout(() => {
      addTypingMessage("⚡ **Process Automation**: Streamline repetitive tasks, data entry, and workflow management to boost efficiency.", true)
    }, 7000)

    setTimeout(() => {
      addTypingMessage("📊 **Custom Integrations**: Connect your existing tools and systems for seamless data flow and automation.", true)
    }, 10000)

    setTimeout(() => {
      addTypingMessage("How can we help you today? Please give us your email, and let us know how we can make automation work for you.", true)
      setShowInfoCapture(true)
    }, 13000)
  }

  const addInstantMessage = (text: string, isBot: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      text,
      isBot,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
  }

  const addTypingMessage = (text: string, isBot: boolean) => {
    setIsTyping(true)
    
    // Show typing indicator for a realistic amount of time
    setTimeout(() => {
      const newMessage: Message = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        text,
        isBot,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, newMessage])
      setIsTyping(false)
    }, 2000) // 2 seconds of typing time for realism
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
      const response = await api.post(`/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          session_id: sessionId,
          user_email: customerInfo.email || undefined,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Check if AI is asking for more info
        if (!customerInfo.email && data.response.toLowerCase().includes('email')) {
          setShowInfoCapture(true)
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
        addLocalMessage("Thanks for your message! Since I'm currently offline, please email us at sales@stream-lineai.com and we'll get back to you within 24 hours.", true)
      }, 1000)
    }
  }

  const handleInfoSubmit = async () => {
    if (!customerInfo.email.trim()) return

    try {
      // First, check if this customer already exists
      const checkResponse = await api.post(`/api/check-customer`, { email: customerInfo.email })

      if (checkResponse.ok) {
        const checkData = await checkResponse.json()
        
        if (checkData.exists && checkData.has_password) {
          // Customer exists and has password - require authentication
          setIsExistingCustomer(true)
          setAuthCredentials({ ...authCredentials, email: customerInfo.email })
          setShowAuthModal(true)
          return
        } else if (checkData.exists && !checkData.has_password) {
          // Customer exists but no password - let them set one
          setIsExistingCustomer(true)
          setAuthMode('register')
          setAuthCredentials({ ...authCredentials, email: customerInfo.email })
          setShowAuthModal(true)
          return
        }
      }

      // New customer - proceed normally but schedule appointment automatically
      const response = await api.post(`/api/save-customer`, {
          email: customerInfo.email,
          name: customerInfo.name,
          company: customerInfo.company,
          phone: customerInfo.phone,
          session_id: sessionId,
      })

      if (response.ok) {
        const customerData = await response.json()
        
        // Automatically schedule an appointment
        const appointmentResponse = await api.post(`/api/schedule-appointment`, {
            customer_id: customerData.customer_id,
            session_id: sessionId,
        })

        setShowInfoCapture(false)
        
        if (appointmentResponse.ok) {
          const appointmentData = await appointmentResponse.json()
          const appointmentDate = new Date(appointmentData.scheduled_date)
          const formattedDate = appointmentDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
          })
          
          addInstantMessage(`Perfect! I've scheduled a consultation call for you on ${formattedDate}. ${customerInfo.name ? `Nice to meet you, ${customerInfo.name}!` : ''} 

To make our call as helpful as possible, could you tell me more about:
• What specific challenges you're facing with your current processes?
• What automation solutions you're most interested in?
• Any particular goals you'd like to achieve?`, true)
        } else {
          addInstantMessage(`Perfect! I've saved your information. ${customerInfo.name ? `Nice to meet you, ${customerInfo.name}!` : ''} Let me create a custom automation strategy for ${customerInfo.company || 'your business'}.`, true)
        }
        
        // Follow up with services details
        setTimeout(() => {
          addTypingMessage(`Based on businesses like ${customerInfo.company || 'yours'}, here are the most impactful automation opportunities I see:`, true)
        }, 2000)

        setTimeout(() => {
          addTypingMessage("🎯 **Customer Service Automation**: AI-powered chatbots can handle 80% of customer inquiries 24/7, reducing response times and freeing up your team for complex issues.", true)
        }, 5000)

        setTimeout(() => {
          addTypingMessage("📈 **Lead Management**: Automated lead scoring, follow-up sequences, and CRM integration to never miss a potential customer.", true)
        }, 8000)

        setTimeout(() => {
          addTypingMessage("Would you like to schedule a free 15-minute automation assessment call? I can show you exactly how these solutions would work for your business!", true)
        }, 11000)
      }
    } catch (error) {
      console.error('Error saving customer info:', error)
      setShowInfoCapture(false)
      addInstantMessage("Thanks for providing your information! Let me continue with your custom proposal.", true)
    }
  }

  const generateProposal = async () => {
    try {
      const response = await api.post(`/api/generate-proposal`, {
        session_id: sessionId,
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingFile(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('session_id', sessionId)
      formData.append('customer_email', customerInfo.email)
      formData.append('description', `File uploaded during chat: ${file.name}`)

      const response = await api.post(`/api/upload-file`, formData)

      if (response.ok) {
        const data = await response.json()
        
        // Add file message to chat
        const fileMessage: Message = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          text: `📎 Uploaded: ${file.name}`,
          isBot: false,
          timestamp: new Date(),
          fileAttachment: {
            name: file.name,
            type: file.type,
            url: data.filename
          }
        }
        setMessages(prev => [...prev, fileMessage])
        
        addLocalMessage(`I've received your file "${file.name}". This will help me provide better automation recommendations for your business!`, true)
      } else {
        addLocalMessage("Sorry, there was an issue uploading your file. You can email it to us at sales@stream-lineai.com", true)
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      addLocalMessage("Sorry, there was an issue uploading your file. You can email it to us at sales@stream-lineai.com", true)
    } finally {
      setUploadingFile(false)
      // Reset file input
      event.target.value = ''
    }
  }

  const handleAuthentication = async () => {
    try {
      if (authMode === 'login') {
          const response = await api.post(`/api/customer-login`, {
            email: authCredentials.email,
            password: authCredentials.password,
        })

        if (response.ok) {
          const data = await response.json()
          setIsAuthenticated(true)
          setCustomerData(data.customer)
          setShowAuthModal(false)
          
          // Continue with authenticated customer flow
          proceedWithAuthenticatedCustomer(data.customer)
        } else {
          alert('Invalid credentials. Please try again.')
        }
      } else if (authMode === 'register') {
        const response = await api.post(`/api/customer-set-password`, {
            email: authCredentials.email,
            password: authCredentials.password,
        })

        if (response.ok) {
          setIsAuthenticated(true)
          setShowAuthModal(false)
          
          // Get customer data and proceed
          const customerResponse = await fetch(`${API_BASE_URL}/api/get-customer-by-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: authCredentials.email }),
          })
          
          if (customerResponse.ok) {
            const customerData = await customerResponse.json()
            setCustomerData(customerData)
            proceedWithAuthenticatedCustomer(customerData)
          }
        } else {
          alert('Error setting password. Please try again.')
        }
      } else if (authMode === 'reset') {
        if (!authCredentials.resetCode) {
          // Request reset code
          const response = await api.post(`/api/request-password-reset`, {
            email: authCredentials.email,
          })

          if (response.ok) {
            alert('Reset code sent to your email!')
          } else {
            alert('Error sending reset code.')
          }
        } else {
          // Confirm reset with code
          const response = await api.post(`/api/reset-password`, {
              email: authCredentials.email,
              reset_code: authCredentials.resetCode,
              new_password: authCredentials.password,
          })

          if (response.ok) {
            alert('Password reset successful!')
            setAuthMode('login')
          } else {
            alert('Invalid reset code or error resetting password.')
          }
        }
      }
    } catch (error) {
      console.error('Authentication error:', error)
      alert('Authentication error. Please try again.')
    }
  }

  const proceedWithAuthenticatedCustomer = async (customer: any) => {
    setShowInfoCapture(false)
    
    // Check if customer has previous projects/history
    const historyResponse = await api.get(`/api/customer-history/${customer.id}`)
    
    if (historyResponse.ok) {
      const historyData = await historyResponse.json()
      
      // Automatically schedule appointment
      const appointmentResponse = await api.post(`/api/schedule-appointment`, {
          customer_id: customer.id,
          session_id: sessionId,
      })

      let appointmentMessage = ""
      if (appointmentResponse.ok) {
        const appointmentData = await appointmentResponse.json()
        const appointmentDate = new Date(appointmentData.scheduled_date)
        const formattedDate = appointmentDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit'
        })
        appointmentMessage = `I've scheduled a consultation call for you on ${formattedDate}.`
      }

      if (historyData.projects && historyData.projects.length > 0) {
        addInstantMessage(`Welcome back, ${customer.name}! ${appointmentMessage}

I can see we've worked together before on:
${historyData.projects.map((p: any) => `• ${p.name} - ${p.status}`).join('\n')}

Since we have your project history, I can provide more targeted recommendations. What new automation challenges are you facing, or would you like to expand on our previous work?`, true)
      } else {
        addInstantMessage(`Welcome back, ${customer.name}! ${appointmentMessage}

I see this is our first project together. Based on your business profile, I'll create a custom automation strategy. What specific challenges are you looking to solve with automation?`, true)
      }
    }
  }

  return (
    <>
      {/* Preview Typing Notification */}
      {showPreviewTyping && !isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="fixed bottom-24 right-6 z-40 bg-dark-bg border border-electric-blue rounded-lg p-3 shadow-lg max-w-sm cursor-pointer"
          onClick={() => {
            setIsOpen(true)
            setShowPreviewTyping(false)
            
            // Continue the typing inside the chat
            setIsTyping(true)
            
            setTimeout(() => {
              setIsTyping(false)
              addInstantMessage("I'd like to see your services", false)
            }, 1500)

            setTimeout(() => {
              addTypingMessage("Absolutely! At StreamlineAI, we specialize in providing the following services:", true)
            }, 2500)

            setTimeout(() => {
              addTypingMessage("🤖 **AI Chatbots & Virtual Assistants**: We create intelligent chatbots that can handle customer inquiries, support tasks, and other interactions, saving your team valuable time.", true)
            }, 6500)

            setTimeout(() => {
              addTypingMessage("⚡ **Process Automation**: Streamline repetitive tasks, data entry, and workflow management to boost efficiency.", true)
            }, 10500)

            setTimeout(() => {
              addTypingMessage("📊 **Custom Integrations**: Connect your existing tools and systems for seamless data flow and automation.", true)
            }, 14500)

            setTimeout(() => {
              addTypingMessage("How can we help you today? Please give us your email, and let us know how we can make automation work for you.", true)
              setShowInfoCapture(true)
            }, 18500)
          }}
        >
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-electric-blue text-black rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="text-white text-sm font-medium mb-1">StreamlineAI</div>
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-electric-blue rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-electric-blue rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-electric-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-gray-300 text-xs">is typing a message about automation services...</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Floating Chat Button */}
      <motion.button
        onClick={() => {
          setIsOpen(true)
          setShowPreviewTyping(false)
          
          // If the user opens chat while preview typing is showing, continue the typing inside
          if (showPreviewTyping || messages.length === 0) {
            // Start with typing indicator, then show the messages
            setIsTyping(true)
            
            setTimeout(() => {
              setIsTyping(false)
              addInstantMessage("I'd like to see your services", false)
            }, 1500)

            setTimeout(() => {
              addTypingMessage("Absolutely! At StreamlineAI, we specialize in providing the following services:", true)
            }, 2500)

            setTimeout(() => {
              addTypingMessage("🤖 **AI Chatbots & Virtual Assistants**: We create intelligent chatbots that can handle customer inquiries, support tasks, and other interactions, saving your team valuable time.", true)
            }, 6500)

            setTimeout(() => {
              addTypingMessage("⚡ **Process Automation**: Streamline repetitive tasks, data entry, and workflow management to boost efficiency.", true)
            }, 10500)

            setTimeout(() => {
              addTypingMessage("📊 **Custom Integrations**: Connect your existing tools and systems for seamless data flow and automation.", true)
            }, 14500)

            setTimeout(() => {
              addTypingMessage("How can we help you today? Please give us your email, and let us know how we can make automation work for you.", true)
              setShowInfoCapture(true)
            }, 18500)
          }
        }}
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
            className="fixed bottom-6 right-6 z-50 w-[440px] h-[600px] bg-dark-card border border-electric-blue rounded-lg shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-dark-border">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-electric-blue text-black rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">StreamlineAI</h3>
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
                    {message.fileAttachment && (
                      <div className={`mt-2 p-2 rounded border ${
                        message.isBot ? 'border-gray-600' : 'border-black border-opacity-20'
                      }`}>
                        <div className="flex items-center space-x-2">
                          <Paperclip className="w-3 h-3" />
                          <span className="text-xs">{message.fileAttachment.name}</span>
                        </div>
                      </div>
                    )}
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
                  <div className="bg-dark-bg text-white border border-dark-border p-3 rounded-lg text-sm">
                    <div className="flex items-center space-x-1">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-gray-400 text-xs ml-2">StreamlineAI is typing...</span>
                    </div>
                  </div>
                </motion.div>
              )}

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

              {/* Customer Info Capture Modal */}
              {showInfoCapture && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-dark-bg border border-electric-blue rounded-lg p-4"
                >
                  <div className="flex items-center mb-3">
                    <Mail className="w-5 h-5 text-electric-blue mr-2" />
                    <h4 className="text-white font-semibold">Let's Get Started!</h4>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">
                    Please provide your contact information so we can customize our automation solutions for you:
                  </p>
                  <div className="space-y-3">
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                      placeholder="Email Address *"
                      className="w-full bg-dark-card border border-dark-border rounded px-3 py-2 text-white text-sm focus:border-electric-blue focus:outline-none"
                      required
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                        placeholder="Your Name"
                        className="bg-dark-card border border-dark-border rounded px-3 py-2 text-white text-sm focus:border-electric-blue focus:outline-none"
                      />
                      <input
                        type="text"
                        value={customerInfo.company}
                        onChange={(e) => setCustomerInfo({...customerInfo, company: e.target.value})}
                        placeholder="Company Name"
                        className="bg-dark-card border border-dark-border rounded px-3 py-2 text-white text-sm focus:border-electric-blue focus:outline-none"
                      />
                    </div>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                      placeholder="Phone Number"
                      className="w-full bg-dark-card border border-dark-border rounded px-3 py-2 text-white text-sm focus:border-electric-blue focus:outline-none"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={handleInfoSubmit}
                        disabled={!customerInfo.email.trim()}
                        className="flex-1 bg-electric-blue text-black px-4 py-2 rounded text-sm hover:bg-opacity-80 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Start Automation Chat
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Customer Authentication Modal */}
              {showAuthModal && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-dark-bg border border-electric-blue rounded-lg p-4"
                >
                  <div className="flex items-center mb-3">
                    <User className="w-5 h-5 text-electric-blue mr-2" />
                    <h4 className="text-white font-semibold">
                      {authMode === 'login' ? 'Welcome Back!' : 
                       authMode === 'register' ? 'Set Your Password' : 
                       'Reset Password'}
                    </h4>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-3">
                    {authMode === 'login' ? 'Please log in to access your customer data and project history.' :
                     authMode === 'register' ? 'Set a password to secure your account and access your data.' :
                     'Reset your password to regain access to your account.'}
                  </p>

                  <div className="space-y-3">
                    <input
                      type="email"
                      value={authCredentials.email}
                      onChange={(e) => setAuthCredentials({...authCredentials, email: e.target.value})}
                      placeholder="Email Address"
                      className="w-full bg-dark-card border border-dark-border rounded px-3 py-2 text-white text-sm focus:border-electric-blue focus:outline-none"
                      disabled={authMode !== 'reset'}
                    />
                    
                    {authMode === 'reset' && authCredentials.resetCode === '' ? null : (
                      <input
                        type="password"
                        value={authCredentials.password}
                        onChange={(e) => setAuthCredentials({...authCredentials, password: e.target.value})}
                        placeholder={authMode === 'login' ? 'Password' : 'New Password'}
                        className="w-full bg-dark-card border border-dark-border rounded px-3 py-2 text-white text-sm focus:border-electric-blue focus:outline-none"
                      />
                    )}

                    {authMode === 'reset' && (
                      <input
                        type="text"
                        value={authCredentials.resetCode}
                        onChange={(e) => setAuthCredentials({...authCredentials, resetCode: e.target.value})}
                        placeholder="6-digit Reset Code (from email)"
                        className="w-full bg-dark-card border border-dark-border rounded px-3 py-2 text-white text-sm focus:border-electric-blue focus:outline-none"
                      />
                    )}

                    <div className="flex space-x-2">
                      <button
                        onClick={handleAuthentication}
                        className="flex-1 bg-electric-blue text-black px-4 py-2 rounded text-sm hover:bg-opacity-80 transition-colors duration-200"
                      >
                        {authMode === 'login' ? 'Log In' :
                         authMode === 'register' ? 'Set Password' :
                         authCredentials.resetCode === '' ? 'Send Reset Code' : 'Reset Password'}
                      </button>
                      <button
                        onClick={() => setShowAuthModal(false)}
                        className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="flex justify-center space-x-4 text-xs">
                      {authMode === 'login' && (
                        <button
                          onClick={() => setAuthMode('reset')}
                          className="text-electric-blue hover:underline"
                        >
                          Forgot Password?
                        </button>
                      )}
                      {authMode === 'reset' && (
                        <button
                          onClick={() => setAuthMode('login')}
                          className="text-electric-blue hover:underline"
                        >
                          Back to Login
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-dark-border">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                  placeholder={isConnected ? "Type your message..." : "Backend offline - check connection"}
                  className="flex-1 bg-dark-bg border border-dark-border rounded-lg px-3 py-2 h-10 text-white text-sm focus:border-electric-blue focus:outline-none disabled:opacity-50"
                  disabled={isTyping || showInfoCapture}
                />
                
                {/* File Upload Button */}
                <div className="relative">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.xls,.xlsx,.csv"
                    disabled={uploadingFile || showInfoCapture}
                  />
                  <label
                    htmlFor="file-upload"
                    className={`bg-gray-600 text-white w-10 h-10 rounded-lg hover:bg-gray-500 transition-colors duration-200 cursor-pointer inline-flex items-center justify-center ${
                      uploadingFile || showInfoCapture ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {uploadingFile ? (
                      <Upload className="w-4 h-4 animate-spin" />
                    ) : (
                      <Paperclip className="w-4 h-4" />
                    )}
                  </label>
                </div>
                
                <button
                  onClick={handleSendMessage}
                  disabled={!currentInput.trim() || isTyping || showInfoCapture}
                  className="bg-electric-blue text-black w-10 h-10 rounded-lg hover:bg-opacity-80 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              {!isConnected && (
                <p className="text-xs text-orange-400 mt-2">
                  AI features unavailable - messages will be forwarded to our team
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                💡 Tip: Upload documents, spreadsheets, or images to help us understand your automation needs better
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

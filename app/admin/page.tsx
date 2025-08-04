'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, MessageSquare, TrendingUp, Download } from 'lucide-react'

interface Customer {
  email: string
  name?: string
  business_type?: string
  pain_points?: string
  current_tools?: string
  budget?: string
  session_id: string
  created_at: string
  status: string
}

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-domain.com' 
  : 'http://localhost:8000'

export default function AdminDashboard() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalLeads: 0,
    todayLeads: 0,
    completedSessions: 0,
    conversionRate: 0
  })

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/customers`)
      if (response.ok) {
        const data = await response.json()
        setCustomers(data.customers)
        calculateStats(data.customers)
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (customerData: Customer[]) => {
    const today = new Date().toDateString()
    const todayLeads = customerData.filter(c => 
      new Date(c.created_at).toDateString() === today
    ).length
    
    const completedSessions = customerData.filter(c => 
      c.status === 'completed' || c.status === 'proposal_sent'
    ).length

    setStats({
      totalLeads: customerData.length,
      todayLeads,
      completedSessions,
      conversionRate: customerData.length > 0 ? (completedSessions / customerData.length) * 100 : 0
    })
  }

  const exportToCSV = () => {
    const headers = ['Email', 'Name', 'Business Type', 'Pain Points', 'Current Tools', 'Budget', 'Status', 'Date']
    const csvData = [
      headers.join(','),
      ...customers.map(c => [
        c.email,
        c.name || '',
        c.business_type || '',
        c.pain_points || '',
        c.current_tools || '',
        c.budget || '',
        c.status,
        new Date(c.created_at).toLocaleDateString()
      ].map(field => `"${field}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvData], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `streamline_leads_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-electric-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Streamline Tech Solutions - Lead Management</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Leads', value: stats.totalLeads, icon: Users, color: 'electric-blue' },
            { label: 'Today\'s Leads', value: stats.todayLeads, icon: TrendingUp, color: 'neon-green' },
            { label: 'Completed Sessions', value: stats.completedSessions, icon: MessageSquare, color: 'purple-400' },
            { label: 'Conversion Rate', value: `${stats.conversionRate.toFixed(1)}%`, icon: TrendingUp, color: 'yellow-400' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-dark-card border border-dark-border rounded-lg p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                  <p className={`text-2xl font-bold text-${stat.color}`}>{stat.value}</p>
                </div>
                <stat.icon className={`w-8 h-8 text-${stat.color}`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6 flex flex-wrap gap-4"
        >
          <button
            onClick={exportToCSV}
            className="btn-terminal px-6 py-3 rounded-lg font-mono flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={fetchCustomers}
            className="bg-neon-green text-black px-6 py-3 rounded-lg font-mono hover:bg-opacity-80 transition-colors duration-300"
          >
            Refresh Data
          </button>
        </motion.div>

        {/* Customer Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-dark-card border border-dark-border rounded-lg overflow-hidden"
        >
          <div className="p-6 border-b border-dark-border">
            <h2 className="text-2xl font-bold text-white">Recent Leads</h2>
            <p className="text-gray-400">Customer interactions and lead data</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-border">
                  <th className="text-left p-4 text-gray-400 font-medium">Email</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Business Type</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Pain Points</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Budget</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer, index) => (
                  <motion.tr
                    key={customer.email}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.05 }}
                    className="border-b border-dark-border hover:bg-dark-bg transition-colors duration-200"
                  >
                    <td className="p-4">
                      <div>
                        <div className="text-white font-medium">{customer.email}</div>
                        {customer.name && (
                          <div className="text-gray-400 text-sm">{customer.name}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-gray-300">
                      {customer.business_type || 'Not specified'}
                    </td>
                    <td className="p-4 text-gray-300 max-w-xs">
                      <div className="truncate">
                        {customer.pain_points || 'Not specified'}
                      </div>
                    </td>
                    <td className="p-4 text-gray-300">
                      {customer.budget || 'Not specified'}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        customer.status === 'completed' ? 'bg-green-500 bg-opacity-20 text-green-400' :
                        customer.status === 'proposal_sent' ? 'bg-blue-500 bg-opacity-20 text-blue-400' :
                        'bg-yellow-500 bg-opacity-20 text-yellow-400'
                      }`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400 text-sm">
                      {new Date(customer.created_at).toLocaleDateString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {customers.length === 0 && (
              <div className="p-8 text-center text-gray-400">
                No customer data available yet. Start promoting your chatbot to generate leads!
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

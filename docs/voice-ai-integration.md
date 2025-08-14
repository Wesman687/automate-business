# Voice AI Agent Integration Guide

## 🎯 Complete API Integration for Voice Agents

This guide provides everything needed to integrate appointment scheduling with voice AI agents, chatbots, and automated systems.

### **Base Configuration**
```javascript
const API_BASE_URL = 'https://server.stream-lineai.com';
const API_TOKEN = 'your_api_token_here'; // Get from admin dashboard

const headers = {
  'Authorization': `Bearer ${API_TOKEN}`,
  'Content-Type': 'application/json'
};
```

---

## 📋 Customer Management APIs

### **1. Create New Customer**
```javascript
const createCustomer = async (customerData) => {
  const response = await fetch(`${API_BASE_URL}/api/customers`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: customerData.name,
      email: customerData.email,
      phone: customerData.phone || null,
      business_site: customerData.website || null,
      business_type: customerData.businessType || null,
      city: customerData.city || null,
      notes: customerData.automationGoals || null,
      status: "lead"
    })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create customer: ${response.status}`);
  }
  
  return await response.json();
};
```

### **2. Find Existing Customer**
```javascript
const findCustomer = async (email) => {
  const response = await fetch(`${API_BASE_URL}/api/customers?email=${encodeURIComponent(email)}`, {
    method: 'GET',
    headers
  });
  
  if (!response.ok) {
    throw new Error(`Failed to find customer: ${response.status}`);
  }
  
  const customers = await response.json();
  return customers.find(c => c.email.toLowerCase() === email.toLowerCase());
};
```

---

## 📅 Appointment Scheduling APIs

### **3. Check Available Time Slots**
```javascript
const getAvailableSlots = async (date) => {
  const response = await fetch(`${API_BASE_URL}/api/appointments/available-slots?date=${date}`, {
    method: 'GET',
    headers
  });
  
  if (!response.ok) {
    throw new Error(`Failed to get available slots: ${response.status}`);
  }
  
  return await response.json();
  // Returns: { date: "2025-08-15", available_slots: ["09:00", "09:30", "10:00", ...], booked_slots: ["14:00", "15:30"] }
};
```

### **4. Create Appointment**
```javascript
const createAppointment = async (appointmentData) => {
  const response = await fetch(`${API_BASE_URL}/api/appointments`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      customer_id: appointmentData.customerId,
      title: appointmentData.title || `Consultation - ${appointmentData.customerName}`,
      description: appointmentData.description || "Business automation consultation",
      appointment_date: appointmentData.date, // "2025-08-15"
      appointment_time: appointmentData.time, // "14:00:00"
      duration_minutes: appointmentData.duration || 60,
      meeting_type: appointmentData.meetingType || 'video_call', // video_call, phone_call, in_person
      status: 'scheduled',
      notes: appointmentData.notes || null
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to create appointment: ${response.status}`);
  }
  
  return await response.json();
};
```

### **5. Update Appointment**
```javascript
const updateAppointment = async (appointmentId, updateData) => {
  const response = await fetch(`${API_BASE_URL}/api/appointments/${appointmentId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(updateData)
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update appointment: ${response.status}`);
  }
  
  return await response.json();
};
```

### **6. Cancel/Delete Appointment**
```javascript
const cancelAppointment = async (appointmentId) => {
  const response = await fetch(`${API_BASE_URL}/api/appointments/${appointmentId}`, {
    method: 'DELETE',
    headers
  });
  
  if (!response.ok) {
    throw new Error(`Failed to cancel appointment: ${response.status}`);
  }
  
  return await response.json();
};
```

### **7. Get Customer's Appointments**
```javascript
const getCustomerAppointments = async (customerId) => {
  const response = await fetch(`${API_BASE_URL}/api/appointments?customer_id=${customerId}`, {
    method: 'GET',
    headers
  });
  
  if (!response.ok) {
    throw new Error(`Failed to get appointments: ${response.status}`);
  }
  
  return await response.json();
};
```

---

## 🤖 Complete Voice AI Workflow

### **Voice AI Integration Class**
```javascript
class VoiceAppointmentScheduler {
  constructor(apiToken) {
    this.apiToken = apiToken;
    this.headers = {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json'
    };
  }

  async scheduleAppointment(voiceData) {
    try {
      // 1. Find or create customer
      let customer = await this.findCustomerByEmail(voiceData.email);
      
      if (!customer) {
        customer = await this.createCustomer({
          name: voiceData.customerName,
          email: voiceData.email,
          phone: voiceData.phone,
          website: voiceData.website,
          businessType: voiceData.businessType,
          city: voiceData.city,
          automationGoals: voiceData.goals
        });
      }

      // 2. Check availability for preferred date
      const availability = await this.getAvailableSlots(voiceData.preferredDate);
      
      if (availability.available_slots.length === 0) {
        return {
          success: false,
          message: `Sorry, no availability on ${voiceData.preferredDate}. Would you like to try a different date?`,
          availableDates: await this.getSuggestedDates()
        };
      }

      // 3. Find best time slot
      const bestSlot = this.findBestTimeSlot(availability.available_slots, voiceData.timePreference);
      
      // 4. Create appointment
      const appointment = await this.createAppointment({
        customerId: customer.id,
        customerName: customer.name,
        title: `Automation Consultation - ${customer.name}`,
        description: `Initial consultation to discuss: ${voiceData.goals}`,
        date: voiceData.preferredDate,
        time: bestSlot,
        duration: voiceData.duration || 60,
        meetingType: voiceData.meetingType || 'video_call',
        notes: voiceData.additionalNotes
      });

      return {
        success: true,
        customer,
        appointment,
        message: `Perfect! I've scheduled your consultation for ${this.formatDate(appointment.appointment_date)} at ${this.formatTime(appointment.appointment_time)}. You'll receive a confirmation email shortly at ${customer.email}.`
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: "I apologize, but I encountered an issue scheduling your appointment. Let me transfer you to a human assistant who can help you right away."
      };
    }
  }

  findBestTimeSlot(availableSlots, preference) {
    // Morning: 9-12, Afternoon: 12-17, Evening: 17-18
    if (preference === 'morning') {
      return availableSlots.find(slot => {
        const hour = parseInt(slot.split(':')[0]);
        return hour >= 9 && hour < 12;
      }) || availableSlots[0];
    }
    
    if (preference === 'afternoon') {
      return availableSlots.find(slot => {
        const hour = parseInt(slot.split(':')[0]);
        return hour >= 12 && hour < 17;
      }) || availableSlots[0];
    }
    
    return availableSlots[0]; // Default to first available
  }

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatTime(timeString) {
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
}
```

---

## 📞 Voice AI Script Examples

### **Natural Language Processing**
```javascript
// Example voice input processing
const processVoiceInput = (transcript) => {
  const extractedData = {
    customerName: extractName(transcript),
    email: extractEmail(transcript),
    phone: extractPhone(transcript),
    preferredDate: extractDate(transcript),
    timePreference: extractTimePreference(transcript), // morning, afternoon, evening
    meetingType: extractMeetingType(transcript), // video, phone, in-person
    goals: extractGoals(transcript),
    duration: extractDuration(transcript) || 60
  };

  return extractedData;
};

// Voice response templates
const voiceResponses = {
  greeting: "Hi! I'd be happy to help you schedule a consultation with our automation experts. Let me gather a few details.",
  
  collectName: "Could I get your full name please?",
  
  collectEmail: "And what's the best email address to reach you at?",
  
  collectPhone: "What's a good phone number for appointment reminders?",
  
  collectDate: "What day works best for you? I can check availability for this week or next week.",
  
  collectTime: "Do you prefer morning, afternoon, or early evening meetings?",
  
  collectGoals: "What type of automation are you most interested in discussing?",
  
  confirmation: (appointment) => 
    `Perfect! I've scheduled your consultation for ${appointment.date} at ${appointment.time}. ` +
    `You'll receive a confirmation email with all the details and a calendar invite. ` +
    `Is there anything else I can help you with today?`,
  
  error: "I apologize for the technical difficulty. Let me connect you with someone who can assist you right away.",
  
  noAvailability: (date) => 
    `I don't have any openings on ${date}. Would you like me to check the next few days for availability?`
};
```

---

## 🔗 Frontend Integration

### **React Hook for Appointments**
```javascript
import { useState, useEffect } from 'react';

export const useAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAppointments = async (filters = {}) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`/api/appointments?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      } else {
        setError('Failed to fetch appointments');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createAppointment = async (appointmentData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentData)
      });

      if (response.ok) {
        const newAppointment = await response.json();
        setAppointments(prev => [...prev, newAppointment]);
        return newAppointment;
      } else {
        throw new Error('Failed to create appointment');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    appointments,
    loading,
    error,
    fetchAppointments,
    createAppointment
  };
};
```

---

## 🎭 Testing & Debugging

### **API Testing Script**
```javascript
// Test the complete workflow
const testVoiceAppointmentFlow = async () => {
  const scheduler = new VoiceAppointmentScheduler('your_api_token');
  
  const testData = {
    customerName: "John Smith",
    email: "john.smith@example.com",
    phone: "555-1234",
    preferredDate: "2025-08-15",
    timePreference: "afternoon",
    goals: "Inventory management automation",
    meetingType: "video_call",
    duration: 60
  };

  try {
    const result = await scheduler.scheduleAppointment(testData);
    console.log('Scheduling Result:', result);
    
    if (result.success) {
      console.log('✅ Appointment scheduled successfully!');
      console.log('📧 Confirmation message:', result.message);
    } else {
      console.log('❌ Scheduling failed:', result.message);
    }
  } catch (error) {
    console.error('🚨 Error during testing:', error);
  }
};

// Run the test
testVoiceAppointmentFlow();
```

This complete integration guide provides everything needed for:
- ✅ Voice AI agents
- ✅ Chatbot integration  
- ✅ Automated scheduling systems
- ✅ Frontend appointment management
- ✅ Customer relationship management
- ✅ Real-time availability checking

The system is now fully integrated and ready for production use!

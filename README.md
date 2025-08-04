# Streamline Tech Solutions Website

A professional AI-powered website for automation consulting business with real OpenAI integration.

## 🚀 Features

- **Modern Frontend**: Next.js 14 with TypeScript, TailwindCSS, and animations
- **AI Chatbot**: Real OpenAI GPT-4 integration for lead qualification
- **FastAPI Backend**: Python backend with customer data management
- **Professional Design**: Responsive design with particle animations
- **Lead Management**: Automatic customer info extraction and proposal generation

## 📁 Project Structure

```
streamline-website/
├── frontend/           # Next.js frontend application
│   ├── app/           # Next.js app directory
│   ├── components/    # React components
│   └── public/        # Static assets
├── backend/           # FastAPI backend
│   ├── venv/          # Python virtual environment
│   ├── main.py        # FastAPI application
│   └── customer_data/ # Customer data storage
└── package.json       # Root package.json with scripts
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ 
- Python 3.8+
- OpenAI API key

### Installation

1. **Clone and setup the project:**
   ```bash
   cd streamline-website
   npm run setup
   ```

2. **Configure OpenAI API Key:**
   ```bash
   # Edit backend/.env and add your OpenAI API key
   OPENAI_API_KEY=your_openai_api_key_here
   ```

### Development

**Start both frontend and backend:**
```bash
npm run dev:full
```

**Or start individually:**
```bash
# Frontend only (http://localhost:3000+)
npm run dev:frontend

# Backend only (http://localhost:8001)
npm run dev:backend
```

## 🔑 Environment Variables

Create `backend/.env` with:
```env
OPENAI_API_KEY=your_openai_api_key_here
ENVIRONMENT=development
```

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy to Vercel
```

### Backend (Railway/Render)
```bash
cd backend
# Requirements are in requirements.txt
# Set OPENAI_API_KEY environment variable
```

## 📊 API Endpoints

- `POST /api/chat` - AI chat interaction
- `POST /api/save-customer` - Save customer information  
- `POST /api/generate-proposal` - Generate custom proposals
- `GET /api/customers` - Get all customers (admin)
- `GET /health` - Health check

## 🤖 AI Features

- **Lead Qualification**: Automatically extracts customer information
- **Smart Responses**: GPT-4 powered conversational AI
- **Custom Proposals**: Generates tailored automation proposals
- **Email Capture**: Integrated email collection system

## 🏗️ Tech Stack

**Frontend:**
- Next.js 14
- TypeScript
- TailwindCSS
- Framer Motion
- TSParticles

**Backend:**
- FastAPI
- OpenAI GPT-4 API
- Pydantic
- Uvicorn

## 📈 Business Features

- Professional landing page with all key sections
- AI chatbot for automated lead qualification
- Customer data management and storage
- Automated proposal generation
- Contact form and email capture
- Responsive design for all devices

---

Built with ❤️ for business automation success!

A professional website with intelligent AI chatbot for Streamline Tech Solutions - specializing in AI automation and custom software development.

## 🌟 Features

### Frontend
- **Modern Design**: Dark theme with neon accents and smooth animations
- **AI Chatbot**: Real AI-powered consultation bot with OpenAI integration
- **Responsive**: Mobile-first design that works on all devices
- **Performance**: Built with Next.js 14 for optimal speed
- **SEO Optimized**: Meta tags and structured data for search engines

### Backend (FastAPI)
- **AI Integration**: Real OpenAI GPT-4 powered conversations
- **Customer Management**: Automatic lead capture and data storage
- **Session Tracking**: Complete conversation history logging
- **Proposal Generation**: AI-generated custom proposals
- **Admin Dashboard**: Lead management and analytics interface

## 🚀 Quick Setup

### Option 1: Automated Setup (Windows)
```bash
# Run the setup script
setup.bat
```

### Option 2: Manual Setup

1. **Install Node.js dependencies**:
```bash
npm install
```

2. **Install Python dependencies**:
```bash
cd backend
pip install -r requirements.txt
cd ..
```

3. **Configure OpenAI API**:
- Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
- Edit `backend/.env` and replace `your_openai_api_key_here` with your actual key:
```env
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

## 🏃‍♂️ Running the Application

### Development Mode

**Frontend only** (without AI features):
```bash
npm run dev
```

**Backend only**:
```bash
npm run backend:dev
```

**Full application** (frontend + backend with AI):
```bash
npm run dev:full
```

Open [http://localhost:3000](http://localhost:3000) to view the website.
Backend API runs on [http://localhost:8000](http://localhost:8000).

## 📊 Admin Dashboard

Access the admin dashboard at [http://localhost:3000/admin](http://localhost:3000/admin) to:
- View all customer leads
- Monitor chatbot conversations
- Export lead data to CSV
- Track conversion rates

## 🤖 AI Chatbot Features

The AI chatbot automatically:
1. **Qualifies leads** by asking about business needs
2. **Captures email addresses** for follow-up
3. **Generates custom proposals** based on conversation
4. **Logs all interactions** for review
5. **Creates customer files** with complete data

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14 with TypeScript
- **Styling**: TailwindCSS with custom animations
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Particles**: TSParticles for background effects

### Backend
- **Framework**: FastAPI (Python)
- **AI**: OpenAI GPT-4 integration
- **Data Storage**: JSON files (easily upgradeable to database)
- **Email Validation**: Pydantic with email validation

## 📁 Project Structure

```
streamline-website/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin dashboard
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Homepage
├── components/            # React components
│   ├── Hero.tsx          # Hero section
│   ├── Services.tsx      # Services showcase
│   ├── ChatBot.tsx       # AI chatbot (updated)
│   └── ...               # Other components
├── backend/              # FastAPI backend
│   ├── main.py          # Main backend application
│   ├── requirements.txt # Python dependencies
│   └── .env            # Environment variables
└── customer_data/       # Generated customer data
    ├── sessions/        # Chat sessions
    └── customers/       # Customer profiles
```

## 🔧 Configuration

### Environment Variables

**Backend (.env)**:
```env
OPENAI_API_KEY=your_openai_api_key_here
ENVIRONMENT=development
```

**Frontend (automatic)**:
- Development: Connects to localhost:8000
- Production: Update API_BASE_URL in ChatBot.tsx

## 📈 Lead Management

Customer data is automatically saved to:
- `customer_data/customers/` - Individual customer profiles
- `customer_data/sessions/` - Complete conversation logs

Each customer interaction includes:
- Email address
- Business type and pain points
- Current tools and budget
- Complete conversation history
- AI-generated proposals

## 🚀 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Connect repository to Vercel
3. Deploy automatically

### Backend Options
1. **Railway/Render**: Deploy FastAPI directly
2. **DigitalOcean**: Deploy on VPS
3. **AWS/GCP**: Cloud deployment

Don't forget to:
- Update API_BASE_URL in production
- Set environment variables on hosting platform
- Configure CORS for your domain

## 💡 Customization

- **Colors & Theme**: Edit `tailwind.config.js`
- **AI Prompts**: Modify SYSTEM_PROMPT in `backend/main.py`
- **Company Info**: Update content in component files
- **Analytics**: Add Google Analytics/tracking

## 📞 Support

For questions about this codebase:
- Check the admin dashboard for lead data
- Review customer_data/ folder for conversation logs
- Monitor backend logs for API issues

## 🔒 Security Notes

- Keep your OpenAI API key secure
- Customer data is stored locally (consider encryption for production)
- Add authentication for admin dashboard in production
- Set up proper CORS origins for production

---

**Built with ❤️ for Streamline Tech Solutions**
*"We automate. You scale."*

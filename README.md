# Streamline Tech Solutions - AI-Powered Business Website

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

# EcoDrawer 🌱 - WhatsApp E-Waste Awareness Bot

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-brightgreen.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A complete, production-ready WhatsApp chatbot that educates users about electronic waste (e-waste) management through personalized, interactive conversations.

Built for the **TECH-CYCLE Hackathon** to make e-waste awareness accessible to everyone through WhatsApp.

---

## 🎯 Features

### 🧠 Personalized Learning
- **Adaptive Content**: Lessons and quizzes adjust based on user's awareness level
- **Multi-language Support**: English, Tamil (தமிழ்), Hindi (हिन्दी), Telugu (తెలుగు)
- **Weak Topic Tracking**: Identifies knowledge gaps and recommends targeted lessons

### 📚 Educational Content
- 7 comprehensive lessons covering e-waste basics, environmental impact, battery safety, mobile recycling, repair/reuse, data privacy, and accessories
- Pre and post-quiz system to measure awareness improvement
- Interactive explanations after every answer

### 🎮 Gamification
- Points system for completing activities
- Badges (E-Waste Beginner, Battery Guardian, Recycling Champion, Eco Expert, etc.)
- Learning streak tracking
- Progress dashboard

### 📸 Image Recognition
- Identify electronic items from photos using Groq vision AI
- Get disposal and recycling guidance for identified items

### 🔍 Recycler Finder
- Find verified e-waste recycling centers by city or PIN code
- View contact details, operating hours, accepted items, and services
- Google Maps integration

### 🎯 Interactive Games
- True/False awareness game
- Category sorting game
- Quiz challenges with adaptive difficulty

### 💬 AI Assistant
- Ask questions about e-waste management
- Get personalized responses in your language
- Context-aware conversations using Groq LLM

---

## 🏗️ Architecture

### Technology Stack

**Backend**
- Node.js + Express.js
- MongoDB with Mongoose ODM
- WhatsApp Cloud API (Meta Graph API v21.0)

**AI/ML**
- Groq API for LLM (conversation, lessons, translation)
- Groq Vision for image identification

**Key Components**
- Conversation state management
- Quiz validation engine
- Lesson recommendation system
- Points and badge system
- Multi-language support

---

## 📁 Project Structure

```
ECOBOT/
├── src/
│   ├── config/
│   │   └── database.js              # MongoDB connection
│   ├── controllers/
│   │   ├── verifyController.js      # Webhook verification
│   │   ├── messageController.js     # Message routing
│   │   └── ecoDrawerController.js   # Main bot workflow
│   ├── models/
│   │   ├── User.js                  # User profile & progress
│   │   ├── QuizAttempt.js           # Quiz history
│   │   ├── LessonProgress.js        # Learning tracking
│   │   └── Recycler.js              # Recycling centers
│   ├── services/
│   │   ├── whatsappService.js       # WhatsApp messaging
│   │   ├── groqService.js           # AI integration
│   │   ├── quizService.js           # Quiz logic
│   │   ├── lessonService.js         # Lesson management
│   │   ├── recyclerService.js       # Recycler search
│   │   └── gamificationService.js   # Points & badges
│   ├── data/
│   │   ├── quizQuestions.js         # 20+ quiz questions
│   │   ├── lessons.js               # 7 lesson modules
│   │   └── recyclerData.js          # Demo recycler data
│   ├── utils/
│   │   ├── stateManager.js          # Conversation states
│   │   └── messageFormatter.js      # Multi-language formatting
│   ├── routes/
│   │   └── webhook.js               # Webhook endpoints
│   └── index.js                     # App entry point
├── .env.example                     # Environment template
├── package.json                     # Dependencies
├── README.md                        # This file
└── SETUP_GUIDE.md                   # Detailed setup instructions
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js ≥ 18.x
- MongoDB ≥ 6.x (local or Atlas)
- Groq API account (https://console.groq.com)
- Meta Developer account (https://developers.facebook.com)
- ngrok (for local development)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd ECOBOT

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Start MongoDB (if local)
brew services start mongodb-community  # macOS
# or
sudo systemctl start mongod            # Linux

# Start the bot
npm run dev
```

### Get Your API Keys

1. **Groq API Key**: https://console.groq.com → API Keys → Create
2. **WhatsApp Credentials**: Meta Developer Portal → WhatsApp → API Setup
   - Phone Number ID
   - Access Token
   - Create a Verify Token (any secret string)

See **[SETUP_GUIDE.md](SETUP_GUIDE.md)** for complete step-by-step instructions.

---

## 📱 User Workflow

### 1. Welcome & Language Selection
User sends `Hi` → Bot offers language choice (English/Tamil/Hindi/Telugu)

### 2. Onboarding
- Age group
- Location (city/PIN)
- Number of unused devices
- Current disposal habits

### 3. Pre-Quiz (5 questions)
Tests baseline e-waste awareness to create personalized profile

### 4. Main Menu
```
1. 📚 Learn about e-waste
2. 🎯 Play a quiz
3. 📸 Identify item (send image)
4. 🔍 Find recycling center
5. 🎮 Play awareness game
6. 📊 View progress
7. 💬 Ask EcoDrawer
```

### 5. Personalized Learning
- Recommended lessons based on weak topics
- Short quiz after each lesson
- Points and badges awarded

### 6. Progress Tracking
- View total points and level
- See earned badges
- Check learning streak
- Compare pre vs post-quiz scores

---

## 🎓 Educational Content

### Lesson Topics
1. **What is E-Waste?** - Basics of electronic waste
2. **Environmental Impact** - Why improper disposal harms us
3. **Battery Safety** - Safe handling of lithium batteries
4. **Mobile Recycling** - How to recycle smartphones properly
5. **Repair, Reuse, Recycle** - The 3 R's hierarchy
6. **Data Privacy** - Protecting data before recycling
7. **Accessories Recycling** - Don't forget cables and chargers!

### Quiz Categories
- **Pre-Quiz**: Baseline awareness assessment
- **Post-Quiz**: Measure improvement
- **Adaptive Quiz**: Personalized based on weak topics
- **Lesson Quizzes**: Test understanding after each lesson
- **Games**: True/False challenges

---

## 🌍 Multi-Language Support

All content dynamically adapts to user's selected language:

- **English** - Default
- **Tamil (தமிழ்)** - Full translation
- **Hindi (हिन्दी)** - Full translation
- **Telugu (తెలుగు)** - Full translation

Translations powered by Groq LLM for natural, contextual language conversion.

---

## 🔧 Configuration

### Environment Variables

```env
# Server
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/ecodrawer

# WhatsApp
VERIFY_TOKEN=your_secret_token
WHATSAPP_TOKEN=your_whatsapp_access_token
PHONE_NUMBER_ID=your_phone_number_id

# Groq AI
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_VISION_MODEL=llama-3.2-90b-vision-preview
```

See `.env.example` for complete configuration options.

---

## 📊 Data Models

### User
- Profile (phone, language, location)
- Awareness level (beginner/intermediate/advanced)
- Quiz scores (pre/post)
- Weak topics
- Conversation state
- Points, badges, learning streak

### QuizAttempt
- Quiz type
- Questions and answers
- Score and completion time

### LessonProgress
- Lesson ID
- Completion status
- Quiz results

### Recycler
- Name, address, city, PIN code
- Accepted items and services
- Verification status
- Contact details

---

## 🛡️ Security & Best Practices

✅ **Environment Variables** - All secrets in `.env`, never committed  
✅ **Input Validation** - All user inputs validated before processing  
✅ **Error Handling** - Graceful degradation, no crashes  
✅ **Database Indexing** - Optimized queries for performance  
✅ **Rate Limiting Ready** - Structured for production rate limits  
✅ **Webhook Verification** - Validates Meta webhook signatures  
✅ **Data Privacy** - No unnecessary personal data collection  

---

## 🧪 Testing

### Local Testing

```bash
# Start the bot
npm run dev

# In another terminal, start ngrok
ngrok http 3000

# Configure webhook in Meta Developer Portal
# Send test messages from WhatsApp
```

### Test Commands

```
Hi               → Start conversation
1                → Select English
ready            → Start pre-quiz
A/B/C/D          → Answer quiz
menu             → Show main menu
1-7              → Menu choices
```

---

## 📈 Monitoring & Logs

The bot logs all important events:

```
[MESSAGE] From: 919876543210 | Type: text | ID: wamid.xxx
[MESSAGE] Text: "Hi"
[SEND] ✅ Message sent to 919876543210 | message_id: wamid.yyy
[GROQ] Generating response...
[QUIZ] User completed pre-quiz | Score: 3/5
```

Monitor these logs for:
- Message delivery status
- User progression through workflow
- API errors or rate limits
- Database operations

---

## 🚢 Production Deployment

### Recommendations

1. **Use MongoDB Atlas** for cloud database
2. **Deploy to cloud platform** (Railway, Render, Heroku, AWS, GCP)
3. **Use permanent WhatsApp token** (System User, not temporary)
4. **Replace demo recycler data** with verified real data
5. **Set up monitoring** (Sentry, LogRocket)
6. **Enable rate limiting** on webhook endpoint
7. **Set up backup** for user data
8. **Add analytics** tracking

### Environment Setup

```bash
# Set all env vars in hosting platform
heroku config:set MONGODB_URI=mongodb+srv://...
heroku config:set WHATSAPP_TOKEN=EAAxxxxx...
heroku config:set GROQ_API_KEY=gsk_xxxxx...
```

---

## 🤝 Contributing

Contributions welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Groq** for fast, powerful LLM inference
- **Meta** for WhatsApp Cloud API
- **MongoDB** for flexible data storage
- **TECH-CYCLE Hackathon** for the opportunity

---

## 📞 Support

For setup help, see **[SETUP_GUIDE.md](SETUP_GUIDE.md)**

For issues:
- Check error logs in terminal
- Review webhook configuration in Meta
- Verify all API keys are correct

---

**Built with ❤️ for a sustainable future** 🌱

*Making e-waste awareness accessible to everyone through WhatsApp*

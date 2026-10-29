# EcoDrawer Setup Guide

Complete step-by-step guide to set up and run the EcoDrawer WhatsApp bot locally.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Database Setup](#database-setup)
4. [API Keys Setup](#api-keys-setup)
5. [WhatsApp Configuration](#whatsapp-configuration)
6. [Running the Bot](#running-the-bot)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

| Software | Version | Download |
|----------|---------|----------|
| Node.js | ≥ 18.x | https://nodejs.org |
| npm | ≥ 9.x | Included with Node.js |
| MongoDB | ≥ 6.x | https://www.mongodb.com/try/download/community |
| ngrok | Latest | https://ngrok.com/download |

### Required Accounts

1. **Meta Developer Account** - https://developers.facebook.com
2. **Groq API Account** - https://console.groq.com
3. **MongoDB Atlas** (optional, for cloud database) - https://www.mongodb.com/cloud/atlas

---

## Installation

### 1. Clone the Repository

```bash
cd /path/to/your/projects
git clone <your-repo-url>
cd ECOBOT
```

### 2. Install Dependencies

```bash
npm install
```

This installs:
- Express (web server)
- Mongoose (MongoDB ODM)
- Groq SDK (AI interactions)
- Axios (HTTP client)
- dotenv (environment variables)

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Open `.env` in a text editor and fill in your credentials (see sections below).

---

## Database Setup

### Option A: Local MongoDB

1. **Install MongoDB** (if not already installed)
   - macOS: `brew install mongodb-community`
   - Ubuntu: `sudo apt-get install mongodb`
   - Windows: Download from https://www.mongodb.com/try/download/community

2. **Start MongoDB**
   ```bash
   # macOS/Linux
   brew services start mongodb-community
   # or
   sudo systemctl start mongod
   
   # Windows
   # MongoDB runs as a service automatically after installation
   ```

3. **Set MongoDB URI in `.env`**
   ```env
   MONGODB_URI=mongodb://localhost:27017/ecodrawer
   ```

### Option B: MongoDB Atlas (Cloud)

1. **Create a free cluster** at https://www.mongodb.com/cloud/atlas
2. **Create a database user** with read/write permissions
3. **Whitelist your IP address** (or allow from anywhere: 0.0.0.0/0)
4. **Get connection string** from "Connect" → "Connect your application"
5. **Set MongoDB URI in `.env`**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecodrawer?retryWrites=true&w=majority
   ```

---

## API Keys Setup

### 1. Groq API Key

1. Go to https://console.groq.com
2. Sign up or log in
3. Navigate to **API Keys**
4. Click **Create API Key**
5. Copy the key and add to `.env`:
   ```env
   GROQ_API_KEY=gsk_your_groq_api_key_here
   ```

### 2. Groq Model Selection

Set the model in `.env`:

```env
# Text model (for conversations, lessons)
GROQ_MODEL=llama-3.3-70b-versatile

# Vision model (for image identification - optional)
GROQ_VISION_MODEL=llama-3.2-90b-vision-preview
```

**Available Groq Models:**
- `llama-3.3-70b-versatile` - Best for conversations (Recommended)
- `llama-3.1-70b-versatile` - Alternative text model
- `mixtral-8x7b-32768` - Fast, good quality
- `llama-3.2-90b-vision-preview` - Vision model (if available)

**Note:** If vision model is not available in your account, leave `GROQ_VISION_MODEL` empty. Image identification will show a friendly message.

---

## WhatsApp Configuration

### 1. Create Meta Developer App

1. Go to https://developers.facebook.com
2. Click **My Apps** → **Create App**
3. Select **Business** as app type
4. Fill in app details and create
5. Add **WhatsApp** product to your app

### 2. Get WhatsApp Credentials

Navigate to **WhatsApp** → **API Setup** in your app dashboard:

1. **Phone Number ID**
   - Copy from "Phone Number ID" field
   - Add to `.env`:
     ```env
     PHONE_NUMBER_ID=123456789012345
     ```

2. **Access Token**
   - Click "Generate Token" (temporary) or create a System User (permanent)
   - Copy the token
   - Add to `.env`:
     ```env
     WHATSAPP_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
     ```

3. **Verify Token**
   - Create your own secret string (e.g., "ecodrawer_secure_token_123")
   - Add to `.env`:
     ```env
     VERIFY_TOKEN=ecodrawer_secure_token_123
     ```

### 3. Expose Local Server with ngrok

WhatsApp requires a public HTTPS URL. Use ngrok to create a tunnel:

```bash
# Install ngrok (if not installed)
npm install -g ngrok

# Start ngrok tunnel
ngrok http 3000
```

You'll see output like:
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:3000
```

**Copy the HTTPS URL** (e.g., `https://abc123.ngrok-free.app`)

### 4. Configure Webhook in Meta

1. Go to **WhatsApp** → **Configuration** in Meta Developer Portal
2. Click **Edit** next to "Webhook"
3. Enter:
   - **Callback URL:** `https://abc123.ngrok-free.app/webhook`
   - **Verify Token:** Same as your `VERIFY_TOKEN` in `.env`
4. Click **Verify and Save**
5. Subscribe to **messages** webhook field

**✅ If successful, you'll see "Webhook verified"**

---

## Running the Bot

### 1. Start MongoDB (if using local)

```bash
# Ensure MongoDB is running
# macOS/Linux
brew services start mongodb-community

# Ubuntu
sudo systemctl start mongod
```

### 2. Start the Bot

```bash
# Development mode (auto-restart on changes)
npm run dev

# Production mode
npm start
```

You should see:
```
✅  EcoDrawer bot listening on http://localhost:3000
📡  Webhook endpoint: http://localhost:3000/webhook
✅  Connected to MongoDB successfully
✅  Demo recycler data initialized
🌱  Database connected and ready
```

### 3. Start ngrok (in a separate terminal)

```bash
ngrok http 3000
```

Keep ngrok running while testing.

---

## Testing

### 1. Test Health Endpoint

```bash
curl http://localhost:3000/
```

Expected response:
```json
{"status":"ok","message":"EcoDrawer Bot is running 🌱"}
```

### 2. Test with WhatsApp

1. Go to Meta Developer Portal → **WhatsApp** → **API Setup**
2. Under "**Send and receive messages**", you'll see a test number
3. Click **Send Message** to yourself
4. Open WhatsApp and send a message to the test number

**Try these commands:**
- `Hi` - Start conversation
- `Hello` - Show welcome
- `Menu` - Show main menu

### 3. Test Conversation Flow

Send messages in order:

1. `Hi` → Welcome message
2. `1` → Select English
3. Answer onboarding questions
4. `ready` → Start pre-quiz
5. Answer quiz questions (A, B, C, or D)
6. After quiz: `1` → Learn about e-waste
7. Select lesson number
8. `menu` → Return to main menu

---

## Project Structure

```
ECOBOT/
├── src/
│   ├── config/
│   │   └── database.js           # MongoDB connection
│   ├── controllers/
│   │   ├── verifyController.js   # Webhook verification
│   │   ├── messageController.js  # Message routing
│   │   └── ecoDrawerController.js # Main bot logic
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── QuizAttempt.js        # Quiz records
│   │   ├── LessonProgress.js     # Lesson tracking
│   │   └── Recycler.js           # Recycler data
│   ├── services/
│   │   ├── whatsappService.js    # WhatsApp API
│   │   ├── groqService.js        # Groq AI integration
│   │   ├── quizService.js        # Quiz logic
│   │   ├── lessonService.js      # Lesson management
│   │   ├── recyclerService.js    # Recycler finder
│   │   └── gamificationService.js # Points & badges
│   ├── data/
│   │   ├── quizQuestions.js      # Quiz questions bank
│   │   ├── lessons.js            # Lesson content
│   │   └── recyclerData.js       # Demo recycler data
│   ├── utils/
│   │   ├── stateManager.js       # Conversation states
│   │   └── messageFormatter.js   # Message formatting
│   ├── routes/
│   │   └── webhook.js            # Webhook routes
│   └── index.js                  # App entry point
├── .env                          # Environment variables (DO NOT COMMIT)
├── .env.example                  # Environment template
├── package.json                  # Dependencies
├── README.md                     # Project overview
└── SETUP_GUIDE.md                # This file
```

---

## Troubleshooting

### MongoDB Connection Error

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solutions:**
1. Ensure MongoDB is running: `sudo systemctl status mongod`
2. Check MongoDB URI in `.env`
3. For Atlas: Check IP whitelist and credentials

### WhatsApp Webhook Verification Failed

**Error:** "The callback URL or verify token couldn't be validated"

**Solutions:**
1. Ensure your bot is running (`npm run dev`)
2. Ensure ngrok is running and forwarding to port 3000
3. Use the HTTPS URL from ngrok (not HTTP)
4. Verify `VERIFY_TOKEN` in `.env` matches Meta configuration

### Groq API Error

**Error:** `401 Unauthorized` or `Invalid API Key`

**Solutions:**
1. Check `GROQ_API_KEY` in `.env` is correct
2. Ensure no extra spaces in the API key
3. Verify API key is active in Groq Console

### Image Identification Not Working

**Possible causes:**
1. Vision model not available - Check `GROQ_VISION_MODEL` in `.env`
2. Vision model not supported in your Groq account
3. Image too large or unsupported format

**Solution:** The bot will gracefully handle this and show a message. Leave `GROQ_VISION_MODEL` empty if not available.

### Messages Not Being Delivered

**Check:**
1. Bot is running and ngrok is active
2. Webhook is properly configured in Meta
3. Phone number is added to allowed list in Meta (for test numbers)
4. Check logs in terminal for errors

### Demo Recycler Data

The bot includes demo recycler data for testing. To add real verified recyclers:

1. Go to MongoDB (Compass or Atlas UI)
2. Find `recyclers` collection
3. Add verified recycler entries
4. Set `isDemo: false` and `verified: true` for real data

---

## Production Deployment

For production deployment:

1. **Use permanent WhatsApp token** (System User)
2. **Use MongoDB Atlas** (cloud database)
3. **Deploy to cloud** (Heroku, Railway, AWS, GCP)
4. **Set environment variables** in hosting platform
5. **Replace demo data** with verified recyclers
6. **Set up monitoring** and logging
7. **Enable rate limiting** on API endpoints

---

## Support

For issues or questions:
1. Check this guide first
2. Review error logs in terminal
3. Check Meta Developer docs: https://developers.facebook.com/docs/whatsapp
4. Check Groq docs: https://console.groq.com/docs

---

## License

MIT License - See LICENSE file for details.

---

**Built for TECH-CYCLE Hackathon** 🌱
Making e-waste awareness accessible through WhatsApp!

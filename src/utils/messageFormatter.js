"use strict";

/**
 * Format the welcome message
 */
function getWelcomeMessage() {
  return `Welcome to *EcoDrawer*! 🌱

Let's learn how to manage e-waste and protect our environment together.

Choose your preferred language:
1. English
2. தமிழ் (Tamil)
3. हिन्दी (Hindi)
4. తెలుగు (Telugu)

Reply with the number (1-4) of your choice.`;
}

/**
 * Format the main menu
 */
function getMainMenu(language = "english") {
  const menus = {
    english: `*Main Menu* 🌿

What would you like to do?

1. 📚 Learn about e-waste
2. 🎯 Play a quiz
3. 📸 Identify an electronic item (send image)
4. 🔍 Find a recycling center
5. 🎮 Play awareness game
6. 📊 View my progress
7. 💬 Ask EcoDrawer

Reply with a number (1-7) or type your question.`,

    tamil: `*முதன்மை பட்டி* 🌿

நீங்கள் என்ன செய்ய விரும்புகிறீர்கள்?

1. 📚 மின் கழிவு பற்றி அறிக
2. 🎯 வினாடி வினா விளையாடு
3. 📸 மின் பொருளை அடையாளம் காணவும் (படம் அனுப்பவும்)
4. 🔍 மறுசுழற்சி மையம் கண்டுபிடிக்கவும்
5. 🎮 விழிப்புணர்வு விளையாட்டு
6. 📊 என் முன்னேற்றத்தை பார்க்கவும்
7. 💬 EcoDrawer-ஐ கேளுங்கள்

எண் (1-7) உடன் பதிலளிக்கவும் அல்லது உங்கள் கேள்வியை தட்டச்சு செய்யவும்.`,

    hindi: `*मुख्य मेनू* 🌿

आप क्या करना चाहेंगे?

1. 📚 ई-कचरे के बारे में जानें
2. 🎯 क्विज खेलें
3. 📸 इलेक्ट्रॉनिक आइटम की पहचान करें (फोटो भेजें)
4. 🔍 रीसाइक्लिंग सेंटर खोजें
5. 🎮 जागरूकता गेम खेलें
6. 📊 मेरी प्रगति देखें
7. 💬 EcoDrawer से पूछें

नंबर (1-7) के साथ उत्तर दें या अपना प्रश्न टाइप करें।`,

    telugu: `*ప్రధాన మెను* 🌿

మీరు ఏమి చేయాలనుకుంటున్నారు?

1. 📚 ఇ-వ్యర్థాల గురించి తెలుసుకోండి
2. 🎯 క్విజ్ ఆడండి
3. 📸 ఎలక్ట్రానిక్ వస్తువును గుర్తించండి (చిత్రం పంపండి)
4. 🔍 రీసైక్లింగ్ కేంద్రాన్ని కనుగొనండి
5. 🎮 అవగాహన ఆట ఆడండి
6. 📊 నా పురోగతిని చూడండి
7. 💬 EcoDrawer ను అడగండి

సంఖ్య (1-7) తో ప్రత్యుత్తరం ఇవ్వండి లేదా మీ ప్రశ్నను టైప్ చేయండి.`,
  };

  return menus[language] || menus.english;
}

/**
 * Format quiz question
 */
function formatQuizQuestion(questionNumber, totalQuestions, question, options) {
  return `*Question ${questionNumber}/${totalQuestions}*

${question}

${options}

Reply with A, B, C, or D`;
}

/**
 * Format quiz result
 */
function formatQuizResult(score, totalQuestions, isCorrect, explanation) {
  const emoji = isCorrect ? "✅" : "❌";
  const result = isCorrect ? "Correct!" : "Incorrect";

  return `${emoji} *${result}*

${explanation}

*Score: ${score}/${totalQuestions}*`;
}

/**
 * Format lesson
 */
function formatLesson(lessonTitle, lessonContent) {
  return `📚 *${lessonTitle}*\n\n${lessonContent}`;
}

/**
 * Parse numeric menu choice
 */
function parseMenuChoice(text) {
  const trimmed = text.trim();

  // Direct number
  if (/^[1-7]$/.test(trimmed)) {
    return parseInt(trimmed);
  }

  // Number with dot or parenthesis
  const match = trimmed.match(/^([1-7])[.)]/);
  if (match) {
    return parseInt(match[1]);
  }

  return null;
}

/**
 * Parse language selection
 */
function parseLanguageSelection(text) {
  const trimmed = text.trim().toLowerCase();

  const languageMap = {
    "1": "english",
    "2": "tamil",
    "3": "hindi",
    "4": "telugu",
    english: "english",
    tamil: "tamil",
    தமிழ்: "tamil",
    hindi: "hindi",
    हिन्दी: "hindi",
    telugu: "telugu",
    తెలుగు: "telugu",
  };

  return languageMap[trimmed] || null;
}

/**
 * Parse quiz answer
 */
function parseQuizAnswer(text) {
  const trimmed = text.trim().toUpperCase();

  if (/^[A-D]$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Check if message is a greeting
 */
function isGreeting(text) {
  const lower = text.toLowerCase().trim();
  const greetings = [
    "hi",
    "hello",
    "hey",
    "start",
    "ecodrawer",
    "begin",
    "hola",
    "வணக்கம்",
    "नमस्ते",
    "హలో",
  ];

  return greetings.some((g) => lower.includes(g));
}

/**
 * Check if message is main menu request
 */
function isMainMenuRequest(text) {
  const lower = text.toLowerCase().trim();
  const keywords = ["menu", "main menu", "back", "home", "start over"];

  return keywords.some((k) => lower.includes(k));
}

module.exports = {
  getWelcomeMessage,
  getMainMenu,
  formatQuizQuestion,
  formatQuizResult,
  formatLesson,
  parseMenuChoice,
  parseLanguageSelection,
  parseQuizAnswer,
  isGreeting,
  isMainMenuRequest,
};

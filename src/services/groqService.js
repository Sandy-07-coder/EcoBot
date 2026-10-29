"use strict";

const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `You are EcoDrawer, a friendly multilingual e-waste awareness assistant.

Your mission: Help users learn about e-waste, repair, reuse, safe handling, and responsible recycling.

Guidelines:
- Respond in the user's selected language (English, Tamil, Hindi, or Telugu)
- Use short, easy-to-understand explanations (2-3 sentences max)
- Be encouraging and positive
- Never invent recycling centers, collection services, regulations, or factual claims
- If uncertain about something, say so clearly
- Never encourage unsafe handling, burning, or improper disposal of electronics
- Focus on practical, actionable advice
- Use simple language appropriate for all education levels

When generating lessons:
- Keep them concise and conversational
- Use real-world examples
- Explain WHY something matters, not just what to do
- End with a key takeaway

When explaining quiz answers:
- Be brief (1-2 sentences)
- Explain why the correct answer is right
- Mention why wrong answers are problematic if relevant`;

/**
 * Generate a conversational response using Groq
 */
async function generateResponse(userMessage, context = {}) {
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
  ];

  // Add context if provided
  if (context.language) {
    messages.push({
      role: "system",
      content: `The user's preferred language is: ${context.language}. Respond in that language.`,
    });
  }

  if (context.awarenessLevel) {
    messages.push({
      role: "system",
      content: `User's awareness level: ${context.awarenessLevel}. Adjust complexity accordingly.`,
    });
  }

  messages.push({ role: "user", content: userMessage });

  try {
    const response = await groq.chat.completions.create({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 500,
      timeout: 15000,
    });

    return response.choices[0]?.message?.content || "I apologize, I couldn't generate a response.";
  } catch (error) {
    console.error("[GROQ] Error generating response:", error.message);

    if (error.status === 429) {
      return "I'm experiencing high traffic right now. Please try again in a moment.";
    }

    throw error;
  }
}

/**
 * Generate a personalized lesson based on user's profile
 */
async function generateLesson(topic, userProfile) {
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  const prompt = `Generate a short educational lesson about: ${topic}

User profile:
- Awareness level: ${userProfile.awarenessLevel || "beginner"}
- Language: ${userProfile.language || "english"}

Requirements:
- Keep it under 150 words
- Use simple, conversational language
- Include one practical example
- End with a key takeaway
- Respond in ${userProfile.language || "english"}`;

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: prompt },
  ];

  try {
    const response = await groq.chat.completions.create({
      model,
      messages,
      temperature: 0.8,
      max_tokens: 400,
      timeout: 15000,
    });

    return response.choices[0]?.message?.content;
  } catch (error) {
    console.error("[GROQ] Error generating lesson:", error.message);
    throw error;
  }
}

/**
 * Identify an electronic item from image (if vision model is available)
 */
async function identifyElectronicItem(imageUrl, language = "english") {
  const visionModel = process.env.GROQ_VISION_MODEL;

  if (!visionModel) {
    return {
      success: false,
      message: "Image identification is temporarily unavailable. This feature requires a vision-capable model.",
    };
  }

  const prompt = `Identify the electronic device or item visible in this image.

Instructions:
- Only identify what you can clearly see
- If uncertain, say so
- Provide brief disposal/recycling guidance
- Respond in ${language}
- Keep response under 100 words
- Never provide unsafe disassembly instructions
- Never claim to identify exact battery chemistry or internal hazardous components from the image alone`;

  try {
    const response = await groq.chat.completions.create({
      model: visionModel,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
      temperature: 0.5,
      max_tokens: 300,
      timeout: 20000,
    });

    return {
      success: true,
      identification: response.choices[0]?.message?.content,
    };
  } catch (error) {
    console.error("[GROQ] Error identifying image:", error.message);

    if (error.message.includes("vision") || error.message.includes("image")) {
      return {
        success: false,
        message: "Image identification is not supported by the current model configuration.",
      };
    }

    throw error;
  }
}

/**
 * Translate text to user's preferred language
 */
async function translateText(text, targetLanguage) {
  if (targetLanguage === "english") {
    return text;
  }

  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  const languageNames = {
    tamil: "Tamil",
    hindi: "Hindi",
    telugu: "Telugu",
  };

  const prompt = `Translate the following text to ${languageNames[targetLanguage]}. Maintain the tone and meaning:

${text}`;

  try {
    const response = await groq.chat.completions.create({
      model,
      messages: [
        { role: "system", content: "You are a professional translator. Translate accurately while maintaining the original tone and meaning." },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 500,
      timeout: 15000,
    });

    return response.choices[0]?.message?.content;
  } catch (error) {
    console.error("[GROQ] Translation error:", error.message);
    return text; // Fallback to original text
  }
}

module.exports = {
  generateResponse,
  generateLesson,
  identifyElectronicItem,
  translateText,
};

"use strict";

const { sendTextMessage, getMediaUrl, downloadMedia } = require("../services/whatsappService");
const { getOrCreateUser, updateState, STATES } = require("../utils/stateManager");
const {
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
} = require("../utils/messageFormatter");
const { generateResponse, generateLesson, identifyElectronicItem } = require("../services/groqService");
const { startQuiz, processAnswer, saveQuizAttempt } = require("../services/quizService");
const { getRecommendations, getLesson, completeLesson } = require("../services/lessonService");
const {
  findNearbyRecyclers,
  formatRecyclerInfo,
  getSearchSummary,
} = require("../services/recyclerService");
const {
  awardPoints,
  checkAndAwardBadges,
  formatProgressSummary,
  POINTS,
} = require("../services/gamificationService");
const { getQuizQuestions } = require("../data/quizQuestions");

/**
 * Main handler for incoming messages
 */
async function handleMessage(from, messageText, messageType, message) {
  try {
    // Get or create user
    const user = await getOrCreateUser(from);

    // Handle main menu requests anywhere
    if (messageText && isMainMenuRequest(messageText)) {
      return await showMainMenu(from, user);
    }

    // Handle greetings that restart conversation
    if (messageText && isGreeting(messageText) && user.onboardingCompleted) {
      return await showMainMenu(from, user);
    }

    // Handle image messages
    if (messageType === "image") {
      return await handleImageMessage(from, user, message);
    }

    // Route based on conversation state
    const state = user.conversationState;

    switch (state) {
      case STATES.WELCOME:
        return await handleWelcome(from, user, messageText);

      case STATES.LANGUAGE_SELECTION:
        return await handleLanguageSelection(from, user, messageText);

      case STATES.ONBOARDING_AGE:
        return await handleOnboardingAge(from, user, messageText);

      case STATES.ONBOARDING_CITY:
        return await handleOnboardingCity(from, user, messageText);

      case STATES.ONBOARDING_DEVICES:
        return await handleOnboardingDevices(from, user, messageText);

      case STATES.ONBOARDING_DISPOSAL:
        return await handleOnboardingDisposal(from, user, messageText);

      case STATES.PRE_QUIZ:
        return await handlePreQuiz(from, user, messageText);

      case STATES.MAIN_MENU:
        return await handleMainMenuChoice(from, user, messageText);

      case STATES.LEARNING:
        return await handleLearning(from, user, messageText);

      case STATES.LESSON_QUIZ:
        return await handleLessonQuiz(from, user, messageText);

      case STATES.ADAPTIVE_QUIZ:
        return await handleAdaptiveQuiz(from, user, messageText);

      case STATES.RECYCLER_SEARCH:
        return await handleRecyclerSearch(from, user, messageText);

      case STATES.GAME:
        return await handleGame(from, user, messageText);

      case STATES.ASK_ECODRAWER:
        return await handleAskEcoDrawer(from, user, messageText);

      case STATES.POST_QUIZ:
        return await handlePostQuiz(from, user, messageText);

      default:
        return await showMainMenu(from, user);
    }
  } catch (error) {
    console.error("[ECODRAWER] Error handling message:", error);
    await sendTextMessage(
      from,
      "I encountered an error. Please type 'menu' to go back to the main menu."
    );
  }
}

/**
 * Handle welcome state
 */
async function handleWelcome(from, user, text) {
  await sendTextMessage(from, getWelcomeMessage());
  await updateState(user._id, STATES.LANGUAGE_SELECTION);
}

/**
 * Handle language selection
 */
async function handleLanguageSelection(from, user, text) {
  const language = parseLanguageSelection(text);

  if (!language) {
    await sendTextMessage(
      from,
      "Please reply with a number (1-4) to select your language:\n1. English\n2. Tamil\n3. Hindi\n4. Telugu"
    );
    return;
  }

  user.language = language;
  await user.save();

  // Award onboarding points
  await awardPoints(user._id, "ONBOARDING_COMPLETE");

  await sendTextMessage(from, "Great! Let's get to know you better. 🌱\n\nWhat is your age group?\n\nA. Under 18\nB. 18-30\nC. 31-50\nD. Above 50");

  await updateState(user._id, STATES.ONBOARDING_AGE);
}

/**
 * Handle onboarding - age group
 */
async function handleOnboardingAge(from, user, text) {
  const ageGroups = {
    A: "Under 18",
    B: "18-30",
    C: "31-50",
    D: "Above 50",
  };

  const answer = text.trim().toUpperCase();

  if (!ageGroups[answer]) {
    await sendTextMessage(from, "Please reply with A, B, C, or D");
    return;
  }

  user.ageGroup = ageGroups[answer];
  await user.save();

  await sendTextMessage(from, "Which city or PIN code are you from?\n\n(This helps us find nearby recycling centers)");

  await updateState(user._id, STATES.ONBOARDING_CITY);
}

/**
 * Handle onboarding - city/location
 */
async function handleOnboardingCity(from, user, text) {
  user.city = text.trim();

  // Try to parse PIN code if it's 6 digits
  if (/^\d{6}$/.test(text.trim())) {
    user.pinCode = text.trim();
  }

  await user.save();

  await sendTextMessage(
    from,
    "How many unused electronic devices do you have at home?\n\n(Approximate number: phones, laptops, chargers, etc.)"
  );

  await updateState(user._id, STATES.ONBOARDING_DEVICES);
}

/**
 * Handle onboarding - number of devices
 */
async function handleOnboardingDevices(from, user, text) {
  const number = parseInt(text.trim());

  if (isNaN(number) || number < 0) {
    await sendTextMessage(from, "Please enter a number (e.g., 0, 3, 10)");
    return;
  }

  user.unusedDevices = number;
  await user.save();

  await sendTextMessage(
    from,
    "What do you usually do with old electronics?\n\nA. Keep them at home\nB. Throw in regular trash\nC. Donate or sell\nD. Take to recycling center\nE. Don't know"
  );

  await updateState(user._id, STATES.ONBOARDING_DISPOSAL);
}

/**
 * Handle onboarding - disposal habits
 */
async function handleOnboardingDisposal(from, user, text) {
  const disposalHabits = {
    A: "Keeps at home",
    B: "Throws in regular trash",
    C: "Donates or sells",
    D: "Recycles properly",
    E: "Unsure",
  };

  const answer = text.trim().toUpperCase();

  if (!disposalHabits[answer]) {
    await sendTextMessage(from, "Please reply with A, B, C, D, or E");
    return;
  }

  user.disposalHabit = disposalHabits[answer];
  user.onboardingCompleted = true;
  await user.save();

  // Check for badges
  const newBadges = await checkAndAwardBadges(user._id);

  await sendTextMessage(
    from,
    "Perfect! Now let's check your current e-waste awareness. 🧠\n\nI'll ask you 5 quick questions. Don't worry - there are no wrong answers! This helps me personalize your learning.\n\nReply 'ready' when you want to start."
  );

  await updateState(user._id, STATES.PRE_QUIZ, { questionIndex: 0, score: 0, questions: [] });
}

/**
 * Handle pre-quiz
 */
async function handlePreQuiz(from, user, text) {
  const stateData = user.stateData || {};

  // Initialize quiz
  if (stateData.questionIndex === 0 && !stateData.questions) {
    const questions = getQuizQuestions("pre-quiz", 5, user);
    stateData.questions = questions;
    stateData.userAnswers = [];
    stateData.questionIndex = 0;
    stateData.score = 0;

    const firstQuestion = questions[0];
    await sendTextMessage(
      from,
      formatQuizQuestion(1, 5, firstQuestion.question, firstQuestion.optionsText)
    );

    await updateState(user._id, STATES.PRE_QUIZ, stateData);
    return;
  }

  // Process answer
  const currentIndex = stateData.questionIndex;
  const questions = stateData.questions;
  const currentQuestion = questions[currentIndex];

  const answer = parseQuizAnswer(text);

  if (!answer) {
    await sendTextMessage(from, "Please reply with A, B, C, or D");
    return;
  }

  // Validate answer
  const result = processAnswer(currentQuestion.id, answer);

  if (result.isCorrect) {
    stateData.score += 1;
    await awardPoints(user._id, "QUIZ_CORRECT_ANSWER");
  }

  // Store user answer
  stateData.userAnswers.push({
    questionId: currentQuestion.id,
    question: currentQuestion.question,
    topic: result.topic,
    userAnswer: answer,
    correctAnswer: result.correctAnswer,
    isCorrect: result.isCorrect,
  });

  // Send result
  await sendTextMessage(
    from,
    formatQuizResult(stateData.score, currentIndex + 1, result.isCorrect, result.explanation)
  );

  // Move to next question or finish
  stateData.questionIndex += 1;

  if (stateData.questionIndex < questions.length) {
    const nextQuestion = questions[stateData.questionIndex];

    await new Promise((resolve) => setTimeout(resolve, 1500));

    await sendTextMessage(
      from,
      formatQuizQuestion(
        stateData.questionIndex + 1,
        5,
        nextQuestion.question,
        nextQuestion.optionsText
      )
    );

    await updateState(user._id, STATES.PRE_QUIZ, stateData);
  } else {
    // Quiz completed
    await saveQuizAttempt(user._id, "pre-quiz", stateData.userAnswers, stateData.score);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Award completion points
    await awardPoints(user._id, "PRE_QUIZ_COMPLETE");

    // Check for badges
    const newBadges = await checkAndAwardBadges(user._id);

    await sendTextMessage(
      from,
      `✅ *Pre-Quiz Complete!*\n\nYou scored ${stateData.score}/5\n\nBased on your answers, I've created a personalized learning path for you. Let's explore the main menu!`
    );

    await new Promise((resolve) => setTimeout(resolve, 1500));

    await showMainMenu(from, user);
  }
}

/**
 * Show main menu
 */
async function showMainMenu(from, user) {
  await sendTextMessage(from, getMainMenu(user.language));
  await updateState(user._id, STATES.MAIN_MENU);
}

/**
 * Handle main menu choice
 */
async function handleMainMenuChoice(from, user, text) {
  const choice = parseMenuChoice(text);

  switch (choice) {
    case 1:
      // Learn about e-waste
      return await startLearning(from, user);

    case 2:
      // Play a quiz
      return await startAdaptiveQuiz(from, user);

    case 3:
      // Identify item - need image
      await sendTextMessage(
        from,
        "📸 Please send me a photo of the electronic item you want to identify.\n\nI'll help you understand what it is and how to dispose of it responsibly."
      );
      await updateState(user._id, STATES.IMAGE_IDENTIFICATION);
      return;

    case 4:
      // Find recycling center
      return await startRecyclerSearch(from, user);

    case 5:
      // Play game
      return await startGame(from, user);

    case 6:
      // View progress
      return await showProgress(from, user);

    case 7:
      // Ask EcoDrawer
      await sendTextMessage(
        from,
        "💬 Ask me anything about e-waste, recycling, or responsible disposal!\n\nType your question below:"
      );
      await updateState(user._id, STATES.ASK_ECODRAWER);
      return;

    default:
      // Try to understand natural language
      if (text.toLowerCase().includes("learn")) {
        return await startLearning(from, user);
      } else if (text.toLowerCase().includes("quiz")) {
        return await startAdaptiveQuiz(from, user);
      } else if (text.toLowerCase().includes("recycle") || text.toLowerCase().includes("center")) {
        return await startRecyclerSearch(from, user);
      } else if (text.toLowerCase().includes("progress")) {
        return await showProgress(from, user);
      } else {
        await sendTextMessage(from, "Please reply with a number (1-7) or type 'menu' to see options again.");
      }
  }
}

/**
 * Start learning session
 */
async function startLearning(from, user) {
  const recommendations = await getRecommendations(user._id);

  if (recommendations.length === 0) {
    await sendTextMessage(
      from,
      "🎉 Congratulations! You've completed all available lessons!\n\nType 'menu' to explore other options."
    );
    return await showMainMenu(from, user);
  }

  let message = "📚 *Recommended Lessons for You:*\n\n";

  recommendations.forEach((lesson, index) => {
    message += `${index + 1}. ${lesson.title}\n`;
  });

  message += `\nReply with the lesson number (1-${recommendations.length}) to start learning!`;

  await sendTextMessage(from, message);

  await updateState(user._id, STATES.LEARNING, {
    recommendations,
  });
}

/**
 * Handle learning - lesson selection and quiz
 */
async function handleLearning(from, user, text) {
  const stateData = user.stateData || {};
  const recommendations = stateData.recommendations || [];

  const choice = parseInt(text.trim());

  if (isNaN(choice) || choice < 1 || choice > recommendations.length) {
    await sendTextMessage(from, `Please reply with a number (1-${recommendations.length})`);
    return;
  }

  const selectedLesson = recommendations[choice - 1];
  const lessonData = getLesson(selectedLesson.id);

  // Send lesson content
  await sendTextMessage(from, formatLesson(lessonData.title, lessonData.content));

  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Start lesson quiz if available
  await sendTextMessage(
    from,
    "Great! Let's test your understanding with a quick question.\n\nReply 'ready' when you're set!"
  );

  await updateState(user._id, STATES.LESSON_QUIZ, {
    lessonId: selectedLesson.id,
    questionAsked: false,
  });
}

/**
 * Handle lesson quiz
 */
async function handleLessonQuiz(from, user, text) {
  const stateData = user.stateData || {};
  const lessonId = stateData.lessonId;

  if (!stateData.questionAsked) {
    // Get a question related to the lesson topic
    const lesson = getLesson(lessonId);
    const questions = getQuizQuestions("adaptive-quiz", 1, {
      ...user.toObject(),
      weakTopics: [lesson.topic],
    });

    if (questions.length === 0) {
      // No quiz available, complete lesson
      await completeLesson(user._id, lessonId);
      await awardPoints(user._id, "LESSON_COMPLETE");
      await checkAndAwardBadges(user._id);

      await sendTextMessage(from, "✅ Lesson completed! Great job! 🎉\n\nType 'menu' to continue.");
      return await showMainMenu(from, user);
    }

    const question = questions[0];

    await sendTextMessage(from, formatQuizQuestion(1, 1, question.question, question.optionsText));

    stateData.questionAsked = true;
    stateData.question = question;
    await updateState(user._id, STATES.LESSON_QUIZ, stateData);
    return;
  }

  // Process answer
  const question = stateData.question;
  const answer = parseQuizAnswer(text);

  if (!answer) {
    await sendTextMessage(from, "Please reply with A, B, C, or D");
    return;
  }

  const result = processAnswer(question.id, answer);

  const score = result.isCorrect ? 1 : 0;

  if (result.isCorrect) {
    await awardPoints(user._id, "QUIZ_CORRECT_ANSWER");
  }

  await sendTextMessage(from, formatQuizResult(score, 1, result.isCorrect, result.explanation));

  // Complete lesson
  await completeLesson(user._id, stateData.lessonId, score);
  await awardPoints(user._id, "LESSON_COMPLETE");

  const newBadges = await checkAndAwardBadges(user._id);

  if (newBadges.length > 0) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await sendTextMessage(
      from,
      `🎖️ *New Badge Earned!*\n\n${newBadges.map((b) => `${b.icon} ${b.name}: ${b.description}`).join("\n")}`
    );
  }

  await new Promise((resolve) => setTimeout(resolve, 1000));

  await sendTextMessage(from, "✅ Lesson completed! Great work! 🎉\n\nType 'menu' to continue.");
  await showMainMenu(from, user);
}

/**
 * Start adaptive quiz
 */
async function startAdaptiveQuiz(from, user) {
  await sendTextMessage(
    from,
    "🎯 *Adaptive Quiz*\n\nI'll ask you questions based on your knowledge level and weak areas.\n\nReply 'ready' to start!"
  );

  await updateState(user._id, STATES.ADAPTIVE_QUIZ, {
    questionIndex: 0,
    score: 0,
    questions: [],
  });
}

/**
 * Handle adaptive quiz
 */
async function handleAdaptiveQuiz(from, user, text) {
  const stateData = user.stateData || {};

  // Initialize quiz
  if (stateData.questionIndex === 0 && !stateData.questions) {
    const questions = getQuizQuestions("adaptive-quiz", 5, user.toObject());

    if (questions.length === 0) {
      await sendTextMessage(
        from,
        "Great news! You've mastered all quiz topics! 🎓\n\nType 'menu' to explore other features."
      );
      return await showMainMenu(from, user);
    }

    stateData.questions = questions;
    stateData.userAnswers = [];

    const firstQuestion = questions[0];
    await sendTextMessage(
      from,
      formatQuizQuestion(1, questions.length, firstQuestion.question, firstQuestion.optionsText)
    );

    await updateState(user._id, STATES.ADAPTIVE_QUIZ, stateData);
    return;
  }

  // Process answer (similar to pre-quiz logic)
  const currentIndex = stateData.questionIndex;
  const questions = stateData.questions;
  const currentQuestion = questions[currentIndex];

  const answer = parseQuizAnswer(text);

  if (!answer) {
    await sendTextMessage(from, "Please reply with A, B, C, or D");
    return;
  }

  const result = processAnswer(currentQuestion.id, answer);

  if (result.isCorrect) {
    stateData.score += 1;
    await awardPoints(user._id, "QUIZ_CORRECT_ANSWER");
  }

  stateData.userAnswers.push({
    questionId: currentQuestion.id,
    question: currentQuestion.question,
    topic: result.topic,
    userAnswer: answer,
    correctAnswer: result.correctAnswer,
    isCorrect: result.isCorrect,
  });

  await sendTextMessage(
    from,
    formatQuizResult(stateData.score, currentIndex + 1, result.isCorrect, result.explanation)
  );

  stateData.questionIndex += 1;

  if (stateData.questionIndex < questions.length) {
    const nextQuestion = questions[stateData.questionIndex];

    await new Promise((resolve) => setTimeout(resolve, 1500));

    await sendTextMessage(
      from,
      formatQuizQuestion(
        stateData.questionIndex + 1,
        questions.length,
        nextQuestion.question,
        nextQuestion.optionsText
      )
    );

    await updateState(user._id, STATES.ADAPTIVE_QUIZ, stateData);
  } else {
    await saveQuizAttempt(user._id, "adaptive-quiz", stateData.userAnswers, stateData.score);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    await awardPoints(user._id, "POST_QUIZ_COMPLETE");
    await checkAndAwardBadges(user._id);

    await sendTextMessage(
      from,
      `✅ *Quiz Complete!*\n\nYou scored ${stateData.score}/${questions.length}\n\nKeep up the great work! 🌟`
    );

    await new Promise((resolve) => setTimeout(resolve, 1500));

    await showMainMenu(from, user);
  }
}

/**
 * Handle image identification
 */
async function handleImageMessage(from, user, message) {
  try {
    const imageId = message.image?.id;

    if (!imageId) {
      await sendTextMessage(from, "Sorry, I couldn't process that image. Please try again.");
      return;
    }

    await sendTextMessage(from, "🔍 Analyzing your image...");

    // Get media URL
    const mediaUrl = await getMediaUrl(imageId);

    if (!mediaUrl) {
      await sendTextMessage(from, "Sorry, I couldn't retrieve the image. Please try again.");
      return;
    }

    // Identify using Groq vision
    const result = await identifyElectronicItem(mediaUrl, user.language);

    if (!result.success) {
      await sendTextMessage(from, result.message);
      await showMainMenu(from, user);
      return;
    }

    await sendTextMessage(from, result.identification);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    await sendTextMessage(
      from,
      "Would you like to:\n1. Find a recycling center\n2. Learn more about e-waste\n3. Back to menu\n\nReply with 1, 2, or 3"
    );

    await updateState(user._id, STATES.IMAGE_IDENTIFICATION, {
      followUp: true,
    });
  } catch (error) {
    console.error("[IMAGE] Error:", error);
    await sendTextMessage(
      from,
      "Sorry, I encountered an error processing your image. Please try again later or type 'menu'."
    );
  }
}

/**
 * Start recycler search
 */
async function startRecyclerSearch(from, user) {
  let message = "🔍 *Find E-Waste Recycling Centers*\n\n";

  if (user.city || user.pinCode) {
    message += `I'll search near: ${user.city || user.pinCode}\n\n`;
    message += "Type 'search' to find centers, or enter a different city/PIN code.";
  } else {
    message += "Please enter your city name or 6-digit PIN code:";
  }

  await sendTextMessage(from, message);

  await updateState(user._id, STATES.RECYCLER_SEARCH);
}

/**
 * Handle recycler search
 */
async function handleRecyclerSearch(from, user, text) {
  const trimmed = text.trim().toLowerCase();

  let location = user.city || user.pinCode;

  if (trimmed !== "search") {
    location = text.trim();
  }

  if (!location) {
    await sendTextMessage(from, "Please enter a city name or PIN code.");
    return;
  }

  await sendTextMessage(from, "🔍 Searching for e-waste recycling centers...");

  const recyclers = await findNearbyRecyclers(location);

  const summary = getSearchSummary(recyclers, location);

  await sendTextMessage(from, summary);

  if (recyclers.length > 0) {
    for (let i = 0; i < Math.min(recyclers.length, 3); i++) {
      const info = formatRecyclerInfo(recyclers[i], user.language);
      await sendTextMessage(from, info);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 1000));

  await sendTextMessage(from, "Type 'menu' to return to the main menu.");
  await showMainMenu(from, user);
}

/**
 * Start awareness game
 */
async function startGame(from, user) {
  await sendTextMessage(
    from,
    "🎮 *E-Waste Awareness Game*\n\n*True or False Game*\n\nI'll show you statements about e-waste. You tell me if they're TRUE or FALSE!\n\nReply 'start' to begin!"
  );

  await updateState(user._id, STATES.GAME, {
    gameType: "true_false",
    questionIndex: 0,
    score: 0,
  });
}

/**
 * Handle game
 */
async function handleGame(from, user, text) {
  const stateData = user.stateData || {};

  // True/False game statements
  const statements = [
    {
      statement: "E-waste can safely be thrown in regular household trash.",
      answer: false,
      explanation: "False! E-waste contains toxic materials that need proper recycling.",
    },
    {
      statement: "One mobile phone battery can contaminate 600,000 liters of water.",
      answer: true,
      explanation: "True! Batteries contain harmful chemicals that severely pollute water.",
    },
    {
      statement: "Old electronics should always be burned to dispose of them.",
      answer: false,
      explanation: "False! Burning e-waste releases toxic fumes. Always recycle properly.",
    },
    {
      statement: "Electronics contain valuable materials like gold and copper.",
      answer: true,
      explanation: "True! Recycling recovers precious metals from electronic devices.",
    },
    {
      statement: "Factory reset is necessary before recycling smartphones.",
      answer: true,
      explanation: "True! Factory reset protects your personal data and privacy.",
    },
  ];

  if (!stateData.started) {
    stateData.started = true;
    stateData.questionIndex = 0;
    stateData.score = 0;

    const firstStatement = statements[0];
    await sendTextMessage(
      from,
      `*Statement 1/${statements.length}*\n\n${firstStatement.statement}\n\nReply TRUE or FALSE`
    );

    await updateState(user._id, STATES.GAME, stateData);
    return;
  }

  // Process answer
  const currentIndex = stateData.questionIndex;
  const current = statements[currentIndex];

  const answer = text.trim().toLowerCase();

  if (answer !== "true" && answer !== "false") {
    await sendTextMessage(from, "Please reply with TRUE or FALSE");
    return;
  }

  const userAnswer = answer === "true";
  const isCorrect = userAnswer === current.answer;

  if (isCorrect) {
    stateData.score += 1;
    await awardPoints(user._id, "QUIZ_CORRECT_ANSWER");
  }

  const emoji = isCorrect ? "✅" : "❌";
  await sendTextMessage(from, `${emoji} ${current.explanation}\n\n*Score: ${stateData.score}/${currentIndex + 1}*`);

  stateData.questionIndex += 1;

  if (stateData.questionIndex < statements.length) {
    const next = statements[stateData.questionIndex];

    await new Promise((resolve) => setTimeout(resolve, 1500));

    await sendTextMessage(
      from,
      `*Statement ${stateData.questionIndex + 1}/${statements.length}*\n\n${next.statement}\n\nReply TRUE or FALSE`
    );

    await updateState(user._id, STATES.GAME, stateData);
  } else {
    // Game complete
    await awardPoints(user._id, "GAME_COMPLETE");
    await checkAndAwardBadges(user._id);

    await sendTextMessage(
      from,
      `🎉 *Game Complete!*\n\nFinal Score: ${stateData.score}/${statements.length}\n\nGreat job learning about e-waste! 🌱`
    );

    await new Promise((resolve) => setTimeout(resolve, 1500));

    await showMainMenu(from, user);
  }
}

/**
 * Show user progress
 */
async function showProgress(from, user) {
  const summary = await formatProgressSummary(user._id, user.language);

  await sendTextMessage(from, summary);

  // Suggest next steps
  await new Promise((resolve) => setTimeout(resolve, 1000));

  let nextSteps = "\n*What's Next?* 🚀\n\n";

  if ((user.lessonsCompleted?.length || 0) < 7) {
    nextSteps += "📚 Continue learning with more lessons\n";
  }

  if (!user.quizzesCompleted?.includes("post-quiz")) {
    nextSteps += "🎯 Take the post-quiz to see your improvement\n";
  }

  nextSteps += "\nType 'menu' to continue your journey!";

  await sendTextMessage(from, nextSteps);

  await showMainMenu(from, user);
}

/**
 * Handle Ask EcoDrawer
 */
async function handleAskEcoDrawer(from, user, text) {
  await sendTextMessage(from, "🤔 Let me think...");

  try {
    const response = await generateResponse(text, {
      language: user.language,
      awarenessLevel: user.awarenessLevel,
    });

    await sendTextMessage(from, response);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    await sendTextMessage(
      from,
      "Have another question? Ask away, or type 'menu' to go back to the main menu."
    );
  } catch (error) {
    console.error("[ASK] Error:", error);
    await sendTextMessage(
      from,
      "Sorry, I couldn't process that right now. Please try again later or type 'menu'."
    );
    await showMainMenu(from, user);
  }
}

module.exports = { handleMessage };

"use strict";

/**
 * Pre-defined quiz questions for e-waste awareness
 * Questions are categorized by topic and difficulty
 */

const QUIZ_QUESTIONS = {
  preQuiz: [
    {
      id: "pre_q1",
      question: "What is e-waste?",
      topic: "basics",
      difficulty: "beginner",
      options: {
        A: "Only broken computers",
        B: "Discarded electronic devices and equipment",
        C: "Plastic waste from electronics packaging",
        D: "Old batteries only",
      },
      correctAnswer: "B",
      explanation: "E-waste includes all discarded electronic devices like phones, computers, TVs, and appliances.",
    },
    {
      id: "pre_q2",
      question: "Which of these is considered e-waste?",
      topic: "identification",
      difficulty: "beginner",
      options: {
        A: "Old mobile phone",
        B: "Paper packaging",
        C: "Wooden furniture",
        D: "Glass bottle",
      },
      correctAnswer: "A",
      explanation: "Mobile phones contain electronic components and are classified as e-waste when discarded.",
    },
    {
      id: "pre_q3",
      question: "Why is improper e-waste disposal harmful?",
      topic: "environmental_impact",
      difficulty: "beginner",
      options: {
        A: "It takes up space",
        B: "Toxic materials can contaminate soil and water",
        C: "It looks messy",
        D: "It's expensive",
      },
      correctAnswer: "B",
      explanation: "E-waste contains harmful substances like lead, mercury, and cadmium that can poison the environment.",
    },
    {
      id: "pre_q4",
      question: "What should you do with an old working mobile phone?",
      topic: "disposal_habits",
      difficulty: "beginner",
      options: {
        A: "Throw it in regular garbage",
        B: "Burn it to reduce waste",
        C: "Donate, sell, or recycle it responsibly",
        D: "Bury it in the ground",
      },
      correctAnswer: "C",
      explanation: "Working devices can be reused by others, and if not, should be recycled at proper facilities.",
    },
    {
      id: "pre_q5",
      question: "Why is e-waste recycling important?",
      topic: "recycling_importance",
      difficulty: "beginner",
      options: {
        A: "It's legally required",
        B: "It recovers valuable materials and prevents pollution",
        C: "It makes money for recyclers",
        D: "It reduces electricity bills",
      },
      correctAnswer: "B",
      explanation: "Recycling recovers precious metals and prevents toxic materials from harming the environment.",
    },
  ],

  postQuiz: [
    {
      id: "post_q1",
      question: "Before recycling a smartphone, what important step should you take?",
      topic: "data_security",
      difficulty: "intermediate",
      options: {
        A: "Remove the battery",
        B: "Delete personal data and perform factory reset",
        C: "Remove the SIM card only",
        D: "Clean the screen",
      },
      correctAnswer: "B",
      explanation: "Factory reset ensures your personal data, photos, and accounts are completely removed.",
    },
    {
      id: "post_q2",
      question: "Which metal found in electronics is valuable and recyclable?",
      topic: "valuable_materials",
      difficulty: "intermediate",
      options: {
        A: "Iron",
        B: "Aluminum",
        C: "Gold and copper",
        D: "Plastic",
      },
      correctAnswer: "C",
      explanation: "Electronics contain precious metals like gold, silver, and copper in circuit boards.",
    },
    {
      id: "post_q3",
      question: "What is the best option for a slightly damaged but repairable laptop?",
      topic: "repair_reuse",
      difficulty: "intermediate",
      options: {
        A: "Throw it away immediately",
        B: "Get it repaired and continue using it",
        C: "Dismantle it yourself",
        D: "Keep it stored indefinitely",
      },
      correctAnswer: "B",
      explanation: "Repairing extends device life, saves money, and reduces e-waste generation.",
    },
    {
      id: "post_q4",
      question: "How should old batteries be disposed of?",
      topic: "battery_disposal",
      difficulty: "intermediate",
      options: {
        A: "Throw with regular trash",
        B: "Burn them",
        C: "Take to designated battery collection points",
        D: "Flush down the toilet",
      },
      correctAnswer: "C",
      explanation: "Batteries contain toxic chemicals and should only go to proper collection facilities.",
    },
    {
      id: "post_q5",
      question: "What does the crossed-out wheelie bin symbol on electronics mean?",
      topic: "regulations",
      difficulty: "intermediate",
      options: {
        A: "The product is waterproof",
        B: "Do not dispose in regular trash - recycle properly",
        C: "The product is recyclable packaging",
        D: "The product is biodegradable",
      },
      correctAnswer: "B",
      explanation: "This WEEE symbol indicates the item must be recycled separately, not thrown in regular bins.",
    },
  ],

  lessonQuizzes: {
    battery_safety: [
      {
        id: "battery_q1",
        question: "Why is it dangerous to damage lithium batteries?",
        topic: "battery_disposal",
        difficulty: "intermediate",
        options: {
          A: "They lose charge quickly",
          B: "They can catch fire or explode",
          C: "They become less valuable",
          D: "They stop working",
        },
        correctAnswer: "B",
        explanation: "Damaged lithium batteries can short circuit and cause fires or explosions.",
      },
    ],
    mobile_recycling: [
      {
        id: "mobile_q1",
        question: "How many years does it take for e-waste to decompose naturally?",
        topic: "environmental_impact",
        difficulty: "intermediate",
        options: {
          A: "1-2 years",
          B: "10-20 years",
          C: "Hundreds to thousands of years",
          D: "Never decomposes",
        },
        correctAnswer: "C",
        explanation: "Electronic components contain materials that take centuries to break down naturally.",
      },
    ],
  },

  adaptiveQuestions: [
    {
      id: "adv_q1",
      question: "What is 'urban mining' in e-waste management?",
      topic: "advanced_concepts",
      difficulty: "advanced",
      options: {
        A: "Mining in cities",
        B: "Extracting valuable materials from e-waste",
        C: "Collecting trash from streets",
        D: "Building mines under cities",
      },
      correctAnswer: "B",
      explanation: "Urban mining recovers precious metals from discarded electronics, reducing the need for traditional mining.",
    },
    {
      id: "adv_q2",
      question: "Which component in electronics contains the most gold?",
      topic: "valuable_materials",
      difficulty: "advanced",
      options: {
        A: "Screen",
        B: "Battery",
        C: "Circuit boards and connectors",
        D: "Plastic casing",
      },
      correctAnswer: "C",
      explanation: "Circuit boards use gold for connectors due to its excellent conductivity and corrosion resistance.",
    },
  ],
};

/**
 * Get questions for a specific quiz type
 */
function getQuizQuestions(quizType, count = 5, userProfile = {}) {
  let questions = [];

  switch (quizType) {
    case "pre-quiz":
      questions = QUIZ_QUESTIONS.preQuiz.slice(0, count);
      break;
    case "post-quiz":
      questions = QUIZ_QUESTIONS.postQuiz.slice(0, count);
      break;
    case "adaptive-quiz":
      // Select questions based on user's weak topics and awareness level
      questions = selectAdaptiveQuestions(userProfile, count);
      break;
    default:
      questions = QUIZ_QUESTIONS.preQuiz.slice(0, count);
  }

  return questions.map((q) => ({
    ...q,
    optionsText: formatOptions(q.options),
  }));
}

/**
 * Select adaptive questions based on user profile
 */
function selectAdaptiveQuestions(userProfile, count) {
  const weakTopics = userProfile.weakTopics || [];
  const awarenessLevel = userProfile.awarenessLevel || "beginner";

  const allQuestions = [
    ...QUIZ_QUESTIONS.preQuiz,
    ...QUIZ_QUESTIONS.postQuiz,
    ...QUIZ_QUESTIONS.adaptiveQuestions,
  ];

  // Filter by weak topics if available
  let filtered = allQuestions;
  if (weakTopics.length > 0) {
    filtered = allQuestions.filter((q) => weakTopics.includes(q.topic));
  }

  // Filter by appropriate difficulty
  if (awarenessLevel === "beginner") {
    filtered = filtered.filter((q) => q.difficulty === "beginner");
  } else if (awarenessLevel === "intermediate") {
    filtered = filtered.filter((q) =>
      ["beginner", "intermediate"].includes(q.difficulty)
    );
  }

  // Shuffle and return requested count
  return filtered.sort(() => Math.random() - 0.5).slice(0, count);
}

/**
 * Format options for display
 */
function formatOptions(options) {
  return Object.entries(options)
    .map(([key, value]) => `${key}. ${value}`)
    .join("\n");
}

/**
 * Get a specific question by ID
 */
function getQuestionById(questionId) {
  const allQuestions = [
    ...QUIZ_QUESTIONS.preQuiz,
    ...QUIZ_QUESTIONS.postQuiz,
    ...QUIZ_QUESTIONS.adaptiveQuestions,
    ...Object.values(QUIZ_QUESTIONS.lessonQuizzes).flat(),
  ];

  return allQuestions.find((q) => q.id === questionId);
}

/**
 * Validate quiz answer
 */
function validateAnswer(questionId, userAnswer) {
  const question = getQuestionById(questionId);

  if (!question) {
    return { valid: false, error: "Question not found" };
  }

  const isCorrect =
    userAnswer.toUpperCase() === question.correctAnswer.toUpperCase();

  return {
    valid: true,
    isCorrect,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
    topic: question.topic,
  };
}

module.exports = {
  getQuizQuestions,
  getQuestionById,
  validateAnswer,
  selectAdaptiveQuestions,
};

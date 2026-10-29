"use strict";

const QuizAttempt = require("../models/QuizAttempt");
const User = require("../models/User");
const {
  getQuizQuestions,
  validateAnswer,
} = require("../data/quizQuestions");

/**
 * Start a new quiz for a user
 */
async function startQuiz(userId, quizType, userProfile) {
  const questions = getQuizQuestions(quizType, 5, userProfile);

  return questions.map((q) => ({
    id: q.id,
    question: q.question,
    options: q.optionsText,
  }));
}

/**
 * Process a quiz answer
 */
function processAnswer(questionId, userAnswer) {
  return validateAnswer(questionId, userAnswer);
}

/**
 * Save completed quiz attempt
 */
async function saveQuizAttempt(userId, quizType, questions, score) {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  // Create quiz attempt record
  const attempt = new QuizAttempt({
    userId,
    quizType,
    questions,
    score,
    totalQuestions: questions.length,
    completedAt: new Date(),
  });

  await attempt.save();

  // Update user profile based on quiz results
  if (quizType === "pre-quiz") {
    user.preQuizScore = score;

    // Determine awareness level
    const percentage = (score / questions.length) * 100;
    if (percentage < 40) {
      user.awarenessLevel = "beginner";
    } else if (percentage < 70) {
      user.awarenessLevel = "intermediate";
    } else {
      user.awarenessLevel = "advanced";
    }

    // Identify weak topics
    const weakTopics = questions
      .filter((q) => !q.isCorrect)
      .map((q) => q.topic);
    user.weakTopics = [...new Set(weakTopics)];

    // Mark as quiz completed
    if (!user.quizzesCompleted.includes(quizType)) {
      user.quizzesCompleted.push(quizType);
    }
  } else if (quizType === "post-quiz") {
    user.postQuizScore = score;

    if (!user.quizzesCompleted.includes(quizType)) {
      user.quizzesCompleted.push(quizType);
    }
  }

  await user.save();

  return attempt;
}

/**
 * Get quiz history for a user
 */
async function getQuizHistory(userId, limit = 10) {
  return QuizAttempt.find({ userId })
    .sort({ completedAt: -1 })
    .limit(limit)
    .select("quizType score totalQuestions completedAt");
}

/**
 * Calculate improvement between pre and post quiz
 */
async function calculateImprovement(userId) {
  const user = await User.findById(userId);

  if (!user || !user.preQuizScore || !user.postQuizScore) {
    return null;
  }

  const improvement = user.postQuizScore - user.preQuizScore;
  const improvementPercentage = (improvement / 5) * 100; // Assuming 5 questions

  return {
    preQuizScore: user.preQuizScore,
    postQuizScore: user.postQuizScore,
    improvement,
    improvementPercentage,
    weakTopicsImproved: [], // Can be calculated from quiz attempts
  };
}

module.exports = {
  startQuiz,
  processAnswer,
  saveQuizAttempt,
  getQuizHistory,
  calculateImprovement,
};

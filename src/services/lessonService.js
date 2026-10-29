"use strict";

const LessonProgress = require("../models/LessonProgress");
const User = require("../models/User");
const { getLessonById, getRecommendedLessons } = require("../data/lessons");

/**
 * Get recommended lessons for user
 */
async function getRecommendations(userId) {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const userProfile = {
    lessonsCompleted: user.lessonsCompleted || [],
    weakTopics: user.weakTopics || [],
    awarenessLevel: user.awarenessLevel || "beginner",
  };

  return getRecommendedLessons(userProfile);
}

/**
 * Get a specific lesson
 */
function getLesson(lessonId) {
  const lesson = getLessonById(lessonId);

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  return lesson;
}

/**
 * Mark lesson as completed
 */
async function completeLesson(userId, lessonId, quizScore = null) {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  // Update or create lesson progress
  const progress = await LessonProgress.findOneAndUpdate(
    { userId, lessonId },
    {
      lessonTopic: getLessonById(lessonId)?.topic,
      completed: true,
      quizScore,
      quizPassed: quizScore ? quizScore >= 1 : undefined,
      completedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  // Update user's completed lessons
  if (!user.lessonsCompleted.includes(lessonId)) {
    user.lessonsCompleted.push(lessonId);
  }

  // Update learning streak
  const today = new Date().toDateString();
  const lastActiveDate = user.lastActiveDate
    ? new Date(user.lastActiveDate).toDateString()
    : null;

  if (lastActiveDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    if (lastActiveDate === yesterdayStr) {
      user.learningStreak += 1;
    } else if (lastActiveDate !== today) {
      user.learningStreak = 1;
    }
  }

  user.lastActiveDate = new Date();
  await user.save();

  return progress;
}

/**
 * Get user's lesson progress
 */
async function getUserProgress(userId) {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const completedCount = user.lessonsCompleted?.length || 0;
  const totalLessons = 7; // Total number of lessons available

  return {
    completedLessons: user.lessonsCompleted || [],
    completedCount,
    totalLessons,
    progressPercentage: Math.round((completedCount / totalLessons) * 100),
    learningStreak: user.learningStreak || 0,
  };
}

module.exports = {
  getRecommendations,
  getLesson,
  completeLesson,
  getUserProgress,
};

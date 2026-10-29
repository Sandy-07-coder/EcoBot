"use strict";

const User = require("../models/User");

/**
 * Points awarded for different actions
 */
const POINTS = {
  ONBOARDING_COMPLETE: 50,
  PRE_QUIZ_COMPLETE: 50,
  POST_QUIZ_COMPLETE: 100,
  LESSON_COMPLETE: 30,
  QUIZ_CORRECT_ANSWER: 10,
  GAME_COMPLETE: 20,
  STREAK_BONUS: 5, // Per day of streak
};

/**
 * Badge definitions
 */
const BADGES = {
  EWASTE_BEGINNER: {
    id: "ewaste_beginner",
    name: "E-Waste Beginner",
    description: "Completed onboarding",
    icon: "🌱",
    requirement: { onboardingCompleted: true },
  },
  QUIZ_MASTER: {
    id: "quiz_master",
    name: "Quiz Master",
    description: "Completed both pre and post quizzes",
    icon: "🎓",
    requirement: { quizzesCompleted: 2 },
  },
  BATTERY_GUARDIAN: {
    id: "battery_guardian",
    name: "Battery Guardian",
    description: "Completed battery safety lesson",
    icon: "🔋",
    requirement: { lesson: "battery_safety" },
  },
  RECYCLING_CHAMPION: {
    id: "recycling_champion",
    name: "Recycling Champion",
    description: "Completed 5 lessons",
    icon: "♻️",
    requirement: { lessonsCompleted: 5 },
  },
  ECO_EXPERT: {
    id: "eco_expert",
    name: "Eco Expert",
    description: "Completed all lessons and post-quiz with 80%+",
    icon: "🌟",
    requirement: { allLessons: true, postQuizScore: 4 },
  },
  STREAK_WARRIOR: {
    id: "streak_warrior",
    name: "Streak Warrior",
    description: "Maintained 7-day learning streak",
    icon: "🔥",
    requirement: { learningStreak: 7 },
  },
};

/**
 * Award points to user
 */
async function awardPoints(userId, pointType, multiplier = 1) {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const points = POINTS[pointType] * multiplier;
  user.points = (user.points || 0) + points;

  await user.save();

  return { points, totalPoints: user.points };
}

/**
 * Check and award badges
 */
async function checkAndAwardBadges(userId) {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const currentBadges = user.badges || [];
  const newBadges = [];

  // Check each badge requirement
  for (const badge of Object.values(BADGES)) {
    // Skip if already earned
    if (currentBadges.includes(badge.id)) {
      continue;
    }

    let earned = false;

    // Check onboarding
    if (badge.requirement.onboardingCompleted) {
      earned = user.onboardingCompleted === true;
    }

    // Check quizzes completed count
    if (badge.requirement.quizzesCompleted) {
      const count = user.quizzesCompleted?.length || 0;
      earned = count >= badge.requirement.quizzesCompleted;
    }

    // Check specific lesson completed
    if (badge.requirement.lesson) {
      earned = user.lessonsCompleted?.includes(badge.requirement.lesson);
    }

    // Check lessons completed count
    if (badge.requirement.lessonsCompleted) {
      const count = user.lessonsCompleted?.length || 0;
      earned = count >= badge.requirement.lessonsCompleted;
    }

    // Check all lessons and post-quiz score
    if (badge.requirement.allLessons && badge.requirement.postQuizScore) {
      const allLessonsComplete = (user.lessonsCompleted?.length || 0) >= 7;
      const postQuizPassed = (user.postQuizScore || 0) >= badge.requirement.postQuizScore;
      earned = allLessonsComplete && postQuizPassed;
    }

    // Check learning streak
    if (badge.requirement.learningStreak) {
      earned = (user.learningStreak || 0) >= badge.requirement.learningStreak;
    }

    if (earned) {
      user.badges.push(badge.id);
      newBadges.push(badge);
    }
  }

  if (newBadges.length > 0) {
    await user.save();
  }

  return newBadges;
}

/**
 * Get user's gamification stats
 */
async function getUserStats(userId) {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const badges = (user.badges || []).map((badgeId) => {
    const badge = Object.values(BADGES).find((b) => b.id === badgeId);
    return badge ? `${badge.icon} ${badge.name}` : badgeId;
  });

  const level = calculateLevel(user.points || 0);

  return {
    points: user.points || 0,
    level,
    badges,
    badgeCount: badges.length,
    learningStreak: user.learningStreak || 0,
    lessonsCompleted: user.lessonsCompleted?.length || 0,
    quizzesCompleted: user.quizzesCompleted?.length || 0,
  };
}

/**
 * Calculate user level based on points
 */
function calculateLevel(points) {
  if (points < 100) return { level: 1, name: "Beginner", nextLevel: 100 };
  if (points < 300) return { level: 2, name: "Learner", nextLevel: 300 };
  if (points < 600) return { level: 3, name: "Practitioner", nextLevel: 600 };
  if (points < 1000) return { level: 4, name: "Expert", nextLevel: 1000 };
  return { level: 5, name: "Master", nextLevel: null };
}

/**
 * Format progress summary
 */
async function formatProgressSummary(userId, language = "english") {
  const stats = await getUserStats(userId);
  const user = await User.findById(userId);

  let summary = `*Your E-Waste Awareness Progress* 🌱\n\n`;
  summary += `📊 *Level ${stats.level.level}:* ${stats.level.name}\n`;
  summary += `⭐ *Points:* ${stats.points}`;

  if (stats.level.nextLevel) {
    summary += ` (${stats.level.nextLevel - stats.points} to next level)`;
  }

  summary += `\n\n`;

  if (stats.learningStreak > 0) {
    summary += `🔥 *Learning Streak:* ${stats.learningStreak} day${stats.learningStreak > 1 ? "s" : ""}!\n`;
  }

  summary += `📚 *Lessons Completed:* ${stats.lessonsCompleted}/7\n`;
  summary += `✅ *Quizzes Completed:* ${stats.quizzesCompleted}\n\n`;

  if (stats.badges.length > 0) {
    summary += `🏆 *Badges Earned:*\n${stats.badges.join("\n")}\n\n`;
  }

  // Show awareness improvement
  if (user.preQuizScore !== undefined && user.postQuizScore !== undefined) {
    const improvement = user.postQuizScore - user.preQuizScore;
    summary += `📈 *Awareness Improvement:* ${user.preQuizScore}/5 → ${user.postQuizScore}/5`;
    if (improvement > 0) {
      summary += ` (+${improvement})`;
    }
    summary += `\n`;
  }

  return summary;
}

module.exports = {
  POINTS,
  BADGES,
  awardPoints,
  checkAndAwardBadges,
  getUserStats,
  calculateLevel,
  formatProgressSummary,
};

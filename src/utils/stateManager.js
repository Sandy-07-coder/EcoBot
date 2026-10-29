"use strict";

const User = require("../models/User");

/**
 * Conversation states
 */
const STATES = {
  WELCOME: "welcome",
  LANGUAGE_SELECTION: "language_selection",
  ONBOARDING_AGE: "onboarding_age",
  ONBOARDING_CITY: "onboarding_city",
  ONBOARDING_DEVICES: "onboarding_devices",
  ONBOARDING_DISPOSAL: "onboarding_disposal",
  PRE_QUIZ: "pre_quiz",
  MAIN_MENU: "main_menu",
  LEARNING: "learning",
  LESSON_QUIZ: "lesson_quiz",
  ADAPTIVE_QUIZ: "adaptive_quiz",
  IMAGE_IDENTIFICATION: "image_identification",
  RECYCLER_SEARCH: "recycler_search",
  GAME: "game",
  PROGRESS_VIEW: "progress_view",
  ASK_ECODRAWER: "ask_ecodrawer",
  POST_QUIZ: "post_quiz",
};

/**
 * Get or create user by phone number
 */
async function getOrCreateUser(phoneNumber) {
  let user = await User.findOne({ phoneNumber });

  if (!user) {
    user = new User({
      phoneNumber,
      conversationState: STATES.WELCOME,
      stateData: {},
    });
    await user.save();
  }

  return user;
}

/**
 * Update user's conversation state
 */
async function updateState(userId, newState, stateData = {}) {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  user.conversationState = newState;
  user.stateData = { ...user.stateData, ...stateData };

  await user.save();

  return user;
}

/**
 * Get user's current state
 */
async function getCurrentState(userId) {
  const user = await User.findById(userId);

  if (!user) {
    return null;
  }

  return {
    state: user.conversationState,
    data: user.stateData || {},
  };
}

/**
 * Clear state data
 */
async function clearStateData(userId) {
  const user = await User.findById(userId);

  if (user) {
    user.stateData = {};
    await user.save();
  }
}

/**
 * Reset user to main menu
 */
async function resetToMainMenu(userId) {
  return updateState(userId, STATES.MAIN_MENU, {});
}

module.exports = {
  STATES,
  getOrCreateUser,
  updateState,
  getCurrentState,
  clearStateData,
  resetToMainMenu,
};

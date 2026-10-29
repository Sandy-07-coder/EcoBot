"use strict";

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    language: {
      type: String,
      enum: ["english", "tamil", "hindi", "telugu"],
      default: "english",
    },
    ageGroup: String,
    city: String,
    pinCode: String,
    unusedDevices: Number,
    disposalHabit: String,
    awarenessLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    preQuizScore: {
      type: Number,
      default: 0,
    },
    postQuizScore: Number,
    weakTopics: [String],
    conversationState: {
      type: String,
      default: "welcome",
    },
    stateData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    points: {
      type: Number,
      default: 0,
    },
    badges: [String],
    learningStreak: {
      type: Number,
      default: 0,
    },
    lastActiveDate: Date,
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    lessonsCompleted: [String],
    quizzesCompleted: [String],
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
userSchema.index({ conversationState: 1 });
userSchema.index({ awarenessLevel: 1 });

module.exports = mongoose.model("User", userSchema);

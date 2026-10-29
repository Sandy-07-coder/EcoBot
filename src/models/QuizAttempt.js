"use strict";

const mongoose = require("mongoose");

const quizAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    quizType: {
      type: String,
      enum: ["pre-quiz", "post-quiz", "lesson-quiz", "adaptive-quiz", "game"],
      required: true,
    },
    questions: [
      {
        questionId: String,
        question: String,
        topic: String,
        userAnswer: String,
        correctAnswer: String,
        isCorrect: Boolean,
      },
    ],
    score: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

quizAttemptSchema.index({ userId: 1, quizType: 1 });
quizAttemptSchema.index({ completedAt: -1 });

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);

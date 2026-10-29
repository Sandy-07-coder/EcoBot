"use strict";

const mongoose = require("mongoose");

const lessonProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    lessonId: {
      type: String,
      required: true,
    },
    lessonTopic: String,
    completed: {
      type: Boolean,
      default: false,
    },
    quizPassed: Boolean,
    quizScore: Number,
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

lessonProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

module.exports = mongoose.model("LessonProgress", lessonProgressSchema);

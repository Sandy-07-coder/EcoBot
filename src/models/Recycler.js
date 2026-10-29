"use strict";

const mongoose = require("mongoose");

const recyclerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    address: String,
    city: {
      type: String,
      required: true,
      index: true,
    },
    pinCode: {
      type: String,
      index: true,
    },
    state: String,
    contactNumber: String,
    email: String,
    website: String,
    acceptedItems: [String],
    services: [String],
    verified: {
      type: Boolean,
      default: false,
    },
    verificationSource: String,
    mapLink: String,
    operatingHours: String,
    isDemo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

recyclerSchema.index({ city: 1, verified: 1 });
recyclerSchema.index({ pinCode: 1, verified: 1 });

module.exports = mongoose.model("Recycler", recyclerSchema);

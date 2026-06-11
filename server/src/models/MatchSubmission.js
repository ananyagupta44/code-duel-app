// models/MatchSubmission.js

import mongoose from "mongoose";

const matchSubmissionSchema = new mongoose.Schema({
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Match",
    required: true,
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  code: {
    type: String,
    required: true,
  },

  language: {
    type: String,
    enum: ["javascript", "python", "java", "cpp"],
    required: true,
  },

  verdict: {
    type: String,
    enum: ["accepted", "WA", "TLE", "RE"],
    required: true,
  },

  runtime: Number,

  memory: Number,

  passed: Number,

  total: Number,

  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model(
  "MatchSubmission",
  matchSubmissionSchema
);
// models/DailyChallengeAttempt.js

import mongoose from "mongoose";

const dailyChallengeAttemptSchema = new mongoose.Schema(
  {
    challengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DailyChallenge",
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model(
  "DailyChallengeAttempt",
  dailyChallengeAttemptSchema,
);

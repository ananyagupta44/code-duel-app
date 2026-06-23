// models/DailyChallenge.js

import mongoose from "mongoose";

const dailyChallengeSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      unique: true,
      required: true,
    },

    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },

    difficulty: String,

    participants: {
      type: Number,
      default: 0,
    },

    leaderboard: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },

        username: String,

        solveTimeMs: Number,

        completedAt: Date,
      },
    ],
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("DailyChallenge", dailyChallengeSchema);

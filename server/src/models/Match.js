import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
  {
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },

    player1Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    player2Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["waiting", "active", "finished", "cancelled"],
      default: "waiting",
    },

    matchType: {
      type: String,
      enum: ["ranked", "casual", "friend", "ai"],
      default: "casual",
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
    },

    winnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    loserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    player1Progress: {
      type: Number,
      default: 0,
    },

    player2Progress: {
      type: Number,
      default: 0,
    },

    player1Submission: {
      language: String,
      code: String,
      passedTests: Number,
      totalTests: Number,
      submittedAt: Date,
    },

    player2Submission: {
      language: String,
      code: String,
      passedTests: Number,
      totalTests: Number,
      submittedAt: Date,
    },

    durationSecs: {
      type: Number,
      default: 1800,
    },

    startedAt: {
      type: Date,
    },

    endedAt: {
      type: Date,
    },

    player1EloBefore: {
      type: Number,
    },

    player1EloAfter: {
      type: Number,
    },

    player2EloBefore: {
      type: Number,
    },

    player2EloAfter: {
      type: Number,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Match", matchSchema);

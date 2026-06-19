import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    elo: {
      type: Number,
      default: 1000,
    },

    wins: {
      type: Number,
      default: 0,
    },

    losses: {
      type: Number,
      default: 0,
    },
    solvedProblems: [
      {
        type: String,
      },
    ],
    isOnline: {
      type: Boolean,
      default: false,
    },

    isInMatch: {
      type: Boolean,
      default: false,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },

    bestStreak: {
      type: Number,
      default: 0,
    },

    lastMatchAt: {
      type: Date,
      default: null,
    },
    tournamentWins: {
      type: Number,
      default: 0,
    },
    tournamentBadges: [
      {
        tournamentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Tournament",
        },

        tournamentName: String,

        wonAt: {
          type: Date,
          default: Date.now,
        },

        difficulty: String,
      },
    ],
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("User", userSchema);

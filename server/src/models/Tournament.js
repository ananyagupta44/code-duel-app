import mongoose from "mongoose";

const tournamentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["upcoming", "active", "finished"],
      default: "upcoming",
    },

    tournamentType: {
      type: String,
      enum: ["single-elimination", "double-elimination", "round-robin"],
      default: "single-elimination",
    },

    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    maxParticipants: {
      type: Number,
      default: 64,
    },

    matchIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Match",
      },
    ],

    bracket: [
      {
        round: Number,

        matches: [
          {
            matchId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Match",
            },

            player1Id: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
            },

            player2Id: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
            },

            winnerId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
              default: null,
            },
          },
        ],
      },
    ],

    winnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    currentRound: {
      type: Number,
      default: 0,
    },

    totalRounds: {
      type: Number,
      default: 0,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    registrationDeadline: {
      type: Date,
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard", "mixed"],
      default: "mixed",
    },

    prizePool: {
      type: String,
      default: "",
    },

    championBadge: {
      type: Boolean,
      default: false,
    },

    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Tournament", tournamentSchema);

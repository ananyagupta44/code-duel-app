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
    type: mongoose.Schema.Types.ObjectId,
    ref: "Problem",
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
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
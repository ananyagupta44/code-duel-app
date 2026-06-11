import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
    },

    language: String,

    status: String,

    passedCases: Number,

    totalCases: Number,
  },
  {
    timestamps: true,
  },
);

export default mongoose.model(
  "Submission",
  submissionSchema
);
import mongoose from "mongoose";

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },

    topic: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    timeLimit: {
      type: Number,
      default: 1, // seconds
    },

    testCases: [
      {
        input: {
          type: String,
          default: "",
        },

        expectedOutput: {
          type: String,
          required: true,
        },

        isHidden: {
          type: Boolean,
          default: false,
        },
      },
    ],

    starterCode: {
      javascript: {
        type: String,
        default: "",
      },

      python: {
        type: String,
        default: "",
      },

      cpp: {
        type: String,
        default: "",
      },
    },
    functionName: {
  type: String,
  required: true,
},

  },
 
  {
    timestamps: true,
  },
);

export default mongoose.model("Problem", problemSchema);

// models/Activity.js

import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    metadata: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Activity", activitySchema);

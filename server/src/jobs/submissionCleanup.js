// jobs/submissionCleanup.js

import Submission from "../models/Submission.js";

export const cleanupSubmissions = async () => {
  try {
    const cutoff = new Date();

    cutoff.setDate(cutoff.getDate() - 30);

    await Submission.deleteMany({
      verdict: {
        $ne: "Accepted",
      },

      createdAt: {
        $lt: cutoff,
      },
    });
  } catch (error) {
    console.log("Submission cleanup failed:", error);
  }
};

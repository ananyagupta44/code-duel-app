// jobs/matchSubmissionCleanup.js

import MatchSubmission from "../models/MatchSubmission.js";

export const cleanupMatchSubmissions = async () => {
  try {
    const oldDocs = await MatchSubmission.find()
      .sort({ createdAt: -1 })
      .skip(500)
      .select("_id");

    if (oldDocs.length) {
      await MatchSubmission.deleteMany({
        _id: {
          $in: oldDocs.map((d) => d._id),
        },
      });
    }
  } catch (error) {
    console.log("MatchSubmission cleanup failed:", error);
  }
};

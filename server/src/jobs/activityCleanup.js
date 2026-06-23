// jobs/activityCleanup.js

import Activity from "../models/Activity.js";

export const cleanupActivities = async () => {
  try {
    const oldActivities = await Activity.find()
      .sort({ createdAt: -1 })
      .skip(100)
      .select("_id");

    if (oldActivities.length > 0) {
      await Activity.deleteMany({
        _id: {
          $in: oldActivities.map((a) => a._id),
        },
      });
    }
  } catch (error) {
    console.log("Activity cleanup failed:", error);
  }
};

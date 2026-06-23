// utils/activityEmitter.js
import Activity from "../models/Activity.js";
import { io } from "../server.js";

export const logActivity = async ({
  type,
  message,
  userId = null,
  metadata = {},
}) => {
  const activity = await Activity.create({
    type,
    message,
    userId,
    metadata,
  });

  io.emit("activity:new", activity);

  return activity;
};

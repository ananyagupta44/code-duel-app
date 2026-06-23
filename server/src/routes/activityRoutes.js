// routes/activityRoutes.js

import express from "express";
import Activity from "../models/Activity.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const activities = await Activity.find().sort({ createdAt: -1 }).limit(100);

  res.json(activities);
});

export default router;

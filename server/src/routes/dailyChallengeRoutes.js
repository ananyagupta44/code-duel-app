// routes/dailyChallengeRoutes.js

import express from "express";
import {
  checkDailyAttempt,
  getDailyChallenge,
  startDailyChallenge,
  submitDailyChallenge,
} from "../controllers/dailyChallengeController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getDailyChallenge);

router.post("/start", protect, startDailyChallenge);

router.post("/submit", protect, submitDailyChallenge);

router.get("/:challengeId/attempted", protect, checkDailyAttempt);

export default router;

import express from "express";
import {
  getLeaderboardData,
  getMyLeaderboardStats,
} from "../controllers/leaderboardController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getLeaderboardData);
router.get("/me", protect, getMyLeaderboardStats);

export default router;

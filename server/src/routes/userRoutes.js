import express from "express";
import protect from "../middleware/authMiddleware.js";
import { getSolvedProblems } from "../controllers/codeController.js";
import { getLeaderboard, getMyProfile } from "../controllers/userController.js";
const router = express.Router();

router.get("/leaderboard", getLeaderboard);
router.get("/me/solved", protect, getSolvedProblems);
router.get("/profile", protect, getMyProfile);

export default router;

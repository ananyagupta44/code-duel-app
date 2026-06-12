import express from "express";
import { getLeaderboardData } from "../controllers/leaderboardController.js";

const router = express.Router();

router.get("/", getLeaderboardData);

export default router;
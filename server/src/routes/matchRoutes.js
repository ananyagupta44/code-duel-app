import express from "express";
import {
  acceptMatch,
  createMatch,
  getLobbyUsers,
  getMatchById,
  submitMatchSolution,
} from "../controllers/matchController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/", protect, createMatch);
router.get("/lobby", protect, getLobbyUsers);
router.post("/create", protect, createMatch);
router.get("/:matchId", getMatchById);
router.post("/:matchId/submit", protect, submitMatchSolution);
router.post("/:matchId/accept", protect, acceptMatch);

export default router;

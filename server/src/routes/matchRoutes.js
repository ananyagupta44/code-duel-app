import express from "express";
import {
  acceptMatch,
  createMatch,
  getLiveMatches,
  getLobbyUsers,
  getMatchById,
  getSpectateMatch,
  submitMatchSolution,
} from "../controllers/matchController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/", protect, createMatch);
router.get("/lobby", protect, getLobbyUsers);
router.post("/create", protect, createMatch);
router.get("/live", getLiveMatches);
router.get("/:matchId", getMatchById);

router.post("/:matchId/submit", protect, submitMatchSolution);
router.post("/:matchId/accept", protect, acceptMatch);
router.get("/spectate/:id", getSpectateMatch);

export default router;

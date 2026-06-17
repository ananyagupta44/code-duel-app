// routes/tournamentRoutes.js

import express from "express";
import { protect } from "../middleware/authMiddleware.js";

import {
  createTournament,
  joinTournament,
  getTournament,
  getTournaments,
  startTournament,
} from "../controllers/tournamentController.js";

const router = express.Router();

router.get("/", getTournaments);

router.post("/create", protect, createTournament);
router.post("/:id/start", protect, startTournament);
router.get("/:id/bracket", getTournament);
router.get("/:id", getTournament);
router.post("/:id/join", protect, joinTournament);

export default router;

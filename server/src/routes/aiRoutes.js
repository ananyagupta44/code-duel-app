// routes/aiRoutes.js

import express from "express";
import { createAiMatch } from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", protect, createAiMatch);

export default router;

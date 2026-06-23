import express from "express";

import { runCode, submitCode } from "../controllers/codeController.js";
import authMiddleware, { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/run", protect, runCode);

router.post("/submit/:problemId", authMiddleware, submitCode);

export default router;

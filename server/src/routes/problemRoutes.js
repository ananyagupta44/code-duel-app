import express from "express";

import {
  getProblems,
  getProblemById,
  getProblemTopics,
} from "../controllers/problemController.js";

const router = express.Router();

router.get("/", getProblems);
router.get("/topics", getProblemTopics);
router.get("/:id", getProblemById);

export default router;

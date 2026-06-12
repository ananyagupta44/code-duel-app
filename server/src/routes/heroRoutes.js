import express from "express";
import { getHeroStats } from "../controllers/heroController.js";

const router = express.Router();

router.get("/", getHeroStats);

export default router;

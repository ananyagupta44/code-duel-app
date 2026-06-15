// routes/profileRoutes.js

import express from "express";
import { getMyProfile } from "../controllers/userController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", protect, getMyProfile);

export default router;

import express from 'express';
import { runCode } from '../controllers/judgeController.js';

const router = express.Router();

router.post('/execute', runCode);

export default router;
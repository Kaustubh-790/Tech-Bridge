import express from "express";
import {
  startAssessment,
  submitAssessment,
} from "../../controller/assesmentController.js";
import { verifyToken } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/start", verifyToken, startAssessment);

router.post("/submit", verifyToken, submitAssessment);

export default router;

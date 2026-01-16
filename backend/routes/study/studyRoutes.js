import getStudyData from "../../controller/studyController.js";
import express from "express";

const router = express.Router();

router.post("/", getStudyData);

export default router;

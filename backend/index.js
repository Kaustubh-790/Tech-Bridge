import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

import userRoutes from "../backend/routes/user/userRoutes.js";
import assessmentRoutes from "../backend/routes/assesment/assesmentRoutes.js";
import studyRoutes from "../backend/routes/study/studyRoutes.js";
import { generateLearningPath } from "./controller/learningPathController.js";

dotenv.config();

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/user", userRoutes);
app.use("/api/assessment", assessmentRoutes);
app.use("/api/study-video", studyRoutes);
app.post("/api/learning-path", generateLearningPath);

app.get("/", (req, res) => {
  res.send("Tech Bridge API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

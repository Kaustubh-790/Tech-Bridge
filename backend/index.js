import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "../backend/routes/user/userRoutes.js";
import assessmentRoutes from "../backend/routes/assesment/assesmentRoutes.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/user", userRoutes);
app.use("/api/assessment", assessmentRoutes);

app.get("/", (req, res) => {
  res.send("Tech Bridge API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

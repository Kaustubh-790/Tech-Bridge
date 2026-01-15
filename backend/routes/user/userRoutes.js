import express from "express";
import { syncUser } from "../../controller/userController.js";
import { verifyToken } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/sync", verifyToken, syncUser);

export default router;

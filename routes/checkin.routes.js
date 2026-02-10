import express from "express";
import { checkinParticipant } from "../controllers/checkin.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Volunteer / Admin scan
router.post("/:rawToken", authMiddleware, checkinParticipant);

export default router;

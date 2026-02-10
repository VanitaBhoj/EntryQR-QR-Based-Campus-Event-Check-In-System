import express from "express";
import { getParticipantQRs, getEventStats, getParticipantByEmail } from "../controllers/qr.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";

const router = express.Router();

// Get all participant QRs for an event (Admin only)
router.get("/event/:eventId", authMiddleware, roleMiddleware("admin"), getParticipantQRs);

// Get event check-in stats (Admin only)
router.get("/stats/:eventId", authMiddleware, roleMiddleware("admin"), getEventStats);

// Get participant's own QR (public)
router.get("/display", getParticipantByEmail);

export default router;

import express from "express";
import { createEvent, getEvents } from "../controllers/event.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";

const router = express.Router();

// Admin only
router.post("/", authMiddleware, roleMiddleware("admin"), createEvent);
router.get("/", authMiddleware, roleMiddleware("admin"), getEvents);

export default router;

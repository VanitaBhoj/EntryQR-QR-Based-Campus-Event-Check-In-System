import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";
import {
  sendQREmailsToEvent,
  sendQREmailToParticipant,
  resendFailedEmails,
  getEmailStatus
} from "../controllers/sendmail.controller.js";

const router = express.Router();

// Protected routes - require admin authentication
router.use(authMiddleware);
router.use(roleMiddleware("admin"));

/**
 * Send QR code emails to all participants of an event
 * POST /api/mail/send/:eventId
 * Body: { notSentOnly: boolean } - if true, only send to participants who haven't received emails
 */
router.post("/send/:eventId", sendQREmailsToEvent);

/**
 * Send QR code email to a single participant
 * POST /api/mail/send-single
 * Body: { participantId: string }
 */
router.post("/send-single", sendQREmailToParticipant);

/**
 * Resend QR code emails to participants who didn't receive them
 * POST /api/mail/resend/:eventId
 */
router.post("/resend/:eventId", resendFailedEmails);

/**
 * Get email status for an event
 * GET /api/mail/status/:eventId
 */
router.get("/status/:eventId", getEmailStatus);

export default router;

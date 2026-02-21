import Participant from "../models/Participant.js";
import Event from "../models/Event.js";
import { sendQRMail, sendBulkQRMail } from "../utils/email.util.js";

/**
 * Send QR code emails to all participants of an event
 * POST /api/mail/send/:eventId
 */
export const sendQREmailsToEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { notSentOnly = true } = req.body;

    // Verify event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ 
        status: "error",
        message: "Event not found" 
      });
    }

    // Get participants
    let query = { eventId };
    if (notSentOnly) {
      query.emailSent = false;
    }

    const participants = await Participant.find(query).select(
      "email name qrImage emailSent"
    );

    if (participants.length === 0) {
      return res.status(200).json({
        status: "success",
        message: "No participants to send emails to",
        sent: 0,
        failed: 0
      });
    }

    // Send emails in bulk
    const participantsWithEventName = participants.map(p => ({
      ...p.toObject(),
      eventName: event.name
    }));

    const results = await sendBulkQRMail(participantsWithEventName);

    // Update database - mark emails as sent
    for (const email of results.sent) {
      await Participant.updateOne(
        { eventId, email },
        { emailSent: true }
      );
    }

    return res.status(200).json({
      status: "success",
      message: `Emails sent successfully to ${results.sent.length} participant(s)`,
      sent: results.sent.length,
      failed: results.failed.length,
      failedEmails: results.failed,
      eventName: event.name,
      eventId
    });

  } catch (error) {
    console.error("Error in sendQREmailsToEvent:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to send emails",
      error: error.message
    });
  }
};

/**
 * Send QR code email to a single participant
 * POST /api/mail/send-single
 */
export const sendQREmailToParticipant = async (req, res) => {
  try {
    const { participantId } = req.body;

    if (!participantId) {
      return res.status(400).json({
        status: "error",
        message: "Participant ID is required"
      });
    }

    const participant = await Participant.findById(participantId).select(
      "email name qrImage eventId"
    );

    if (!participant) {
      return res.status(404).json({
        status: "error",
        message: "Participant not found"
      });
    }

    const event = await Event.findById(participant.eventId);

    await sendQRMail({
      to: participant.email,
      name: participant.name,
      qrImage: participant.qrImage,
      eventName: event?.name || "Event"
    });

    // Mark email as sent
    await Participant.updateOne(
      { _id: participantId },
      { emailSent: true }
    );

    return res.status(200).json({
      status: "success",
      message: `Email sent successfully to ${participant.email}`,
      email: participant.email,
      participantName: participant.name
    });

  } catch (error) {
    console.error("Error in sendQREmailToParticipant:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to send email",
      error: error.message
    });
  }
};

/**
 * Resend QR code emails to participants who didn't receive it
 * POST /api/mail/resend/:eventId
 */
export const resendFailedEmails = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        status: "error",
        message: "Event not found"
      });
    }

    // Get participants who didn't receive emails
    const participants = await Participant.find({
      eventId,
      emailSent: false
    }).select("email name qrImage");

    if (participants.length === 0) {
      return res.status(200).json({
        status: "success",
        message: "All participants have received emails",
        resent: 0
      });
    }

    const participantsWithEventName = participants.map(p => ({
      ...p.toObject(),
      eventName: event.name
    }));

    const results = await sendBulkQRMail(participantsWithEventName);

    // Update database
    for (const email of results.sent) {
      await Participant.updateOne(
        { eventId, email },
        { emailSent: true }
      );
    }

    return res.status(200).json({
      status: "success",
      message: `Resent emails to ${results.sent.length} participant(s)`,
      resent: results.sent.length,
      failed: results.failed.length,
      failedEmails: results.failed
    });

  } catch (error) {
    console.error("Error in resendFailedEmails:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to resend emails",
      error: error.message
    });
  }
};

/**
 * Get email status for an event
 * GET /api/mail/status/:eventId
 */
export const getEmailStatus = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        status: "error",
        message: "Event not found"
      });
    }

    const participants = await Participant.find({ eventId }).select("emailSent");
    const total = participants.length;
    const sent = participants.filter(p => p.emailSent).length;
    const notSent = total - sent;

    return res.status(200).json({
      status: "success",
      eventName: event.name,
      eventId,
      totalParticipants: total,
      emailsSent: sent,
      emailsNotSent: notSent,
      percentage: total > 0 ? ((sent / total) * 100).toFixed(1) : 0
    });

  } catch (error) {
    console.error("Error in getEmailStatus:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to get email status",
      error: error.message
    });
  }
};

export default {
  sendQREmailsToEvent,
  sendQREmailToParticipant,
  resendFailedEmails,
  getEmailStatus
};
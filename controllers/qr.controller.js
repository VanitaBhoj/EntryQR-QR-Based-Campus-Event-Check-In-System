import Participant from "../models/Participant.js";
import Event from "../models/Event.js";

export const getParticipantQRs = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Verify event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Get all participants for this event with their QR images
    const participants = await Participant.find({ eventId })
      .select("name email studentId qrImage checkedIn checkedInAt")
      .sort({ createdAt: 1 });

    return res.json({
      eventId,
      eventName: event.name,
      totalParticipants: participants.length,
      checkedIn: participants.filter(p => p.checkedIn).length,
      participants: participants.map((p) => ({
        ...p.toObject(),
        // backward-compat for older clients
        checkinTime: p.checkedInAt
      }))
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getEventStats = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const participants = await Participant.find({ eventId });
    const checkedInCount = participants.filter(p => p.checkedIn).length;

    return res.json({
      eventName: event.name,
      totalParticipants: participants.length,
      checkedIn: checkedInCount,
      notCheckedIn: participants.length - checkedInCount,
      percentage: ((checkedInCount / participants.length) * 100).toFixed(1)
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getParticipantByEmail = async (req, res) => {
  try {
    const { email, eventId } = req.query;

    if (!email || !eventId) {
      return res.status(400).json({ message: "Email and eventId required" });
    }

    const participant = await Participant.findOne({ 
      email: email.toLowerCase(), 
      eventId 
    }).select("name email studentId qrImage checkedIn checkedInAt eventId");

    if (!participant) {
      return res.status(404).json({ message: "Participant not found" });
    }

    const obj = participant.toObject();
    return res.json({
      ...obj,
      // backward-compat
      checkinTime: obj.checkedInAt
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

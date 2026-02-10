import Event from "../models/Event.js";

export const createEvent = async (req, res) => {
  try {
    console.log("REQ.BODY:", req.body);
    console.log("REQ.USER:", req.user);

    const { name, slug, startTime, endTime, location } = req.body;

    const event = await Event.create({
      name,                 // 🔥 MUST MATCH MODEL
      slug,
      startTime,
      endTime,
      location,
      createdBy: req.user.id // 🔥 FIXED
    });

    res.status(201).json({
      message: "Event created",
      eventId: event._id   // 👈 THIS IS THE ID
  });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getEvents = async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 });

    return res.json(events);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

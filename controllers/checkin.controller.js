import crypto from "crypto";
import Participant from "../models/Participant.js";

export const checkinParticipant = async (req, res) => {
  try {
    const { rawToken } = req.params;

    if (!rawToken) {
      return res.status(400).json({ message: "QR token missing" });
    }

    // 1️⃣ Hash incoming token
    const qrTokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    // 2️⃣ Atomic check-in
    const participant = await Participant.findOneAndUpdate(
      {
        qrTokenHash,
        checkedIn: false
      },
      {
        checkedIn: true,
        checkedInAt: new Date()
      },
      { new: true }
    );

    // 3️⃣ Handle invalid or duplicate scan
    if (!participant) {
      const exists = await Participant.findOne({ qrTokenHash });

      if (exists && exists.checkedIn) {
        return res.status(409).json({
          status: "already_checked_in",
          name: exists.name
        });
      }

      return res.status(404).json({
        status: "invalid_qr"
      });
    }

    // 4️⃣ Success
    return res.json({
      status: "success",
      name: participant.name,
      studentId: participant.studentId,
      checkedInAt: participant.checkedInAt,
      // backward-compat for older frontends
      checkinTime: participant.checkedInAt
    });

  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

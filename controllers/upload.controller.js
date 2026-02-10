import Papa from "papaparse";
import crypto from "crypto";
import Participant from "../models/Participant.js";
import QRCode from "qrcode";
import { sendQRMail } from "../utils/email.util.js";

export const uploadParticipantsCSV = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "CSV file required" });
    }

    const csv = req.file.buffer.toString("utf8");

    const parsed = Papa.parse(csv, {
      header: true,
      skipEmptyLines: true
    });

    const rows = (parsed.data || []).map((r) => ({
      name: (r.name || "").trim(),
      email: (r.email || "").trim().toLowerCase(),
      studentId: (r.studentId || "").trim()
    }));

    const validRows = rows.filter((r) => r.name && r.email && r.studentId);
    const skippedInvalid = rows.length - validRows.length;

    // 🔹 STEP 1: generate token/hash + QR (QR contains ONLY rawToken)
    const ops = [];
    const candidates = [];

    for (const row of validRows) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const qrTokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

      // IMPORTANT: QR must contain rawToken only (NOT a URL)
      const qrImage = await QRCode.toDataURL(rawToken);

      candidates.push({
        eventId,
        name: row.name,
        email: row.email,
        studentId: row.studentId,
        qrTokenHash,
        qrImage
      });

      // Upsert by (eventId, studentId) so duplicates are ignored safely
      ops.push({
        updateOne: {
          filter: { eventId, studentId: row.studentId },
          update: { $setOnInsert: candidates[candidates.length - 1] },
          upsert: true
        }
      });
    }

    // 🔹 STEP 2: write (duplicates are ignored)
    const result = ops.length ? await Participant.bulkWrite(ops, { ordered: false }) : null;
    const insertedCount = result?.upsertedCount || 0;
    const upsertedIndexes = new Set((result?.getUpsertedIds?.() || []).map((x) => x.index));

    // 🔹 STEP 3: SEND EMAILS only for newly inserted participants
    const insertedParticipants = candidates.filter((_, idx) => upsertedIndexes.has(idx));
    for (const p of insertedParticipants) {
      try {
        await sendQRMail({
          to: p.email,
          name: p.name,
          qrImage: p.qrImage
        });

        await Participant.updateOne(
          { qrTokenHash: p.qrTokenHash },
          { emailSent: true }
        );
      } catch (emailErr) {
        console.log("Email skipped for:", p.email, emailErr.message);
        // Continue without failing - QR is still stored in DB
      }
    }

    // 🔹 STEP 4: response
    return res.status(201).json({
      message:
        "Participants processed. New participants inserted, duplicates ignored." +
        (insertedCount > 0 ? " Emails attempted for new inserts." : ""),
      inserted: insertedCount,
      skippedInvalid,
      totalRows: rows.length
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

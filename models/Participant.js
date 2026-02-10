import mongoose from "mongoose";

const participantSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true
    },

    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      lowercase: true
    },

    studentId: {
      type: String,
      required: true
    },

    qrTokenHash: {
      type: String,
      required: true,
      unique: true
    },
    qrImage: {
      type: String, // ✅ BASE64 STRING
      required: true
    },
     emailSent: {
    type: Boolean,
    default: false
  },
    checkedIn: {
      type: Boolean,
      default: false
    },

    checkedInAt: {
      type: Date
    }
  },
  { timestamps: true }
);
// Prevent duplicate participant per event
participantSchema.index(
  { eventId: 1, studentId: 1 },
  { unique: true }
);

// Fast admin search
participantSchema.index({ eventId: 1, email: 1 });

// Constant-time QR lookup
participantSchema.index({ qrTokenHash: 1 }, { unique: true });

// Dashboard filters
participantSchema.index({ eventId: 1, checkedIn: 1 });


export default mongoose.model("Participant", participantSchema);

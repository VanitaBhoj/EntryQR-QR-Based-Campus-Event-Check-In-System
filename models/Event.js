import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    location: {
      type: String,
      required: true
    },
    startTime: {
      type: Date,
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

// 🔍 Fast lookup by slug
eventSchema.index({ slug: 1 }, { unique: true });

export default mongoose.model("Event", eventSchema);

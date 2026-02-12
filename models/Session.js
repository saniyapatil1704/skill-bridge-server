//

import mongoose from "mongoose";
const sessionSchema = new mongoose.Schema({
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Match",
    required: true,
  },
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  learnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "confirmed", "completed"],
    default: "pending",
  },
  feedback: { type: String, default: "" },
  rating: { type: Number, default: 0 },
});

export const Session = mongoose.model("Session", sessionSchema);

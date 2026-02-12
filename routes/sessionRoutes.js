// import express from 'express';
// const router = express.Router();
// import Session from '../models/Session.js';

// router.post("/request", async (req, res) => {
//     const { requesterId, receiverId , skill } = req.body;
//         console.log("Request received:", { requesterId, receiverId, skill });

//     try {
//         const newSession = new Session({ requesterId, receiverId, skill });
//         await newSession.save();
//         res.status(201).json({ message: "Session requested successfully" });
//     } catch (err) {
//         res.status(500).json({  message: err.message});
//     }
// })

// export default router;

import express from "express";
const router = express.Router();
import { Session } from "../models/Session.js";
import User from "../models/User.js"; // If you're updating mentor rating
import { Match } from "../models/Match.js";


// POST

router.post("/request", async (req, res) => {
  const { matchId, mentorId, learnerId, date, time } = req.body;
  // console.log("Incoming Session Request:");
  // console.log("matchId:", matchId);
  // console.log("mentorId:", mentorId);
  // console.log("learnerId:", learnerId);
  // console.log("date:", date);
  // console.log("time:", time);
  try {
    const session = new Session({
      matchId,
      mentorId,
      learnerId,
      date,
      time,
    });

    await session.save();
    res
      .status(201)
      .json({ message: "Session requested successfully", session });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET

// Get all essions for a user (either as a mentor or learner)
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const sessions = await Session.find({
      $or: [{ mentorId: userId }, { learnerId: userId }],
    })
    .populate("matchId", "skillsMatched")

      .populate("mentorId", "user_name")
      .populate("learnerId", "user_name")
      .sort({ date: 1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch sessions" });
    console.error("Error creating session:", error);
  }
});

// PATCH
router.patch("/approve/:id", async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(
      req.params.id,
      { status: "confirmed" },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.json({ message: "Session approved successfully", session });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit feedback and rating
router.post("/feedback/:sessionId", async (req, res) => {
  const { feedback, rating } = req.body;
  console.log("📩 Feedback for session:", req.params.sessionId);

  try {

    if (!feedback || !rating) {
  return res.status(400).json({ message: "Feedback and rating are required" });
}

    // 1. Update the session with feedback
    const session = await Session.findByIdAndUpdate(
      req.params.sessionId,
      {
        feedback,
        rating,
        status: "completed"
      },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // 2. Calculate average rating for mentor
    const mentorSessions = await Session.find({
      mentorId: session.mentorId,
      status: "completed",
      rating: { $gt: 0 },
    });

    const totalRating = mentorSessions.reduce((acc, s) => acc + s.rating, 0);
    const avgRating = totalRating / mentorSessions.length;

    await User.findByIdAndUpdate(session.mentorId, {
      rating: avgRating.toFixed(1),
    });

    res.json({ message: "Feedback submitted", session });
  } catch (err) {
    console.error("❌ Feedback route error:", err.message);
    res.status(500).json({ message: "Something went wrong" });
  }
});
export default router;

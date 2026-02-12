import express from "express";
const router = express.Router();
// ✅ Correct
import authMiddleware from "../middleware/authMiddleware.js";
// const { default: User } = require("../models/User");
import User from "../models/User.js";

// Protected Route Example
router.get("/profile", authMiddleware, (req, res) => {
  res.json({ message: "Welcome to your profile!" });
});

// get user by ID
router.get("/:id", async (req , res) =>{
  try {
    const user = await User.findById(req.params.is).select("-user_password");
    if (!user) return res.status(404).json({ message: "User not found0" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
})


export default router;
import express from "express";
import bcrypt from "bcryptjs"; // ✅ clean
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// Register User

router.post("/register", async (req, res) => {
  const {
    user_name,
    user_email,
    user_password,
    user_skillsToTeach,
    user_skillsToLearn,
    user_role,
    rating,
  } = req.body;
  console.log("Request body:", req.body); // Log the incoming request body

  try {
    const userExists = await User.findOne({ user_email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(user_password, 10);
    console.log("Password received:", user_password);

    const newUser = new User({
      user_name,
      user_email,
      user_password: hashedPassword,
      user_skillsToTeach,
      user_skillsToLearn,
      user_role,
      rating,
    });
    console.log("Password received:", user_password);

    await newUser.save();

    res.status(201).json({ message: "User Registered Successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { user_email, user_password } = req.body;

  try {
    const user = await User.findOne({ user_email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(user_password, user.user_password);

    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

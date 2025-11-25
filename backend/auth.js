import express from "express";
import User from "./models/User.js";
import bcrypt from "bcryptjs"; // optional now, only needed if you hash manually
import jwt from "jsonwebtoken";

const router = express.Router();

// ---------------------- SIGNUP ----------------------
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered." });
    }

    const user = new User({
      name,
      email,
      password, // hashed automatically in userSchema
    });

    await user.save();

    res.status(201).json({ message: "Signup successful." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ---------------------- LOGIN ----------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    // Use the comparePassword method from the schema
    const valid = await user.comparePassword(password);
    if (!valid) return res.status(400).json({ message: "Invalid password." });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ message: "Login successful.", token });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;

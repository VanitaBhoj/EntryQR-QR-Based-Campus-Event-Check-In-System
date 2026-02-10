import User from "../models/User.js";
import { hashPassword, comparePassword } from "../utils/password.util.js";
import { generateToken } from "../utils/jwt.util.js";
import Event from "../models/Event.js";

/**
 * Admin Register (use once or restrict later)
 */
export const createEvent = async (req, res) => {
  try {
    const { name, slug, startTime } = req.body;

    const event = await Event.create({
      name,
      slug,
      startTime,
      createdBy: req.user.id
    });

    return res.status(201).json(event);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

export const getEvents = async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.user.id });
    return res.json(events);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const passwordHash = await hashPassword(password);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: "admin"
    });

    return res.status(201).json({
      message: "Admin registered successfully",
      userId: user._id
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Admin Login
 */
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken({
      id: user._id,
      role: user.role
    });

    return res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

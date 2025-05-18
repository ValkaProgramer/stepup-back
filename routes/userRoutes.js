const express = require("express");
const multer = require("multer");
const router = express.Router();
const { User } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_token_key";

const authenticateToken = require("../middleware/authenticateToken");

// Middleware to fetch the user and attach it to the request
const fetchUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    req.userDetails = user;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const username = req.userDetails.username;
    const fileExtension = file.originalname.split(".").pop(); // Get the file extension
    cb(null, `${username}.${fileExtension}`); // Save the file as "username.extension"
  },
});
const upload = multer({ storage });

// POST /api/register
router.post("/register", async (req, res) => {
  const { username, password, confirmPassword } = req.body;

  if (!username || !password || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    // Check for existing user
    const existing = await User.findOne({ where: { username } });
    if (existing) {
      return res.status(409).json({ message: "Username already taken" });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    await User.create({ username, passwordHash });

    return res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /api/login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  try {
    // Check if user exists
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: "Invalid username" });
    }

    // Compare password
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "30m" }
    );

    // Return token
    return res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error during login" });
  }
});

// GET /api/users/:id
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: ["id", "username", "email", "bio", "photo"],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/me
router.put(
  "/me",
  authenticateToken,
  fetchUser, // Fetch the user before processing the file upload
  upload.single("photo"),
  async (req, res) => {
    const userId = req.user.id;
    let { email, bio } = req.body;
    const photoPath = req.file ? `/uploads/${req.file.filename}` : null; // File path for the photo

    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (email === "") email = null;
      if (bio === "") bio = null;

      // Update only the fields that are provided
      const updatedFields = {};
      if (email !== undefined) updatedFields.email = email;
      if (bio !== undefined) updatedFields.bio = bio;
      if (photoPath) updatedFields.photo = photoPath;

      await user.update(updatedFields);

      return res
        .status(200)
        .json({ message: "Profile updated successfully", user });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to update profile" });
    }
  }
);

module.exports = router;

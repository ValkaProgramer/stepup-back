const express = require("express");
const router = express.Router();
const { User } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_token_key";

const authenticateToken = require("../middleware/authenticateToken");

// POST /api/register
router.post("/register", async (req, res) => {
  const { username, password, confirmPassword } = req.body;

  // 1. Basic validation
  if (!username || !password || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    // 2. Check for existing user
    const existing = await User.findOne({ where: { username } });
    if (existing) {
      return res.status(409).json({ message: "Username already taken" });
    }

    // 3. Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 4. Create user
    await User.create({ username, passwordHash });

    return res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /api/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // 1. Basic validation
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    // 2. Check if user exists
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username' });
    }

    // 3. Compare password
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // 4. Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '30m' }
    );

    // 5. Return token
    return res.status(200).json({ message: 'Login successful', token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error during login' });
  }
});

// GET /api/me
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["username"],
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

module.exports = router;

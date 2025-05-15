const express = require("express");
const router = express.Router();
const { Reminder } = require("../models");
const authenticateToken = require("../middleware/authenticateToken");

// GET /api/reminders - Get all reminders for the current user
router.get("/", authenticateToken, async (req, res) => {
  const userId = req.user.id; // Extract user ID from the decoded JWT

  try {
    // Fetch reminders for the current user
    const reminders = await Reminder.findAll({ where: { userId } });
    return res.status(200).json(reminders);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error while fetching reminders" });
  }
});

// POST /api/reminders - Create a new reminder
router.post("/", authenticateToken, async (req, res) => {
  const { time, activity, recurrence, status } = req.body;
  const userId = req.user.id;
  // 1. Basic validation
  if (!time || !activity) {
    return res
      .status(400)
      .json({ message: "Time, activity, and userId are required" });
  }

  try {
    // 2. Create reminder
    const newReminder = await Reminder.create({
      time,
      activity,
      recurrence,
      status,
      userId,
    });
    return res
      .status(201)
      .json({
        message: "Reminder created successfully",
        reminder: newReminder,
      });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error while creating reminder" });
  }
});

// PUT /api/reminders/:id - Update an existing reminder
router.put("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { time, activity, recurrence, status } = req.body;

  try {
    // 1. Find reminder by ID
    const reminder = await Reminder.findByPk(id);
    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    // 2. Update reminder
    reminder.time = time || reminder.time;
    reminder.activity = activity || reminder.activity;
    reminder.recurrence = recurrence || reminder.recurrence;
    reminder.status = status !== undefined ? status : reminder.status;

    await reminder.save();
    return res
      .status(200)
      .json({ message: "Reminder updated successfully", reminder });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error while updating reminder" });
  }
});

// DELETE /api/reminders/:id - Delete a reminder
router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Find reminder by ID
    const reminder = await Reminder.findByPk(id);
    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    // 2. Delete reminder
    await reminder.destroy();
    return res.status(200).json({ message: "Reminder deleted successfully" });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error while deleting reminder" });
  }
});

module.exports = router;

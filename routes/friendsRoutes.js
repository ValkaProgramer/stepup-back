const express = require("express");
const router = express.Router();
const { User, Friendship } = require("../models");
const authenticateToken = require("../middleware/authenticateToken");
const { Op } = require("sequelize");

// Fetch all friends of the logged-in user
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const friendships = await Friendship.findAll({
      where: {
        status: "accepted",
        [Op.or]: [{ userId1: userId }, { userId2: userId }],
      },
      include: [
        {
          model: User,
          as: "user1Details",
          attributes: ["id", "username", "photo", "email"],
        },
        {
          model: User,
          as: "user2Details",
          attributes: ["id", "username", "photo", "email"],
        },
      ],
    });

    const friends = friendships.map((friendship) => {
      const isUser1 = friendship.userId1 === userId;
      return isUser1 ? friendship.user2Details : friendship.user1Details;
    });

    res.json(friends);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch friends." });
  }
});

// Send a friend request
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user.id;

    // Check if a friendship already exists
    const existingFriendship = await Friendship.findOne({
      where: {
        [Op.or]: [
          { userId1: userId, userId2: friendId },
          { userId1: friendId, userId2: userId },
        ],
      },
    });

    if (existingFriendship) {
      return res.status(400).json({ message: "Friendship already exists." });
    }

    await Friendship.create({
      userId1: userId,
      userId2: friendId,
      status: "pending",
    });
    res.json({ message: "Friend request sent." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send friend request." });
  }
});


router.get("/requests", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const pendingRequests = await Friendship.findAll({
      where: {
        status: "pending",
        [Op.or]: [
          { userId1: userId }, // Requests sent by the logged-in user
          { userId2: userId }, // Requests received by the logged-in user
        ],
      },
      include: [
        {
          model: User,
          as: "user1Details", // Include sender details
          attributes: ["id", "username", "photo", "email"],
        },
        {
          model: User,
          as: "user2Details", // Include receiver details
          attributes: ["id", "username", "photo", "email"],
        },
      ],
    });

    res.json(pendingRequests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch pending requests." });
  }
});

// Confirm a friend request
router.put("/:friendshipId/confirm", authenticateToken, async (req, res) => {
  try {
    const { friendshipId } = req.params;
    const userId = req.user.id;

    const friendship = await Friendship.findOne({
      where: {
        id: friendshipId,
        userId2: userId, // Ensure the logged-in user is the receiver
        status: "pending",
      },
    });

    if (!friendship) {
      return res.status(404).json({ message: "Friend request not found." });
    }

    // Update the status to "accepted"
    friendship.status = "accepted";
    await friendship.save();

    res.json({ message: "Friend request accepted." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to confirm friend request." });
  }
});

// Reject a friend request
router.delete("/:friendshipId/reject", authenticateToken, async (req, res) => {
  try {
    const { friendshipId } = req.params;
    const userId = req.user.id;

    // Find the friendship
    const friendship = await Friendship.findOne({
      where: {
        id: friendshipId,
        [Op.or]: [
          { userId1: userId }, // Requests sent by the logged-in user
          { userId2: userId }, // Requests received by the logged-in user
        ],
        status: "pending",
      },
    });

    if (!friendship) {
      return res.status(404).json({ message: "Friend request not found." });
    }

    // Delete the friendship
    await friendship.destroy();

    res.json({ message: "Friend request rejected." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to reject friend request." });
  }
});

// Remove a friend
router.delete("/:friend_id", authenticateToken, async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user.id;

    // Delete the friendship
    await Friendship.destroy({
      where: {
        [Op.or]: [
          { userId1: userId, userId2: friendId },
          { userId1: friendId, userId2: userId },
        ],
      },
    });

    res.json({ message: "Friend removed successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to remove friend." });
  }
});

module.exports = router;

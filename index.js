const express = require("express");
const cors = require("cors");
const { Reminder } = require("./models");
const { sequelize } = require("./models");
const userRoutes = require("./routes/userRoutes");
const reminderRoutes = require("./routes/reminderRoutes");
const friendsRoutes = require("./routes/friendsRoutes");
const authenticateToken = require("./middleware/authenticateToken");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/friends", friendsRoutes);
app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => res.send("API is running"));

app.get("/events", authenticateToken, (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sendReminders = async () => {
    const now = new Date();
    const day = now.toLocaleString("en-US", { weekday: "short" });
    const time = now.toTimeString().slice(0, 5);
    const formattedNow = `${day} ${time}`;
    const reminders = await Reminder.findAll({
      where: { time: [formattedNow, time], status: true },
    });

    reminders.forEach((reminder) => {
      res.write(`data: ${JSON.stringify(reminder)}\n\n`);
    });
  };

  const now = new Date();
  const delay = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds());

  const timeout = setTimeout(() => {
    sendReminders();
    const interval = setInterval(sendReminders, 60000);
  

  req.on("close", () => {
    clearInterval(interval);
    clearTimeout(timeout);
    res.end();
    
  });
}, delay);
});

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  try {
    await sequelize.authenticate();
    console.log("Database connected");
  } catch (err) {
    console.error("Database connection failed:", err);
  }
});

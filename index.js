const express = require('express');
const cors = require('cors');
const bodyParser = require("body-parser");
const { sequelize } = require("./models"); // loads db connection from models/index.js
const userRoutes = require("./routes/userRoutes");
const reminderRoutes = require("./routes/reminderRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", userRoutes);
app.use("/api/reminders", reminderRoutes);

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => res.send('API is running'));

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  try {
    await sequelize.authenticate();
    console.log('Database connected');
  } catch (err) {
    console.error('Database connection failed:', err);
  }
});
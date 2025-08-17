const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory data store
let rewards = [];

// POST endpoint to add reward
app.post("/rewards", (req, res) => {
  const { name, points } = req.body;
  if (!name || !points) {
    return res.status(400).json({ error: "Name and points are required" });
  }

  const newReward = { name, points: parseInt(points) };
  rewards.push(newReward);
  res.status(201).json({ message: "Reward added", reward: newReward });
});

// GET endpoint to retrieve rewards
app.get("/rewards", (req, res) => {
  res.json(rewards);
});

// Leaderboard endpoint
app.get("/rewards/leaderboard", (req, res) => {
  const leaderboard = [...rewards].sort((a, b) => b.points - a.points);
  res.json(leaderboard);
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Backend server running at http://localhost:${PORT}`);
});

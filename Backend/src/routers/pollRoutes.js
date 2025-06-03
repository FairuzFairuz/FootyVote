import express from "express";
import pool from "../db/db.js";
import verifyToken from "../middleware/auth.js"; // Ensures authentication

const router = express.Router();

//Create a Poll (Admin & Advanced-Registered Users Only)
router.post("/create", verifyToken, async (req, res) => {
  const { title, category, options } = req.body;
  const { userId, role } = req.user;

  if (role !== "admin" && role !== "advanced_registered") {
    return res
      .status(403)
      .json({ message: "Only admins and advanced users can create polls" });
  }

  if (options.length > 3)
    return res.status(400).json({ message: "Max 3 options allowed" });

  try {
    const pollResult = await pool.query(
      "INSERT INTO polls (created_by, title, category, option_count) VALUES ($1, $2, $3, $4) RETURNING poll_id",
      [userId, title, category, options.length]
    );

    const pollId = pollResult.rows[0].poll_id;

    for (const optionText of options) {
      await pool.query(
        "INSERT INTO poll_options (poll_id, option_text) VALUES ($1, $2)",
        [pollId, optionText]
      );
    }

    res.status(201).json({ pollId, message: "Poll created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating poll", error });
  }
});

//Get Active Polls
router.get("/active", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM polls WHERE ends_at >= NOW() ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching polls", error });
  }
});

//Vote in a Poll (Registered Users Only)
router.post("/vote", verifyToken, async (req, res) => {
  const { pollId, optionId } = req.body;
  const { userId, role } = req.user;

  if (role === "guest")
    return res.status(403).json({ message: "Only registered users can vote" });

  try {
    const voteResult = await pool.query(
      "INSERT INTO votes (user_id, poll_id, option_id) VALUES ($1, $2, $3) ON CONFLICT (user_id, poll_id) DO NOTHING RETURNING *",
      [userId, pollId, optionId]
    );

    if (!voteResult.rows.length) {
      return res
        .status(400)
        .json({ message: "You have already voted in this poll" });
    }

    res.status(200).json({ message: "Vote submitted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error submitting vote", error });
  }
});

//Get Poll Results (Vote Count per Option)
router.get("/results/:pollId", async (req, res) => {
  const { pollId } = req.params;

  try {
    const result = await pool.query(
      "SELECT option_id, option_text, COUNT(v.vote_id) AS vote_count FROM poll_options po LEFT JOIN votes v ON po.option_id = v.option_id WHERE po.poll_id = $1 GROUP BY po.option_id, po.option_text",
      [pollId]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching poll results", error });
  }
});

// Protect Poll Creation Route
router.post("/create", verifyToken, async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "advanced_registered") {
    return res
      .status(403)
      .json({ message: "Only admins and advanced users can create polls" });
  }
});

// Voting restricted to registered users only
router.post("/vote", verifyToken, async (req, res) => {
  if (req.user.role === "guest") {
    return res.status(403).json({ message: "Only registered users can vote." });
  }
});

// Moderation restrict to admins only
router.post("/moderate", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Only admins can moderate comments." });
  }
});
export default router;

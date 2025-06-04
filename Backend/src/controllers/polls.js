import { pool } from "../db/db.js";

export const createPoll = async (req, res) => {
  try {
    const { title, category, options } = req.body;
    const { userId, role } = req.user;

    // Validate user role
    if (role !== "admin" && role !== "advanced_registered") {
      return res
        .status(403)
        .json({ message: "Only admins and advanced users can create polls" });
    }

    // Validate option count
    if (!options || options.length > 3) {
      return res.status(400).json({ message: "Max 3 options allowed" });
    }

    // Create Poll
    const pollResult = await pool.query(
      "INSERT INTO polls (created_by, title, category, option_count) VALUES ($1, $2, $3, $4) RETURNING poll_id",
      [userId, title, category, options.length]
    );

    const pollId = pollResult.rows[0].poll_id;

    // Insert Poll Options
    const optionQueries = options.map((optionText) =>
      pool.query(
        "INSERT INTO poll_options (poll_id, option_text) VALUES ($1, $2)",
        [pollId, optionText]
      )
    );
    await Promise.all(optionQueries); // Runs all insert operations in parallel

    res.status(201).json({ pollId, message: "Poll created successfully" });
  } catch (error) {
    console.error("Poll creation error:", error);
    res.status(500).json({ message: "Error creating poll", error });
  }
};

export const getPolls = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM polls WHERE ends_at >= NOW() ORDER BY created_at DESC"
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching polls:", error.message);
    res.status(500).json({ message: "Error fetching polls", error });
  }
};

export const votePoll = async (req, res) => {
  try {
    const { pollId, optionId } = req.body;
    const { userId, role } = req.user;

    // Validate user role
    if (role === "guest") {
      return res
        .status(403)
        .json({ message: "Only registered users can vote" });
    }

    // Insert vote, preventing duplicate votes
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
    console.error("Vote submission error:", error.message);
    res.status(500).json({ message: "Error submitting vote", error });
  }
};

export const getPollResults = async (req, res) => {
  try {
    const { pollId } = req.params;

    const result = await pool.query(
      `SELECT option_id, option_text, COUNT(v.vote_id) AS vote_count
       FROM poll_options po
       LEFT JOIN votes v ON po.option_id = v.option_id
       WHERE po.poll_id = $1
       GROUP BY po.option_id, po.option_text`,
      [pollId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching poll results:", error.message);
    res.status(500).json({ message: "Error fetching poll results", error });
  }
};

export const deletePoll = async (req, res) => {
  try {
    const { pollId } = req.params;
    const { role } = req.user; // Extract user role from token

    // Check if user is an admin
    if (role !== "admin") {
      return res.status(403).json({ message: "Only admins can delete polls" });
    }

    // Delete poll and associated options
    await pool.query("DELETE FROM poll_options WHERE poll_id = $1", [pollId]);
    const result = await pool.query(
      "DELETE FROM polls WHERE poll_id = $1 RETURNING *",
      [pollId]
    );

    // Check if poll existed
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Poll not found" });
    }

    res.status(200).json({ message: "Poll deleted successfully" });
  } catch (error) {
    console.error("Error deleting poll:", error.message);
    res.status(500).json({ message: "Error deleting poll", error });
  }
};

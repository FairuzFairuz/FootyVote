import { pool } from "../db/db.js";

// Add a Vote
export const addVote = async (req, res) => {
  try {
    const { poll_id, option_id } = req.body;
    const { userId } = req.user; // Retrieved from token

    // Prevent duplicate voting
    const existingVote = await pool.query(
      "SELECT * FROM votes WHERE user_id = $1 AND poll_id = $2",
      [userId, poll_id]
    );

    if (existingVote.rows.length) {
      return res
        .status(400)
        .json({ message: "You have already voted in this poll" });
    }

    // Insert vote
    const result = await pool.query(
      "INSERT INTO votes (user_id, poll_id, option_id) VALUES ($1, $2, $3) RETURNING *",
      [userId, poll_id, option_id]
    );

    res
      .status(201)
      .json({ message: "Vote recorded successfully", vote: result.rows[0] });
  } catch (error) {
    console.error("Error adding vote:", error.message);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// ✅ Get Poll Results (Vote Count)
export const getPollResults = async (req, res) => {
  try {
    const { pollId } = req.params;

    const results = await pool.query(
      "SELECT option_id, COUNT(*) AS vote_count FROM votes WHERE poll_id = $1 GROUP BY option_id",
      [pollId]
    );

    res.json({ pollId, results: results.rows });
  } catch (error) {
    console.error("Error fetching poll results:", error.message);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

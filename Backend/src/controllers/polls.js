import { pool } from "../db/db.js";
import { sequelize } from "../db/db.js";
import Poll from "../models/Poll.js";
import PollOption from "../models/PollOption.js";

//create poll
export const createPoll = async (req, res) => {
  const transaction = await sequelize.transaction();
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
    if (!options || options.length < 1 || options.length > 3) {
      return res.status(400).json({ message: "Poll must have 1 to 3 options" });
    }

    console.log("Received userId:", userId);
    // Fetch username
    const userResult = await pool.query(
      "SELECT username FROM users WHERE user_id = $1",
      [userId]
    );
    console.log("User query result:", userResult.rows);

    if (!userResult.rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const username = userResult.rows[0].username;

    // Create poll with correct `created_by`
    const poll = await Poll.create(
      {
        created_by: userId, // Ensure created_by stores username correctly
        title,
        category,
        option_count: options.length,
        ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      { transaction }
    );

    // Insert poll options
    await Promise.all(
      options.map((optionText) =>
        PollOption.create(
          { poll_id: poll.poll_id, option_text: optionText },
          { transaction }
        )
      )
    );

    await transaction.commit();
    res
      .status(201)
      .json({ pollId: poll.poll_id, message: "Poll created successfully" });
  } catch (error) {
    console.error("Poll creation error:", error);
    await transaction.rollback();
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

import { pool } from "../db/db.js";

//add comment in poll
export const addComment = async (req, res) => {
  try {
    const { pollId } = req.params;
    const { comment_text } = req.body;
    const { userId } = req.user;

    // Validate inputs
    if (!comment_text) {
      return res.status(400).json({ message: "Comment text is required" });
    }
    if (!pollId || isNaN(pollId)) {
      return res.status(400).json({ message: "Invalid poll ID" });
    }

    // Check if the poll exists
    const pollExists = await pool.query(
      "SELECT poll_id FROM polls WHERE poll_id = $1",
      [pollId]
    );
    if (!pollExists.rows.length) {
      return res.status(404).json({ message: "Poll not found" });
    }

    // Insert the comment
    const result = await pool.query(
      "INSERT INTO comments (poll_id, user_id, comment_text) VALUES ($1, $2, $3) RETURNING *",
      [pollId, userId, comment_text]
    );

    res
      .status(201)
      .json({ message: "Comment added successfully", comment: result.rows[0] });
  } catch (error) {
    console.error("Error adding comment:", error.message);
    res
      .status(500)
      .json({ message: "Error adding comment", error: error.message });
  }
};

//get comments for poll
export const getComments = async (req, res) => {
  try {
    const { pollId } = req.params;

    const result = await pool.query(
      `
  SELECT comments.comment_id, comments.poll_id, comments.user_id, comments.comment_text, users.username, users.role
  FROM comments 
  JOIN users ON comments.user_id = users.user_id 
  WHERE comments.poll_id = $1
`,
      [pollId]
    );
    res.json({ comments: result.rows });
  } catch (error) {
    console.error("Error fetching comments", error.message);
    res.status(500).json({ message: "Error fetching comments", error });
  }
};

//edit comment only by owner of the comment
export const editComment = async (req, res) => {
  console.log("editComment function is running!");
  console.log("Received request body:", req.body);
  console.log("Received request params:", req.params);

  try {
    const { commentId } = req.params;
    const { comment_text } = req.body;
    const { userId } = req.user;

    if (!comment_text) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    // Retrieve comment details
    const comment = await pool.query(
      "SELECT poll_id, user_id FROM comments WHERE comment_id = $1",
      [commentId]
    );
    console.log("Received commentId:", commentId);
    if (!comment.rows.length) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Ensure user can edit only their own comment
    if (comment.rows[0].user_id !== userId) {
      return res
        .status(403)
        .json({ message: "You can only edit your own comments" });
    }

    const pollId = comment.rows[0].poll_id;
    // Debugging log to verify correct poll ID retrieval
    console.log("Poll ID extracted from comment:", pollId);
    if (!pollId) {
      console.error("Error: pollId is undefined!");
      return res
        .status(500)
        .json({ message: "Internal error, pollId missing" });
    }

    // Confirm poll exists
    const pollExists = await pool.query(
      "SELECT poll_id FROM polls WHERE poll_id = $1",
      [pollId]
    );
    console.log("Poll Query Raw Result:", pollExists.rows);
    console.log("Poll query returned rows:", pollExists.rows.length);

    if (!pollExists.rows || pollExists.rows.length === 0) {
      return res.status(404).json({ message: "Poll not found" });
    }

    // Update the comment without unnecessary poll validation
    const result = await pool.query(
      "UPDATE comments SET comment_text = $1 WHERE comment_id = $2 RETURNING *",
      [comment_text, commentId]
    );

    res.json({
      message: "Comment updated successfully",
      comment: result.rows[0],
    });
  } catch (error) {
    console.error("Error editing comment:", error.message);
    res
      .status(500)
      .json({ message: "Error editing comment", error: error.message });
  }
};

// delete comment by admin or owners of comment
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { userId, role } = req.user;

    const comment = await pool.query(
      "SELECT * FROM comments WHERE comment_id = $1",
      [commentId]
    );

    if (!comment.rows.length) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.rows[0].user_id !== userId && role !== "admin") {
      return res.status(403).json({
        message: "You can only delete your own comments or be an admin",
      });
    }

    await pool.query("DELETE FROM comments WHERE comment_id = $1", [commentId]);

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error.message);
    res.status(500).json({ message: "Error deleting comment", error });
  }
};

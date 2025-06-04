import { pool } from "../db/db.js";

//add comment in poll
export const addComment = async (req, res) => {
  try {
    const { pollId } = req.params;
    const { comment_text } = req.body;
    const { userId } = req.user;

    if (!comment_text) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const result = await pool.query(
      "INSERT INTO comments (poll_id, user_id, comment_text) VALUES ($1, $2, $3) RETURNING *",
      [pollId, userId, comment_text]
    );

    res
      .status(201)
      .json({ message: "Comment added succesfully", comment: result.rows[0] });
  } catch (error) {
    console.error("Error adding comment:", error.message);
    res.status(500).json({ message: "Error adding comment", error });
  }
};

//get comments for poll
export const getComments = async (req, res) => {
  try {
    const { pollId } = req.params;

    const result = await pool.query(
      "SELECT c.comment.id, c.comment_text, c.created_at, u.username FROM comments c JOIN u ON c.user_id = u.user_id WHERE c.poll_id = $1 ORDER BY c.created_at ASC",
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
  try {
    const { commentId } = req.params;
    const { comment_text } = req.body;
    const { userId } = req.user;

    const comment = await pool.query(
      "SELECT * FROM comments WHERE comment_id = $1",
      [commentId]
    );

    if (!comment.rows.length) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.rows[0].user_id !== userId) {
      return res
        .status(403)
        .json({ message: "You can only edit your own comments" });
    }

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
    res.status(500).json({ message: "Error editing comment", error });
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
      return res
        .status(403)
        .json({
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

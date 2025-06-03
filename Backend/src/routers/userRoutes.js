import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db/db.js";
import verifyToken from "../middleware/auth.js";

const router = express.Router();

// Get all profiles
router.get("/profiles", async (req, res) => {
  try {
    const users = await AuthModel.find();

    const outputArray = [];
    for (const user of users) {
      outputArray.push({ username, role }); // control the data that returns back to app
    }
    res.json(outputArray);
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ status: "error", msg: "error getting users" });
  }
});

// Register new profile
router.post("/register", async (req, res) => {
  const { username, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    "INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *",
    [username, email, hashedPassword, role]
  );
  res.json(result.rows[0]);
});

//Update User Profile
router.put("/update-profile", verifyToken, async (req, res) => {
  const { username, email, password } = req.body;
  const { userId } = req.user;

  try {
    let hashedPassword = null;
    if (password) hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "UPDATE users SET username = COALESCE($1, username), email = COALESCE($2, email), password_hash = COALESCE($3, password_hash) WHERE user_id = $4 RETURNING *",
      [username, email, hashedPassword, userId]
    );

    res.json({ message: "Profile updated successfully", user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error });
  }
});

//Delete User Account
router.delete("/delete-account", verifyToken, async (req, res) => {
  const { userId } = req.user;

  try {
    await pool.query("DELETE FROM users WHERE user_id = $1", [userId]);
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting account", error });
  }
});

export default router;

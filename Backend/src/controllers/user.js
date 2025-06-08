import bcrypt from "bcrypt";
import { pool } from "../db/db.js";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

export const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check for existing user
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ status: "error", msg: "duplicate email" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const result = await pool.query(
      "INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *",
      [username, email, hashedPassword, role || "user"]
    );

    res.json({ status: "ok", user: result.rows[0] });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ status: "error", msg: "invalid registration" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const { id } = req.params;

    // Hash new password if provided
    let hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    // Construct update query dynamically
    const updateFields = [];
    const values = [];

    if (username) {
      updateFields.push("username = $" + (values.length + 1));
      values.push(username);
    }
    if (email) {
      updateFields.push("email = $" + (values.length + 1));
      values.push(email);
    }
    if (hashedPassword) {
      updateFields.push("password_hash = $" + (values.length + 1));
      values.push(hashedPassword);
    }
    if (role) {
      updateFields.push("role = $" + (values.length + 1));
      values.push(role);
    }

    if (updateFields.length === 0) {
      return res
        .status(400)
        .json({ status: "error", msg: "No valid fields provided" });
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE users SET ${updateFields.join(", ")} WHERE id = $${
        values.length
      } RETURNING *`,
      values
    );

    res.json({ status: "ok", user: result.rows[0] });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ status: "error", msg: "User update failed" });
  }
};

// Delete User
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params; // ✅ Ensure userId is coming from request parameters
    if (!userId) {
      return res.status(400).json({ status: "error", msg: "Missing user ID" });
    }

    const result = await pool.query(
      "DELETE FROM users WHERE user_id = $1 RETURNING *",
      [userId]
    );

    if (!result.rows.length) {
      return res
        .status(404)
        .json({ status: "error", msg: "User does not exist" });
    }

    res.json({ status: "success", msg: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error.message);
    res.status(500).json({ status: "error", msg: "Error deleting user" });
  }
};

//login user
export const login = async (req, res) => {
  try {
    console.log("Login attempt with:", req.body); // Debugging

    const { email, password } = req.body;

    // Find user in the database
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    console.log("Database query result:", result.rows); // Debugging

    if (result.rowCount === 0) {
      return res.status(401).json({ status: "error", msg: "Not authorised" });
    }

    const auth = result.rows[0];

    // Compare password hash
    const match = await bcrypt.compare(password, auth.password_hash);
    console.log("Password match result:", match); // Debugging

    if (!match) {
      console.log("Username or password error");
      return res.status(401).json({ status: "error", msg: "Login failed" });
    }

    // Create claims for JWT
    const claims = {
      userId: auth.user_id,
      username: auth.username,
      role: auth.role,
    };

    // Generate access & refresh tokens
    const access = jwt.sign(claims, process.env.ACCESS_SECRET, {
      expiresIn: "20m",
      jwtid: uuidv4(),
    });

    const refresh = jwt.sign(claims, process.env.REFRESH_SECRET, {
      expiresIn: "30d",
      jwtid: uuidv4(),
    });

    res.json({
      user: {
        userId: auth.user_id,
        username: auth.username,
        role: auth.role,
      },
      access,
      refresh,
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ status: "error", msg: "Login failed" });
  }
};

// refresh controller
export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken || typeof refreshToken !== "string") {
      return res
        .status(400)
        .json({ status: "error", msg: "Invalid refresh token format" });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    const claims = {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role,
    };

    // Generate new access token
    const accessToken = jwt.sign(claims, process.env.ACCESS_SECRET, {
      expiresIn: "20m",
      jwtid: uuidv4(),
    });

    res.json({ status: "success", accessToken });
  } catch (error) {
    console.error("Refresh token error:", error.message);

    if (error.name === "TokenExpiredError") {
      return res
        .status(403)
        .json({ status: "error", msg: "Refresh token expired" });
    }

    res
      .status(400)
      .json({ status: "error", msg: "Invalid or expired refresh token" });
  }
};

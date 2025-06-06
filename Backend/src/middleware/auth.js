import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ msg: "Access denied, token missing" });
  }

  const token = authHeader.split(" ")[1]; // Extract token
  try {
    const verified = jwt.verify(token, process.env.ACCESS_SECRET);
    console.log("Decoded Token Payload:", verified); // Debugging

    // Ensure required fields exist
    if (!verified.userId || !verified.role) {
      return res.status(403).json({ msg: "Invalid token payload" });
    }

    req.user = {
      userId: verified.userId,
      username: verified.username,
      role: verified.role,
    };

    console.log("Authenticated User:", req.user); // Debugging
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(403).json({ msg: "Invalid or expired token" });
  }
};

export const checkRole = (requiredRoles) => (req, res, next) => {
  if (!req.user || !req.user.role) {
    return res
      .status(403)
      .json({ message: "Access denied, missing user role" });
  }

  if (!requiredRoles.includes(req.user.role)) {
    return res
      .status(403)
      .json({ message: "Access denied, insufficient permissions" });
  }

  next(); // Proceed if role is allowed
};

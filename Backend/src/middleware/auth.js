import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token

  if (!token) {
    return res.status(403).json({ msg: "Access denied, token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next(); // Proceed to next middleware or controller
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    return res.status(403).json({ msg: "Invalid or expired token" });
  }
};

export const checkRole = (requiredRoles) => (req, res, next) => {
  if (!requiredRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied, insufficient permissions" });
  }
  next(); // Proceed if role is allowed
};

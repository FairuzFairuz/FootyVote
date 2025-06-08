import express from "express";
import { checkRole } from "../middleware/auth.js"; // Ensures authentication
import { verifyToken } from "../middleware/auth.js";
import {
  createPoll,
  deletePoll,
  getPollById,
  getPollResults,
  getPolls,
  votePoll,
} from "../controllers/polls.js";

const router = express.Router();

router.get("/active", getPolls);
router.post(
  "/create",
  verifyToken,
  checkRole(["admin", "advanced_registered"]),
  createPoll
);
router.post(
  "/vote",
  verifyToken,
  checkRole(["default_registered", "admin", "advanced_registered"]),
  votePoll
);
router.get("/results/:pollId", getPollResults);
router.delete("/delete/:pollId", verifyToken, checkRole(["admin"]), deletePoll);
router.get("/:pollId", getPollById);

export default router;

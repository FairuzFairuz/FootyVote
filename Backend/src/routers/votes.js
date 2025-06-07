import express from "express";
import { addVote, getPollResults } from "../controllers/votes.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/", verifyToken, addVote); // Add vote (POST `/votes`)
router.get("/:pollId", getPollResults); // Get poll results (GET `/votes/:pollId`)

export default router;

import express from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  addComment,
  deleteComment,
  editComment,
  getComments,
} from "../controllers/comments.js";

const router = express.Router();

router.post("/:pollId", verifyToken, addComment);
router.get("/:pollId", getComments);
router.post("/:commentId", verifyToken, editComment);
router.delete("/:commentId", verifyToken, deleteComment);

export default router;

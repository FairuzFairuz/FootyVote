import express from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  deleteUser,
  login,
  refresh,
  register,
  updateUser,
} from "../controllers/user.js";

const router = express.Router();

router.post("/register", register);
router.put("/update/:id", verifyToken, updateUser);
router.delete("/delete/:id", verifyToken, deleteUser);
router.post("/login", login);
router.post("/refreshtoken", refresh);

export default router;

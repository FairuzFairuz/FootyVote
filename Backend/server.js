import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./src/routers/userRoutes.js";
import pollRoutes from "./src/routers/pollRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("FootyVote API is running"));
app.use("/users", userRoutes);
app.use("/polls", pollRoutes);

console.log("Login route registered!")
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

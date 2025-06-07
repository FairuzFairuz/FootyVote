import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./src/routers/userRoutes.js";
import pollRoutes from "./src/routers/pollRoutes.js";
import comments from "./src/routers/comments.js";
import votes from "./src/routers/votes.js";
import { connectDB } from "./src/db/db.js";
import { syncModels } from "./src/db/db.js";
import { applyAssociations } from "./src/models/User.js";
import { applyVoteAssociations } from "./src/models/Vote.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("FootyVote API is running"));
app.use("/users", userRoutes);
app.use("/polls", pollRoutes);
app.use("/comments", comments);
app.use("/votes", votes);

// Ensure database connection and model sync before starting the server
const startServer = async () => {
  await connectDB(); // Connect to PostgreSQL & Sequelize
  applyAssociations();
  applyVoteAssociations();
  await syncModels(); // Sync models to ensure they exist in DB

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();

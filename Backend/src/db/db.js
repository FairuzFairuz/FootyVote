import { Pool } from "pg";
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Sequelize ORM Connection
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false, // Disable logging for cleaner console output
});

// Database Connection Function
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Sequelize connected successfully");
    await pool.connect();
    console.log("PostgreSQL pool connected");
  } catch (error) {
    console.error("Database connection error:", error.message);
    process.exit(1); // Exit on failure
  }
};

// Sync Sequelize Models on Startup
const syncModels = async () => {
  try {
    await sequelize.sync();
    console.log("Database models synced");
  } catch (error) {
    console.error("Error syncing models:", error.message);
  }
};

export { pool, sequelize, connectDB, syncModels };

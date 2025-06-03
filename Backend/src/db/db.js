import { Pool } from "pg";
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// Native PostgreSQL Pool (for raw queries)
const pool = new Pool({     // use pool to manage database connections more efficiently
  connectionString: process.env.DATABASE_URL,
});

// Sequelize ORM (for structured model management)
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false, // Disable SQL logging
});

export { pool, sequelize };

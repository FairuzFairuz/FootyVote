import { Pool } from "pg";
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
});

export { pool, sequelize }; //Named exports (NOT default)

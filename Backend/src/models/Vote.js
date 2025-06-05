import { DataTypes } from "sequelize";
import { sequelize } from "../db/db.js";

const Vote = sequelize.define(
  "Vote",
  {
    vote_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    poll_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    option_id: { type: DataTypes.INTEGER, allowNull: false }, // Tracks which option was voted for
  },
  { timestamps: true, tableName: "votes" }
);

export default Vote;

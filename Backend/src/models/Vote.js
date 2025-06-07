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

import Poll from "./Poll.js";
import { User } from "./User.js";
import PollOption from "./PollOption.js";
const applyVoteAssociations = () => {
  Vote.belongsTo(Poll, { foreignKey: "poll_id", onDelete: "CASCADE" });
  Vote.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });
  Vote.belongsTo(PollOption, { foreignKey: "option_id", onDelete: "CASCADE" });

  Poll.hasMany(Vote, { foreignKey: "poll_id" });
  User.hasMany(Vote, { foreignKey: "user_id" });
  PollOption.hasMany(Vote, { foreignKey: "option_id" });
};

export { Vote, applyVoteAssociations };

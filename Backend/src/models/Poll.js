import { DataTypes } from "sequelize";
import { sequelize } from "../db/db.js";
import Comment from "./Comment.js";
import Vote from "./Vote.js";

const Poll = sequelize.define(
  "Poll",
  {
    poll_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    category: { type: DataTypes.STRING },
    option_count: { type: DataTypes.INTEGER },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "user_id" },
    },
    createdAt: { type: DataTypes.DATE, field: "created_at" },
    updatedAt: { type: DataTypes.DATE },
  },
  { timestamps: true, tableName: "polls" }
);

// Poll-Comments Relationship (Polls have multiple comments)
Poll.hasMany(Comment, { foreignKey: "poll_id", onDelete: "CASCADE" });
Comment.belongsTo(Poll, { foreignKey: "poll_id" });

// Poll-Vote Relationship (Polls receive votes)
Poll.hasMany(Vote, { foreignKey: "poll_id", onDelete: "CASCADE" });
Vote.belongsTo(Poll, { foreignKey: "poll_id" });

export default Poll;

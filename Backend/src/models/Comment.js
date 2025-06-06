import { DataTypes } from "sequelize";
import { sequelize } from "../db/db.js";
import Poll from "../models/Poll.js";

const Comment = sequelize.define(
  "Comment",
  {
    comment_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    poll_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    comment_text: { type: DataTypes.TEXT, allowNull: false },
  },
  { timestamps: true, tableName: "comments" }
);

export default Comment;

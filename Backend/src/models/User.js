import { DataTypes } from "sequelize";
import { sequelize } from "../db/db.js";

const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, defaultValue: "default_registered" }, // Role system
  },
  { timestamps: true, tableName: "users" }
);

import Poll from "./Poll.js"; // ✅ Import related models
import Comment from "./Comment.js";
import { Vote } from "./Vote.js";

const applyAssociations = () => {
  User.hasMany(Poll, { foreignKey: "created_by", onDelete: "CASCADE" });
  Poll.belongsTo(User, { foreignKey: "created_by" });

  User.hasMany(Comment, { foreignKey: "user_id", onDelete: "CASCADE" });
  Comment.belongsTo(User, { foreignKey: "user_id" });

  User.hasMany(Vote, { foreignKey: "user_id", onDelete: "CASCADE" });
  Vote.belongsTo(User, { foreignKey: "user_id" });
};

export { User, applyAssociations };

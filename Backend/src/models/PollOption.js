import { sequelize } from "../db/db.js";
import { DataTypes } from "sequelize";

const PollOption = sequelize.define(
  "PollOption",
  {
    option_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    poll_id: { type: DataTypes.INTEGER, references: { model: "polls", key: "poll_id" } },
    option_text: { type: DataTypes.STRING, allowNull: false },
    createdAt: { type: DataTypes.DATE, field: "created_at" }, // ✅ Maps to created_at
    updatedAt: { type: DataTypes.DATE, field: "updated_at" }, // ✅ Maps to updated_at
  },
  { timestamps: true, tableName: "poll_options" }
);

export default PollOption;

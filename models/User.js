const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    profileImage: { type: String },
    preferences: {
      region: { type: String, required: true }, // e.g., a region name or identifier
      severity: { type: String, enum: ["Minor", "Moderate", "Severe", "Extreme"], required: true }, // predefined severity levels
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = { User, userSchema };

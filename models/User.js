const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    profileImage: { type: String },
    preferences:
      {
        state: { type: String },
        county: { type: String },
        severity: { type: String, enum: ["Minor", "Moderate", "Severe", "Extreme"] },
        _id: false, // Prevents automatic generation of _id for array elements
      },

    savedAlerts: [{ type: String }],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = { User, userSchema };

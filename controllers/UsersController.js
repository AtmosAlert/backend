const { User } = require("../models/User");
const bcrypt = require("bcryptjs");

const searchUser = async (req, res) => {
  const { searchQuery } = req.query;
  if (!searchQuery) return res.status(404).json({ message: "No search query" });
  try {
    const user = await User.find(
      {
        $or: [
          { name: { $regex: `^${searchQuery}` } },
          { email: { $regex: `^${searchQuery}` } },
        ],
      },
      "_id name email phone profileImage "
    );
    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json(error);
  }
};

const getUserById = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId).select("-password -updatedAt");
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).send({ message: "Failed to get user", error });
  }
};

const getMebyId = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -updatedAt"
    );
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).send({ message: "Failed to get user", error });
  }
};

const getAlertPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "preferences"
    );
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).send({ message: "Failed to get user", error });
  }
};

const updateMeById = async (req, res) => {
  try {
    const newUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        profileImage: req.body.profileImage,

      },
      { new: true }
    ).select("-password");

    if (!newUser) {
      throw { message: "User not found",code:404 }
    }

    return res.status(200).json({
      message: "Sucessfuly updated user",
      newUser,
      error: false,
    });
  } catch (error) {
    const statusCode = error.code || 500;
    return res.status(statusCode).json({
      message: error.message || "An unexpected error occurred",})
    }
}; 

const setAlertPreferences = async (req, res) => {
  try {
    const { state, county, severity } = req.body || {};

    if (!state) {
      throw {
        message: "State cannot be empty",
        code: 400,
      };
    }

    if (severity && !["Minor", "Moderate", "Severe", "Extreme"].includes(severity)) {
      throw {
        message: "Invalid Severity Level",
        code: 400,
      };
    }

    await User.findByIdAndUpdate(
      req.user.id,
      {
        preferences: {
          state,
          county,
          severity,
        },
      },
      { new: true }
    );

    return res.status(200).json({
      message: "Successfully updated alert preferences",
    });
  } catch (error) {
    const statusCode = error.code || 500;
    return res.status(statusCode).json({
      message: error.message || "An unexpected error occurred",});
  }
};


const resetPassword = async (req, res) => {
  const { newPassword, currentPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);
    const isPasswordMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordMatch) throw "wrong current";

    if (newPassword.length < 6) throw "short new";

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const newUser = await User.findByIdAndUpdate(req.user.id, {
      password: hashedPassword,
    });
    return res.status(200).json({
      message: "Sucessfuly updated password",
    });
  } catch (error) {
    if (error === "wrong current") {
      return res.status(400).send({
        message: "Current password is invalid",
      });
    }
    if (error === "short new") {
      return res.status(400).send({
        message: "New password is invalid",
      });
    }
    return res.status(400).send({
      message: "Failed to update password",
    });
  }
};

module.exports = {
  searchUser,
  getMebyId,
  updateMeById,
  resetPassword,
  getUserById,
  setAlertPreferences,
  getAlertPreferences
}
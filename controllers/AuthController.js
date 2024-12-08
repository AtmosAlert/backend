const { User } = require("../models/User");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res, next) => {
  const { password, email, phone, name} = req.body;

  const user = await User.find({ $or: [{ email: email }, { phone: phone }] });
  if (user.length > 0) {
    return res.status(409).json({
      message: "User already exists!",
    });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      preferences: {state:null,county:null},
      savedAlerts: []
    });
    await user.save();
    res.json({ message: "User Added Successfully" });
  } catch (err) {
    res.json({ err: err });
  }
};

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({
        message: "Missing username or password.",
      });
    }

    const user = await User.findOne({
      $or: [{ email: username }, { phone: username }],
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Invalid credentials. Please try again.",
      });
    }

    const token = jwt.sign(
      { id: user._id }, 
      process.env.ACCESS_TOKEN_SECRET, 
      // { expiresIn: "24h" }
    );

    const { password: _, ...userWithoutPassword } = user.toObject();

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "An error occurred while logging in.",
      error: error.message,
    });
  }
};


module.exports = { register, login };

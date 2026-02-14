const User = require("../models/User.model");
const bcrypt = require("bcryptjs");
const { emailValidator } = require("../utils/utils");

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Invalid inputs", success: "fail" });
    }

    if (!emailValidator(email)) {
      return res
        .status(400)
        .json({ message: "Invalid inputs", success: "fail" });
    }

    const exists = await findOne({ email });
    if (exists) {
      return res
        .status(409)
        .json({ message: "Email already registered", success: "fail" });
    }

    const passwordHash = await hash(password, 10);

    const user = await create({
      name,
      email,
      passwordHash,
    });

    res.status(201).json({
      message: "Account created successFully",
      success: "success",
      userId: user._id,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", success: "fail" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Invalid inputs", success: "fail" });
    }

    if (!emailValidator(email)) {
      return res
        .status(400)
        .json({ message: "Invalid inputs", success: "fail" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid credentials", success: "fail" });
    }

    const match = await compare(password, user.passwordHash);
    if (!match) {
      return res
        .status(401)
        .json({ message: "Invalid credentials", success: "fail" });
    }

    res.status(200).json({
      message: "Login successful",
      userId: user._id,
      name: user.name,
      email: user.email,
      currency: user.currency,
    });
  } catch {
    res.status(500).json({ message: "Server error", success: "fail" });
  }
};

exports.logout = async (req, res) => {
  res.json({ message: "Logged out successfully" });
};

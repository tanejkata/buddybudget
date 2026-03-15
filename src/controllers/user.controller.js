const User = require("../models/User.model");
const bcrypt = require("bcrypt");

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      message: "successful",
      data: {
        user,
      },
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, currency, profilePicture } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { name, currency, profilePicture },
      { new: true }
    ).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "user updated",
      data: {
        user,
      },
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

exports.toggleNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    user.notificationsEnabled = !user.notificationsEnabled;

    await user.save();

    res.json({
      notificationsEnabled: user.notificationsEnabled,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating notifications" });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // check old password
    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);

    if (!isMatch) {
      return res.status(400).json({ message: "Old password incorrect" });
    }

    // hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.passwordHash = hashedPassword;

    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Password update failed" });
  }
};

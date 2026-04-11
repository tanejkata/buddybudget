const User = require("../models/User.model.js");
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
    const { oldPassword, newPassword, mode } = req.body;

    const user = await User.findById(req.params.userId).select("+passwordHash");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // GOOGLE USER FIRST-TIME SET PASSWORD
    if (mode === "set") {
      if (user.hasPassword) {
        return res.status(400).json({
          message: "Password already exists. Please use change password.",
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      user.passwordHash = hashedPassword;
      user.hasPassword = true;

      await user.save();

      const updatedUser = await User.findById(user._id).select("-passwordHash");

      return res.json({
        message: "Password set successfully",
        user: updatedUser,
      });
    }

    // NORMAL CHANGE PASSWORD
    if (!oldPassword) {
      return res.status(400).json({
        message: "Old password is required",
      });
    }

    if (!user.passwordHash) {
      return res.status(400).json({
        message:
          "This account does not have a password yet. Please set one first.",
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);

    if (!isMatch) {
      return res.status(400).json({ message: "Old password incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.passwordHash = hashedPassword;
    user.hasPassword = true;

    await user.save();

    const updatedUser = await User.findById(user._id).select("-passwordHash");

    return res.json({
      message: "Password updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.log("Password update failed:", error);
    return res.status(500).json({ message: "Password update failed" });
  }
};

exports.updatePushToken = async (req, res) => {
  try {
    const { expoPushToken } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { expoPushToken: expoPushToken || "" },
      { new: true }
    ).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Push token updated",
      data: {
        user,
      },
    });
  } catch (error) {
    console.log("Update push token error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

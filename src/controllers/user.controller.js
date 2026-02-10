const User = require("../models/User.model");

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, currency } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { name, currency },
      { new: true }
    ).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User updated", user });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

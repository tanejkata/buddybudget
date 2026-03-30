const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    authProvider: {
      type: String,
      enum: ["email", "google"],
      default: "email",
    },

    googleId: {
      type: String,
      default: null,
    },

    hasPassword: {
      type: Boolean,
      default: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: function () {
        // ✅ only required for email users
        return this.authProvider === "email";
      },
      default: null,
    },

    currency: {
      type: String,
      default: "CAD",
    },

    profilePicture: {
      type: String,
      default: "",
    },

    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
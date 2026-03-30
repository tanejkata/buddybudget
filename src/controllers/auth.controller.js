import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { emailValidator } from "../utils/utils.js";
import User from "../models/User.model.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_WEB_CLIENT_ID);

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Invalid inputs",
        success: "fail",
      });
    }

    if (!emailValidator(email)) {
      return res.status(400).json({
        message: "Invalid email",
        success: "fail",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
        success: "fail",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const exists = await User.findOne({ email: normalizedEmail }).select(
      "-passwordHash"
    );

    if (exists) {
      return res.status(409).json({
        message: "Email already registered",
        success: "fail",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      authProvider: "email",
      hasPassword: true,
    });

    return res.status(201).json({
      message: "Account created successfully",
      success: "success",
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          currency: user.currency,
          profilePicture: user.profilePicture,
          notificationsEnabled: user.notificationsEnabled,
          authProvider: user.authProvider,
          googleId: user.googleId,
          hasPassword: user.hasPassword,
        },
      },
    });
  } catch (err) {
    console.log("Register error:", err);
    return res.status(500).json({
      message: "Server error",
      success: "fail",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Invalid inputs",
        success: "fail",
      });
    }

    if (!emailValidator(email)) {
      return res.status(400).json({
        message: "Invalid email",
        success: "fail",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
        success: "fail",
      });
    }

    if (!user.hasPassword || !user.passwordHash) {
      return res.status(401).json({
        message:
          "This account uses Google sign-in. Please set a password first or continue with Google.",
        success: "fail",
      });
    }

    const match = await bcrypt.compare(password, user.passwordHash);

    if (!match) {
      return res.status(401).json({
        message: "Invalid credentials",
        success: "fail",
      });
    }

    const userWithoutPassword = await User.findById(user._id).select(
      "-passwordHash"
    );

    return res.status(200).json({
      message: "Login successful",
      success: "success",
      data: {
        user: userWithoutPassword,
      },
    });
  } catch (err) {
    console.log("Login error:", err);
    return res.status(500).json({
      message: "Server error",
      success: "fail",
    });
  }
};

export const logout = async (req, res) => {
  return res.json({
    message: "Logged out successfully",
    success: "success",
  });
};

export const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "Missing Google token",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_WEB_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.email) {
      return res.status(400).json({
        success: false,
        message: "Invalid Google account",
      });
    }

    const email = payload.email.toLowerCase().trim();
    const name = payload.name || "";
    const googleId = payload.sub;
    const profilePicture = payload.picture || "";

    let user = await User.findOne({
      $or: [{ email }, { googleId }],
    });

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        profilePicture,
        authProvider: "google",
        hasPassword: false,
        passwordHash: null,
        currency: "CAD",
      });
    } else {
      if (!user.googleId) user.googleId = googleId;
      if (!user.profilePicture && profilePicture) {
        user.profilePicture = profilePicture;
      }
      user.authProvider = user.authProvider || "google";
      await user.save();
    }

    const userWithoutPassword = await User.findById(user._id).select(
      "-passwordHash"
    );

    return res.status(200).json({
      success: true,
      data: { user: userWithoutPassword },
    });
  } catch (error) {
    console.log("Google auth error:", error);
    return res.status(401).json({
      success: false,
      message: "Google authentication failed",
    });
  }
};

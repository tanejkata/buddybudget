import { OAuth2Client } from "google-auth-library";
import User from "../models/User.model";

const googleClient = new OAuth2Client(process.env.GOOGLE_WEB_CLIENT_ID);

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

    const email = payload.email.toLowerCase();
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
        password: null,
        currency: "CAD",
      });
    } else {
      if (!user.googleId) user.googleId = googleId;
      if (!user.profilePicture && profilePicture) {
        user.profilePicture = profilePicture;
      }
      if (!user.authProvider) user.authProvider = "google";
      await user.save();
    }

    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.log("Google auth error:", error);
    return res.status(401).json({
      success: false,
      message: "Google authentication failed",
    });
  }
};
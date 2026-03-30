const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  googleAuth,
} = require("../controllers/auth.controller.js");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/google", googleAuth);

module.exports = router;
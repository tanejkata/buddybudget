const express = require("express");
const router = express.Router();
const {
  getUser,
  updateUser,
  toggleNotifications,
  updatePassword,
} = require("../controllers/user.controller");

router.get("/:userId", getUser);
router.put("/:userId", updateUser);
router.patch("/:userId/notifications", toggleNotifications);
router.put("/:userId/change-password", updatePassword);

module.exports = router;

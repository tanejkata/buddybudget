const express = require("express");
const router = express.Router();
const {
  getUser,
  updateUser,
  toggleNotifications,
  updatePassword,
  updatePushToken
} = require("../controllers/user.controller");

router.get("/:userId", getUser);
router.put("/:userId", updateUser);
router.patch("/:userId/notifications", toggleNotifications);
router.put("/:userId/change-password", updatePassword);
router.put("/:userId/push-token", updatePushToken);
module.exports = router;

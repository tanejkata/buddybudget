const express = require("express");
const router = express.Router();
const {
  getInsights,
  markInsightRead,
  generateTodayInsight,
} = require("../controllers/insight.controller");

router.get("/:userId", getInsights);
router.post("/generate/:userId", generateTodayInsight);
router.put("/:id/read", markInsightRead);

module.exports = router;
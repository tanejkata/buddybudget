const express = require("express");
const router = express.Router();
const {
  setMonthlyBudget,
  getMonthlyBudget,
} = require("../controllers/budget.controller");

router.post("/", setMonthlyBudget);
router.get("/:userId/:month", getMonthlyBudget);

module.exports = router;

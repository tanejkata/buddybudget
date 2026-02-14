const Budget = require("../models/MonthlyBudget.model");

// CREATE or UPDATE Monthly Budget
exports.setMonthlyBudget = async (req, res) => {
  try {
    const { userId, month, totalBudget } = req.body;

    if (!userId || !month || !totalBudget) {
      return res
        .status(400)
        .json({ message: "Missing fields", success: "fail" });
    }

    if (isNaN(totalBudget) || Number(totalBudget) <= 0) {
      return res.status(400).json({
        message: "Enter a valid amount",
        success: "fail",
      });
    }
    const monthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
    if (!monthRegex.test(month)) {
      return res
        .status(400)
        .json({ message: "Month must be in YYYY-MM format", success: "fail" });
    }

    let budget = await Budget.findOne({ userId, month });

    if (budget) {
      budget.totalBudget = totalBudget;
      await budget.save();
      return res
        .status(200)
        .json({ message: "Monthly Budget Saved", success: "success", budget });
    }

    budget = await Budget.create({
      userId,
      month,
      totalBudget,
    });

    res
      .status(200)
      .json({ message: "Monthly Budget Saved", success: "success", budget });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// GET Monthly Budget
exports.getMonthlyBudget = async (req, res) => {
  try {
    const { userId, month } = req.params;

    const budget = await Budget.findOne({ userId, month });

    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    res.json(budget);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

const Budget = require("../models/MonthlyBudget.model");
const Transaction = require("../models/Transaction.model");

exports.setMonthlyBudget = async (req, res) => {
  try {
    const { userId, month, year, totalBudget } = req.body;

    const budget = await Budget.findOneAndUpdate(
      { userId, month, year },
      { totalBudget },
      { new: true, upsert: true }
    );

    res.json({
      message: "Budget saved successfully",
      data: budget,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to save budget",
    });
  }
};

exports.getMonthlyBudget = async (req, res) => {
  try {
    const { userId, year, month } = req.params;

    const budgetYear = year || new Date().getFullYear();

    const startDate = new Date(budgetYear, month - 1, 1);
    const endDate = new Date(budgetYear, month, 0, 23, 59, 59);

    const budget = await Budget.findOne({
      userId,
      month,
      year: budgetYear,
    });

    const transactions = await Transaction.find({
      userId,
      transactionType: "expense",
      transactionDate: {
        $gte: startDate,
        $lte: endDate,
      },
    }).lean();

    const totalBudget = budget?.totalBudget || 0;

    const spentAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

    const remainingAmount = totalBudget - spentAmount;

    const remainingPercent = totalBudget
      ? Math.round((remainingAmount / totalBudget) * 100)
      : 0;

    const categoryMap = {};

    for (const t of transactions) {
      if (!categoryMap[t.categoryId]) {
        categoryMap[t.categoryId] = {
          name: t.categoryId,
          transactions: 0,
          amount: 0,
          items: [],
        };
      }

      categoryMap[t.categoryId].transactions += 1;
      categoryMap[t.categoryId].amount += t.amount;

      categoryMap[t.categoryId].items.push({
        amount: t.amount,
        note: t.note,
        transactionDate: t.transactionDate,
      });
    }

    const breakdown = Object.values(categoryMap).map((c) => ({
      name: c.name,
      transactions: c.transactions,
      amount: c.amount,
      percentage: totalBudget
        ? Number(((c.amount / totalBudget) * 100).toFixed(1))
        : 0,
      items: c.items,
    }));

    res.json({
      totalBudget,
      spentAmount,
      remainingAmount,
      remainingPercent,
      categories: breakdown,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch budget",
    });
  }
};

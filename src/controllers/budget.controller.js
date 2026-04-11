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

    const budgetYear = Number(year) || new Date().getFullYear();
    const budgetMonth = Number(month);

    const startDate = new Date(budgetYear, budgetMonth - 1, 1);
    const endDate = new Date(budgetYear, budgetMonth, 0, 23, 59, 59, 999);

    const budget = await Budget.findOne({
      userId,
      month: budgetMonth,
      year: budgetYear,
    });

    const transactions = await Transaction.find({
      userId,
      transactionDate: {
        $gte: startDate,
        $lte: endDate,
      },
    }).lean();

    const totalBudget = Number(budget?.totalBudget || 0);

    let spentAmount = 0;
    let incomeAmount = 0;

    const categoryMap = {};

    for (const t of transactions) {
      const amount = Number(t.amount || 0);
      const type = t.transactionType || "expense";
      const key = `${type}__${t.categoryId}`;

      if (type === "income") {
        incomeAmount += amount;
      } else {
        spentAmount += amount;
      }

      if (!categoryMap[key]) {
        categoryMap[key] = {
          name: t.categoryId,
          transactionType: type,
          transactions: 0,
          amount: 0,
          items: [],
        };
      }

      categoryMap[key].transactions += 1;
      categoryMap[key].amount += amount;

      categoryMap[key].items.push({
        amount,
        note: t.note,
        transactionDate: t.transactionDate,
        transactionType: type,
      });
    }

    const remainingAmount = totalBudget - spentAmount;
    const remainingPercent = totalBudget
      ? Math.round((remainingAmount / totalBudget) * 100)
      : 0;

    const netAmount = incomeAmount - spentAmount;

    const breakdown = Object.values(categoryMap)
      .map((c) => ({
        name: c.name,
        transactionType: c.transactionType,
        transactions: c.transactions,
        amount: c.amount,
        percentage:
          c.transactionType === "expense" && totalBudget
            ? Number(((c.amount / totalBudget) * 100).toFixed(1))
            : 0,
        items: c.items,
      }))
      .sort((a, b) => {
        if (a.transactionType === b.transactionType) {
          return b.amount - a.amount;
        }
        return a.transactionType === "expense" ? -1 : 1;
      });

    res.json({
      totalBudget,
      spentAmount,
      incomeAmount,
      netAmount,
      remainingAmount,
      remainingPercent,
      categories: breakdown,
      transactions,
    });
  } catch (error) {
    console.log("Failed to fetch budget:", error);
    res.status(500).json({
      message: "Failed to fetch budget",
    });
  }
};
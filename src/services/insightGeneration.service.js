const User = require("../models/User.model");
const Budget = require("../models/MonthlyBudget.model");
const Transaction = require("../models/Transaction.model");
const Insight = require("../models/Insight.model");
const { generateDailyAIReview } = require("./aiReview.service");
const { sendPushNotification } = require("./pushNotification.service");

function getTodayPeriodKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
}

async function generateDailyInsightForUser(userId) {
  const user = await User.findById(userId);
  if (!user) return null;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  const budget = await Budget.findOne({
    userId,
    month,
    year,
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
        amount: 0,
        transactions: 0,
      };
    }

    categoryMap[key].amount += amount;
    categoryMap[key].transactions += 1;
  }

  const categories = Object.values(categoryMap).sort(
    (a, b) => b.amount - a.amount
  );

  const isOverBudget = spentAmount > totalBudget;
  const remainingAmount = Math.max(totalBudget - spentAmount, 0);
  const overBudgetAmount = isOverBudget ? spentAmount - totalBudget : 0;

  const aiReview = await generateDailyAIReview({
    userName: user.name,
    currency: user.currency || "CAD",
    totalBudget,
    spentAmount,
    incomeAmount,
    remainingAmount,
    overBudgetAmount,
    isOverBudget,
    categories,
    transactionCount: transactions.length,
  });

  const periodKey = getTodayPeriodKey();

  const insight = await Insight.findOneAndUpdate(
    {
      userId,
      periodKey,
      type: "ai_review",
    },
    {
      title: aiReview.title,
      message: aiReview.message,
      type: "ai_review",
      isRead: false,
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  if (user.notificationsEnabled && user.expoPushToken) {
    await sendPushNotification({
      expoPushToken: user.expoPushToken,
      title: "New AI Feedback Ready",
      body: "Open BuddyBudget to check your latest review.",
      data: {
        screen: "Insights",
        insightId: String(insight._id),
        type: "ai_review",
      },
    });
  }

  return insight;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateDailyInsightsForAllUsers() {
  const users = await User.find({});

  for (const user of users) {
    try {
      await generateDailyInsightForUser(user._id);
      await sleep(1200);
    } catch (error) {
      console.log(`Daily insight failed for user ${user._id}:`, error);
    }
  }
}

module.exports = {
  generateDailyInsightForUser,
  generateDailyInsightsForAllUsers,
};

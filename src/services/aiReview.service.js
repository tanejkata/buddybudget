const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function buildFallbackReview({
  spentAmount,
  incomeAmount,
  totalBudget,
  remainingAmount,
  isOverBudget,
  categories,
}) {
  const topExpense = (categories || [])
    .filter((c) => (c.transactionType || "expense") === "expense")
    .sort((a, b) => b.amount - a.amount)[0];

  if (isOverBudget) {
    return {
      title: "Budget Alert",
      message: `You are over budget this period. ${
        topExpense ? `${topExpense.name} is your biggest spending category.` : ""
      }`.trim(),
    };
  }

  if (incomeAmount > spentAmount) {
    return {
      title: "Good Progress",
      message: `You earned more than you spent. ${
        topExpense ? `${topExpense.name} is currently your top expense.` : ""
      }`.trim(),
    };
  }

  if (totalBudget > 0) {
    return {
      title: "Daily Budget Review",
      message: `You have $${remainingAmount.toFixed(
        2
      )} left in your budget. ${
        topExpense ? `${topExpense.name} is your highest spending category.` : ""
      }`.trim(),
    };
  }

  return {
    title: "Daily Review",
    message: "Your latest budget activity has been reviewed.",
  };
}

async function generateDailyAIReview({
  userName,
  currency = "CAD",
  totalBudget,
  spentAmount,
  incomeAmount,
  remainingAmount,
  overBudgetAmount,
  isOverBudget,
  categories,
  transactionCount,
}) {
  const safeCategories = (categories || []).map((c) => ({
    name: c.name,
    transactionType: c.transactionType || "expense",
    amount: Number(c.amount || 0),
    transactions: Number(c.transactions || 0),
  }));

  const prompt = `
You are writing a short daily budget review for a mobile budgeting app.

Write:
1. a short title (max 6 words)
2. a short message (max 2 sentences, practical and friendly)

Rules:
- Focus on today's/month-to-date financial situation.
- Mention budget status when relevant.
- Mention top spending or income category if useful.
- Keep it simple and natural.
- Do not use markdown.
- Return ONLY valid JSON with keys: title, message.

Data:
User name: ${userName || "Buddy"}
Currency: ${currency}
Total budget: ${totalBudget}
Spent amount: ${spentAmount}
Income amount: ${incomeAmount}
Remaining amount: ${remainingAmount}
Over budget amount: ${overBudgetAmount}
Is over budget: ${isOverBudget}
Transaction count: ${transactionCount}
Categories: ${JSON.stringify(safeCategories)}
`;

  try {
    const response = await openai.responses.create({
      model: "gpt-5-mini",
      input: prompt,
    });

    const text = response.output_text || "";

    try {
      const parsed = JSON.parse(text);
      return {
        title: String(parsed.title || "Daily AI Review").trim(),
        message: String(
          parsed.message || "Open the app to check your review."
        ).trim(),
      };
    } catch {
      return buildFallbackReview({
        spentAmount,
        incomeAmount,
        totalBudget,
        remainingAmount,
        isOverBudget,
        categories: safeCategories,
      });
    }
  } catch (error) {
    console.log("OpenAI daily review failed, using fallback:", error?.message);

    return buildFallbackReview({
      spentAmount,
      incomeAmount,
      totalBudget,
      remainingAmount,
      isOverBudget,
      categories: safeCategories,
    });
  }
}

module.exports = {
  generateDailyAIReview,
};
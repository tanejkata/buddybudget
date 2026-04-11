const Category = require("../models/Category.model.js"); // adjust path if needed

const defaultCategories = [
  { name: "Food", type: "expense" },
  { name: "Shopping", type: "expense" },
  { name: "Transport", type: "expense" },
  { name: "Housing", type: "expense" },
  { name: "Bills", type: "expense" },
  { name: "Health", type: "expense" },
  { name: "Entertainment", type: "expense" },
  { name: "Education", type: "expense" },
  { name: "Subscriptions", type: "expense" },
  { name: "Travel", type: "expense" },
  { name: "Gifts", type: "expense" },
  { name: "Other", type: "expense" },

  { name: "Salary", type: "income" },
  { name: "Freelance", type: "income" },
  { name: "Bonus", type: "income" },
  { name: "Refund", type: "income" },
  { name: "Gift", type: "income" },
  { name: "Investment", type: "income" },
  { name: "Side Hustle", type: "income" },
  { name: "Other", type: "income" },
];

async function seedCategories() {
  try {
    const existingDefaultCount = await Category.countDocuments({
      isDefault: true,
    });

    if (existingDefaultCount > 0) {
      console.log("Default categories already exist. Skipping seed.");
      return;
    }

    const categoriesToInsert = defaultCategories.map((item) => ({
      ...item,
      isDefault: true,
      userId: null,
    }));

    await Category.insertMany(categoriesToInsert);

    console.log("Default categories seeded successfully.");
  } catch (error) {
    console.log("Category seed error:", error);
  }
}

module.exports = seedCategories;
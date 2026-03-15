const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    month: {
      type: Number, 
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    totalBudget: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

budgetSchema.index({ userId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model("Budget", budgetSchema);

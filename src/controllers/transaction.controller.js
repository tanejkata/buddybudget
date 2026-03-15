const Transaction = require("../models/Transaction.model");

// CREATE TRANSACTION
exports.createTransaction = async (req, res) => {
  try {
    const {
      userId,
      categoryId,
      amount,
      transactionType,
      note,
      transactionDate,
    } = req.body;

    if (
      !userId ||
      !categoryId ||
      !amount ||
      !transactionType ||
      !transactionDate
    ) {
      return res
        .status(400)
        .json({ message: "Missing fields", sucess: "fail" });
    }

    if (isNaN(amount) || Number(amount) <= 0) {
      return res
        .status(400)
        .json({ message: "Amount must be positive number", sucess: "fail" });
    }

    if (!["income", "expense"].includes(transactionType)) {
      return res
        .status(400)
        .json({ message: "Invalid transaction type", sucess: "fail" });
    }

    const date = new Date(transactionDate);
    if (isNaN(date.getTime())) {
      return res
        .status(400)
        .json({ message: "Invalid transaction date", sucess: "fail" });
    }

    const transaction = await Transaction.create({
      userId,
      categoryId,
      amount: Number(amount),
      transactionType,
      note,
      transactionDate: date,
    });

    res.status(201).json({
      message: "Transaction created",
      sucess: "success",
      transaction,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", sucess: "fail" });
  }
};

// UPDATE TRANSACTION
exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, transactionType, note, transactionDate } = req.body;

    const updateData = {};

    if (amount !== undefined) {
      if (isNaN(amount) || Number(amount) <= 0) {
        return res
          .status(400)
          .json({ message: "Amount must be positive number", sucess: "fail" });
      }
      updateData.amount = Number(amount);
    }

    if (transactionType) {
      if (!["income", "expense"].includes(transactionType)) {
        return res
          .status(400)
          .json({ message: "Invalid transaction type", sucess: "fail" });
      }
      updateData.transactionType = transactionType;
    }

    if (transactionDate) {
      const date = new Date(transactionDate);
      if (isNaN(date.getTime())) {
        return res
          .status(400)
          .json({ message: "Invalid transaction date", sucess: "fail" });
      }
      updateData.transactionDate = date;
    }

    if (note !== undefined) {
      updateData.note = note;
    }

    const transaction = await Transaction.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!transaction) {
      return res
        .status(404)
        .json({ message: "Transaction not found", sucess: "fail" });
    }

    res.json({
      message: "Transaction updated",
      transaction,
      sucess: "success",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", sucess: "fail" });
  }
};

exports.getTransaction = async (req, res) => {
  try {
    const { id, userId, year, month, day, category } = req.query;

    // 1️⃣ Get single transaction
    if (id) {
      const transaction = await Transaction.findById(id);

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: "Transaction not found",
        });
      }

      return res.json({
        success: true,
        count: 1,
        transactions: [transaction],
      });
    }

    // 2️⃣ userId required for list
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const query = { userId };

    // 3️⃣ Filter by category
    if (category) {
      query.categoryId = category;
    }

    // 4️⃣ Date filtering
    if (year) {
      let start;
      let end;

      // Year only
      if (!month) {
        start = new Date(`${year}-01-01`);
        end = new Date(`${Number(year) + 1}-01-01`);
      }

      // Year + month
      else if (month && !day) {
        const m = String(month).padStart(2, "0");
        start = new Date(`${year}-${m}-01`);
        end = new Date(start);
        end.setMonth(end.getMonth() + 1);
      }

      // Year + month + day
      else if (month && day) {
        const m = String(month).padStart(2, "0");
        const d = String(day).padStart(2, "0");
        start = new Date(`${year}-${m}-${d}`);
        end = new Date(start);
        end.setDate(end.getDate() + 1);
      }

      query.transactionDate = {
        $gte: start,
        $lt: end,
      };
    }

    // 5️⃣ Fetch transactions
    const transactions = await Transaction.find(query).sort({
      transactionDate: -1,
    });

    res.json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
// DELETE TRANSACTION
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findByIdAndDelete(id);

    if (!transaction) {
      return res
        .status(404)
        .json({ message: "Transaction not found", sucess: "fail" });
    }

    res.json({ message: "Transaction deleted", sucess: "success" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

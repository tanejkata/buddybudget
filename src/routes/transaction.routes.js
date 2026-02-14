const express = require("express");
const router = express.Router();
const {
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransaction,
} = require("../controllers/transaction.controller");

router.post("/", createTransaction);
router.get("/", getTransaction);
router.put("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);

module.exports = router;

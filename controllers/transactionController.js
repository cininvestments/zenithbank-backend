const User = require("../models/User");

// Get user transactions by account number
exports.getUserTransactions = async (req, res) => {
  const { accountNumber } = req.params;

  try {
    const user = await User.findOne({ accountNumber });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ transactionHistory: user.transactionHistory });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
};

// Update transaction status
exports.updateTransactionStatus = async (req, res) => {
  const { transactionId } = req.params;
  const { status } = req.body;

  if (!status || typeof status !== "string") {
    return res.status(400).json({ error: "Invalid or missing status" });
  }

  try {
    const user = await User.findOne({
      "transactionHistory.transactionId": transactionId,
    });
    if (!user) return res.status(404).json({ error: "Transaction not found" });

    const transaction = user.transactionHistory.find(
      (t) => t.transactionId === transactionId
    );

    if (!transaction) {
      return res
        .status(404)
        .json({ error: "Transaction not found for this user" });
    }

    transaction.status = status;
    await user.save();

    res
      .status(200)
      .json({ message: "Transaction status updated", transaction });
  } catch (err) {
    res.status(500).json({ error: "Failed to update status" });
  }
};

// Delete transaction
exports.deleteTransaction = async (req, res) => {
  const { transactionId } = req.params;

  try {
    const user = await User.findOne({
      "transactionHistory.transactionId": transactionId,
    });
    if (!user) return res.status(404).json({ error: "Transaction not found" });

    const existingTransaction = user.transactionHistory.find(
      (t) => t.transactionId === transactionId
    );
    if (!existingTransaction) {
      return res
        .status(404)
        .json({ error: "Transaction not found for this user" });
    }

    user.transactionHistory = user.transactionHistory.filter(
      (t) => t.transactionId !== transactionId
    );

    await user.save();
    res.status(200).json({ message: "Transaction deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete transaction" });
  }
};

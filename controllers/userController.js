const User = require("../models/User");
const { v4: uuidv4 } = require("uuid");

exports.createUser = async (req, res) => {
  try {
    const newUser = new User(); // Create an empty user document
    await newUser.save();
    res.status(201).json({ userId: newUser._id });
  } catch (error) {
    console.log("Error in creating user:", error);
    res.status(400).json({ error: error.message });
  }
};

// New method to update user's personal information
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const updatedInfo = req.body;

    // Don't enforce all fields, just update whatever is provided
    const updatedUser = await User.findByIdAndUpdate(userId, updatedInfo, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json({
      message: "User information updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error in updating user:", error);
    res.status(400).json({ error: error.message });
  }
};

// Get user information based on account number
exports.getUserByAccountNumber = async (req, res) => {
  try {
    const { accountNumber } = req.params;

    // Find user by account number
    const user = await User.findOne({ accountNumber });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Return user info (omit sensitive fields like password)
    const {
      firstName,
      middleName,
      lastName,
      title,
      occupation,
      phoneNumber,
      maritalStatus,
      emailAddress,
      stateOfOrigin,
      stateOfResidence,
      houseAddress,
      nextOfKin,
      accountNumber: accNo,
      accountBalance,
      transactionHistory,
      createdAt,
    } = user;

    res.status(200).json({
      firstName,
      middleName,
      lastName,
      title,
      occupation,
      phoneNumber,
      maritalStatus,
      emailAddress,
      stateOfOrigin,
      stateOfResidence,
      houseAddress,
      nextOfKin,
      accountNumber: accNo,
      accountBalance,
      transactionHistory,
      createdAt,
    });
  } catch (error) {
    console.error("Error fetching user by account number:", error);
    res.status(500).json({ error: error.message });
  }
};

// Verify user password
exports.verifyPassword = async (req, res) => {
  try {
    const { accountNumber, password } = req.body;

    // Find the user by account number
    const user = await User.findOne({ accountNumber });

    if (!user) {
      return res.status(404).json({ error: "Account not found." });
    }

    // Compare the entered password with the stored password
    if (user.password === password) {
      res.status(200).json({ message: "Password is correct." });
    } else {
      res.status(400).json({ error: "Incorrect password." });
    }
  } catch (error) {
    console.error("Error verifying password:", error);
    res.status(500).json({ error: "Server error. Please try again." });
  }
};

// Check account by account number
exports.checkAccountNumber = async (req, res) => {
  const { accountNumber } = req.params;

  try {
    const user = await User.findOne({ accountNumber });

    if (!user) {
      return res.status(404).json({ error: "Account not found" });
    }

    const fullName = `${user.firstName} ${user.middleName} ${user.lastName}`;
    res.status(200).json({ fullName });
  } catch (error) {
    console.error("Account lookup error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update user balance
exports.updateBalance = async (req, res) => {
  const { accountNumber } = req.params;
  const { amount } = req.body; // Amount to deduct

  try {
    const updatedUser = await User.findOneAndUpdate(
      { accountNumber },
      { $inc: { accountBalance: -amount } }, // Decrement the balance
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating balance" });
  }
};

// Method to set or verify transaction PIN
exports.setOrVerifyTransactionPin = async (req, res) => {
  try {
    const { accountNumber, transactionPin } = req.body;

    // Find user by account number
    const user = await User.findOne({ accountNumber });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (user.transactionPin) {
      // If transactionPin already exists, verify the entered PIN
      if (user.transactionPin === transactionPin) {
        return res.status(200).json({ message: "PIN is correct." });
      } else {
        return res.status(400).json({ error: "Incorrect PIN." });
      }
    } else {
      // If no transactionPin, it's the first time setting it
      user.transactionPin = transactionPin;
      await user.save();

      return res.status(201).json({
        message: "Transaction PIN set successfully.",
        user: {
          accountNumber: user.accountNumber,
        },
      });
    }
  } catch (error) {
    console.error("Error setting or verifying transaction PIN:", error);
    res.status(500).json({ error: "Server error. Please try again." });
  }
};

// Record a new transfer
exports.recordTransaction = async (req, res) => {
  try {
    const {
      senderAccount,
      recipientAccount,
      amount,
      transactionId,
      status,
      date, // optional
    } = req.body;

    const user = await User.findOne({ accountNumber: senderAccount });
    if (!user) {
      return res.status(404).json({ error: "Sender not found" });
    }

    const transaction = {
      transactionId,
      type: "transfer",
      amount,
      recipientAccount,
      status: status || "pending",
      date: date ? new Date(date) : new Date(),
    };

    user.transactionHistory.unshift(transaction); // add to front
    await user.save();

    res.status(200).json({
      message: "Transaction recorded successfully.",
      transaction,
    });
  } catch (err) {
    console.error("Transaction error:", err);
    res.status(500).json({ error: "Transaction could not be recorded." });
  }
};

exports.getTransactionHistory = async (req, res) => {
  try {
    const { accountNumber } = req.params;
    const user = await User.findOne({ accountNumber });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json(user.transactionHistory.reverse()); // latest first
  } catch (err) {
    console.error("Error fetching history:", err);
    res.status(500).json({ error: "Unable to fetch transaction history" });
  }
};

exports.updateTransactionStatus = async (req, res) => {
  try {
    const { accountNumber, transactionId } = req.params;
    const { status } = req.body;

    const user = await User.findOne({ accountNumber });
    if (!user) return res.status(404).json({ error: "User not found" });

    const txn = user.transactionHistory.find(
      (tx) => tx.transactionId === transactionId
    );
    if (!txn) return res.status(404).json({ error: "Transaction not found" });

    txn.status = status;
    await user.save();

    res
      .status(200)
      .json({ message: "Transaction status updated", transaction: txn });
  } catch (err) {
    console.error("Error updating status:", err);
    res.status(500).json({ error: "Failed to update transaction status" });
  }
};

// Reset user password
exports.resetPassword = async (req, res) => {
  try {
    const { accountNumber, newPassword } = req.body;

    // Check if account exists
    const user = await User.findOne({ accountNumber });
    if (!user) {
      return res.status(404).json({ error: "Account number does not exist." });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "Server error. Please try again." });
  }
};

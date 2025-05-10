// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const transactionController = require("../controllers/transactionController");

// Admin routes
router.post("/signup", adminController.signup);
router.post("/login", adminController.login);
router.post("/change-password", adminController.changePassword);

router.get("/users", adminController.getAllUsers);
router.put("/user/:accountNumber", adminController.updateUser);
router.get("/user/:accountNumber", adminController.getUserByAccountNumber);
// Add these routes after other admin routes
router.post("/check-email", adminController.checkAdminEmailExists);
router.post(
  "/change-password-email-only",
  adminController.changeAdminPasswordByEmail
);

router.delete("/delete-user-by-id/:id", adminController.deleteUserById);

// Transaction routes
router.get(
  "/user/:accountNumber/transactions",
  transactionController.getUserTransactions
);

router.put(
  "/transaction/:transactionId/status",
  transactionController.updateTransactionStatus
);
router.delete(
  "/transaction/:transactionId",
  transactionController.deleteTransaction
);

module.exports = router;

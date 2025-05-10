const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/create", userController.createUser); // Create new user
router.put("/update/:userId", userController.updateUser); // Update user information
router.get("/account/:accountNumber", userController.getUserByAccountNumber);
router.post("/verify-password", userController.verifyPassword);
router.get("/check-account/:accountNumber", userController.checkAccountNumber);
router.patch("/update-balance/:accountNumber", userController.updateBalance);
router.post("/set-or-verify-pin", userController.setOrVerifyTransactionPin); // Set or verify transaction PIN
router.post("/reset-password", userController.resetPassword);

router.post("/transactions", userController.recordTransaction);
router.get(
  "/transactions/:accountNumber",
  userController.getTransactionHistory
);
router.put(
  "/transactions/:accountNumber/:transactionId",
  userController.updateTransactionStatus
);

module.exports = router;

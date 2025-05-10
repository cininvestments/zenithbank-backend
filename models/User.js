const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  accountNumber: { type: String, unique: true, sparse: true },
  password: String,
  firstName: String,
  middleName: String,
  lastName: String,
  occupation: String,
  phoneNumber: String,
  ssn: String,
  dob: String,
  maritalStatus: String,
  emailAddress: String,
  stateOfOrigin: String,
  stateOfResidence: String,
  houseAddress: String,
  nextOfKin: String,
  accountBalance: { type: Number, default: 0 },
  transactionPin: { type: String },
  transactionHistory: [
    {
      transactionId: String,
      type: { type: String, enum: ["deposit", "withdrawal", "transfer"] },
      amount: Number,
      recipientAccount: String, // New
      date: { type: Date, default: Date.now },
      status: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending",
      }, // New
    },
  ],
});

module.exports = mongoose.model("User", userSchema);

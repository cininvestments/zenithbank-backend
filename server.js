require("dotenv").config();
const express = require("express");
const cors = require("cors");
const https = require("https");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// Connect to MongoDB
connectDB();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// User-related routes 
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

// Ping route to keep server awake
app.get("/api/ping", (req, res) => {
  res.status(200).json({ message: "Server is awake!" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

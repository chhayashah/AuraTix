// Load environment variables
require("dotenv").config();
require("./src/config/redis");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Import routes & worker
const apiRoutes = require("./src/routes/api.routes");
const app = express();

// Middlewares
app.use(cors()); // Frontend (React) ko connect hone dega
app.use(express.json()); // JSON payload parse karega

// const paymentRoutes = require("./routes/payment.routes");
// app.use("/api/payments", paymentRoutes);

// Base Route
app.use("/api/v1", apiRoutes);

// 404 Route handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Database Connection & Server Start
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database Connection Failed:", err.message);
    process.exit(1);
  });
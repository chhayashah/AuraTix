require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");

// Import configurations and workers
require("./src/config/redis");
require("./src/workers/seatReclaim");

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// 👇 Aapke actual folder structure ke hisaab se routes 👇
const apiRoutes = require("./src/routes/api.routes");
const paymentRoutes = require("./src/routes/payment.routes");

// HTTP Server banayein Socket.io ke liye
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Socket connection listener
io.on("connection", (socket) => {
  console.log(`🔌 A user connected (Socket ID: ${socket.id})`);

  socket.on("disconnect", () => {
    console.log(`User disconnected (Socket ID: ${socket.id})`);
  });
});

app.set("io", io);

// API Routes ko use karein
app.use("/api/v1", apiRoutes);
app.use("/api/payments", paymentRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

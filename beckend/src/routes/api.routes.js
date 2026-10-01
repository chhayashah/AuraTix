const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");

// Existing controllers
const { lockAndBookTickets } = require("../controllers/booking.controller");
const { validateEntry } = require("../controllers/entry.controller");

// Updated Payment Controllers
const {
  createOrder,
  verifyPayment,
} = require("../controllers/payment.controller");

// Auth & Event controllers
const { registerUser, loginUser } = require("../controllers/auth.controller");
const {
  createEvent,
  getAllEvents,
} = require("../controllers/event.controller");

// =======================
// AUTH ROUTES
// =======================
router.post("/auth/signup", registerUser);
router.post("/auth/login", loginUser);

// =======================
// EVENT ROUTES
// =======================
router.get("/events", getAllEvents);
router.post("/events", protect, createEvent);

// =======================
// BOOKING & PAYMENT ROUTES
// =======================
router.post("/bookings/lock", protect, lockAndBookTickets);

// Naye backend Razorpay routes (Purane webhook ko replace kar diya)
router.post("/payments/create-order", createOrder);
router.post("/payments/verify", verifyPayment);

// =======================
// ORGANIZER ENTRY ROUTES
// =======================
router.post("/organizer/validate-entry", protect, validateEntry);

module.exports = router;

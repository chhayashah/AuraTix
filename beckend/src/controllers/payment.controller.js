const Razorpay = require("razorpay");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const Booking = require("../models/Booking");
const redis = require("../config/redis"); // Redis imported

// Razorpay Initialization
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 1. Create Razorpay Order
exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100, // Rupees ko paise mein convert kiya
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return res
        .status(500)
        .json({ success: false, message: "Error creating Razorpay order" });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Create Order Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error during order creation" });
  }
};

// 2. Verify Payment & Generate Ticket
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
    } = req.body;

    // 🔥 REDIS CHECK: Dekhein ki 10 minute ka timer expire toh nahi hua?
    const isLocked = await redis.get(`booking_lock:${bookingId}`);
    if (!isLocked) {
      return res.status(400).json({
        success: false,
        message:
          "Your 10-minute booking window expired. Please try booking again.",
      });
    }

    // Razorpay Signature Verify Karein
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Payment Successful! Booking ko confirmed mark karein
      await Booking.findByIdAndUpdate(bookingId, {
        status: "confirmed",
        paymentId: razorpay_payment_id,
      });

      // ✅ Lock delete kar do kyunki payment successfully ho chuki hai
      await redis.del(`booking_lock:${bookingId}`);

      // Secure QR Token Banayein
      const ticketToken = jwt.sign(
        { bookingId: bookingId, paymentId: razorpay_payment_id },
        process.env.QR_SECRET_KEY,
      );

      res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        ticketToken: ticketToken,
      });
    } else {
      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

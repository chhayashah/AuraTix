const Razorpay = require("razorpay");
const crypto = require("crypto");
const Booking = require("../models/Booking");

exports.createOrder = async (req, res) => {
  try {
    const { amount, bookingId } = req.body;

    // Instance function ke andar banayenge taaki hamesha fresh .env keys le
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: amount * 100, // paise mein
      currency: "INR",
      receipt: `receipt_${bookingId}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("RAZORPAY ERROR:", error);
    res.status(500).json({ success: false, error: error });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      await Booking.findByIdAndUpdate(bookingId, {
        status: "confirmed",
        paymentId: razorpay_payment_id,
      });
      res
        .status(200)
        .json({ success: true, message: "Payment verified successfully" });
    } else {
      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

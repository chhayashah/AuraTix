const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    tickets: [
      {
        tierId: { type: mongoose.Schema.Types.ObjectId, required: true },
        quantity: { type: Number, required: true },
        priceAtBooking: { type: Number, required: true },
        isScanned: { type: Boolean, default: false },
        scannedAt: { type: Date },
      },
    ],

    totalAmount: { type: Number, required: true },

    status: {
      type: String,
      enum: ["locked", "confirmed", "failed", "refunded"],
      default: "locked",
    },

    paymentIntentId: { type: String },

    lockedUntil: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 10 * 60 * 1000),
    },
  },
  { timestamps: true },
);

bookingSchema.index({ lockedUntil: 1 });

module.exports = mongoose.model("Booking", bookingSchema);

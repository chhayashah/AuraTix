const Booking = require("../models/Booking");
const Event = require("../models/Event");
const redis = require("../config/redis"); // Redis configuration imported

// 1. Lock and Book Tickets (Prevents Double Booking & Sets Redis Timer)
exports.lockAndBookTickets = async (req, res) => {
  try {
    const { eventId, ticketTierId, quantity } = req.body;

    // Auth middleware se user ki ID
    const userId = req.user.id;

    // ATOMIC UPDATE: Check karein ki seats available hain, aur turant minus karein
    const event = await Event.findOneAndUpdate(
      {
        _id: eventId,
        "ticketTiers._id": ticketTierId,
        "ticketTiers.availableTickets": { $gte: quantity },
      },
      {
        $inc: { "ticketTiers.$.availableTickets": -quantity },
      },
      { new: true },
    );

    // Agar event nahi mila, matlab seats already koi le chuka hai
    if (!event) {
      return res.status(400).json({
        success: false,
        message:
          "Oops! Someone just grabbed these tickets. Not enough seats left.",
      });
    }

    // Pending Booking create karein
    const newBooking = await Booking.create({
      user: userId,
      event: eventId,
      ticketTier: ticketTierId,
      quantity: quantity,
      status: "pending",
      lockedAt: new Date(),
    });

    // 🔥 REDIS MAGIC: Is booking ID ko Redis mein 600 seconds (10 mins) ke liye save karein
    await redis.set(`booking_lock:${newBooking._id}`, "locked", "EX", 600);

    res.status(200).json({
      success: true,
      message:
        "Tickets successfully locked for 10 minutes. Proceed to payment.",
      booking: newBooking,
    });
  } catch (error) {
    console.error("Locking Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server Error while locking tickets" });
  }
};

// 2. Get User's Confirmed Bookings (For Ticket Dashboard)
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    // Sirf confirmed tickets bhejenge aur Event details ko populate karenge
    const bookings = await Booking.find({ user: userId, status: "confirmed" })
      .populate("event", "title location date")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Fetch Bookings Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch your tickets" });
  }
};

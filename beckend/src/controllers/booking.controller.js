const Booking = require("../models/Booking");
const Event = require("../models/Event");
const redis = require("../config/redis");

exports.lockAndBookTickets = async (req, res) => {
  try {
    const { eventId, ticketTierId, quantity } = req.body;
    const userId = req.user.id;

    // ATOMIC UPDATE: Tickets lock karein
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

    if (!event) {
      return res.status(400).json({
        success: false,
        message:
          "Oops! Someone just grabbed these tickets. Not enough seats left.",
      });
    }

    // 🔴 SOCKET.IO MAGIC: Live update sabhi connected users ko bhejein
    const updatedTier = event.ticketTiers.find(
      (t) => t._id.toString() === ticketTierId,
    );
    const io = req.app.get("io");
    io.emit("seatUpdate", {
      eventId: eventId,
      ticketTierId: ticketTierId,
      availableTickets: updatedTier.availableTickets,
    });

    // Pending Booking create karein
    const newBooking = await Booking.create({
      user: userId,
      event: eventId,
      ticketTier: ticketTierId,
      quantity: quantity,
      status: "pending",
      lockedAt: new Date(),
    });

    // Redis Timer (10 mins)
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

exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await Booking.find({ user: userId, status: "confirmed" })
      .populate("event", "title location date")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    console.error("Fetch Bookings Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch your tickets" });
  }
};

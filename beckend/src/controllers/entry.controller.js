const jwt = require("jsonwebtoken");
const Booking = require("../models/Booking");

exports.validateEntry = async (req, res) => {
  const { qrToken } = req.body;
  const organizerId = req.user.id;

  try {
    const decoded = jwt.verify(qrToken, process.env.QR_SECRET_KEY);
    const booking = await Booking.findById(decoded.bookingId).populate("event");

    if (!booking) return res.status(404).json({ message: "Fake Ticket!" });
    if (booking.event.organizer.toString() !== organizerId) {
      return res.status(403).json({ message: "Unauthorized scanner" });
    }
    if (booking.status !== "confirmed") {
      return res.status(400).json({ message: "Ticket not confirmed" });
    }

    const ticket = booking.tickets[0];
    if (ticket.isScanned) {
      return res
        .status(400)
        .json({ message: `Already scanned at ${ticket.scannedAt}` });
    }

    ticket.isScanned = true;
    ticket.scannedAt = new Date();
    await booking.save();

    return res
      .status(200)
      .json({ message: "Entry Approved ✅", guests: ticket.quantity });
  } catch (error) {
    return res.status(400).json({ message: "Invalid or Corrupt QR Code ❌" });
  }
};

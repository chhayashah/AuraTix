const Booking = require("../models/Booking");
const Event = require("../models/Event");

exports.lockAndBookTickets = async (req, res) => {
  try {
    const { eventId, ticketTierId, quantity } = req.body;
    const userId = req.user.id;

    // 1. Event fetch karein
    const event = await Event.findById(eventId);
    if (!event)
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });

    // 2. Ticket tier dhoondein
    const tier = event.ticketTiers.id(ticketTierId);
    if (!tier)
      return res
        .status(404)
        .json({ success: false, message: "Ticket tier not found" });

    // 3. Check karein ki tickets available hain ya nahi
    if (tier.availableTickets < quantity) {
      return res
        .status(400)
        .json({ success: false, message: "Not enough tickets available" });
    }

    // 4. Tickets lock karein (availableTickets kam karein)
    tier.availableTickets -= quantity;
    await event.save(); // Local DB ke liye bina session ke save karein

    // 5. Booking document create karein (Status 'locked' ke sath)
    const booking = await Booking.create({
      user: userId,
      event: eventId,
      ticketTier: ticketTierId,
      quantity,
      totalAmount: tier.price * quantity,
      status: "locked",
      lockedUntil: new Date(Date.now() + 10 * 60000), // 10 minutes lock
    });

    res.status(200).json({
      success: true,
      message: "Tickets locked successfully for 10 minutes",
      booking,
      totalAmount: booking.totalAmount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

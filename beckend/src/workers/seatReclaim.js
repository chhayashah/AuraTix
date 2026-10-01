const cron = require("node-cron");
const Booking = require("../models/Booking");
const Event = require("../models/Event");

// Yeh cron job har 1 minute mein automatically chalegi ("* * * * *")
cron.schedule("* * * * *", async () => {
  try {
    // 10 minute pehle ka time calculate karein
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    // Wo saari bookings dhundein jo 'pending' hain aur 10 minute se purani hain
    const expiredBookings = await Booking.find({
      status: "pending",
      lockedAt: { $lt: tenMinutesAgo },
    });

    if (expiredBookings.length > 0) {
      console.log(
        `🔄 Found ${expiredBookings.length} expired bookings. Reclaiming seats...`,
      );

      // Har expired booking ke liye loop chalayein
      for (const booking of expiredBookings) {
        // 1. Wapas seats ko Event mein PLUS (+) kar dein
        await Event.findOneAndUpdate(
          {
            _id: booking.event,
            "ticketTiers._id": booking.ticketTier,
          },
          {
            $inc: { "ticketTiers.$.availableTickets": booking.quantity },
          },
        );

        // 2. Us booking ka status 'expired' mark kar dein taaki dobara check na ho
        booking.status = "expired";
        await booking.save();
      }

      console.log(
        "✅ All expired seats successfully reclaimed & added back to the event!",
      );
    }
  } catch (error) {
    console.error("❌ Seat Reclaim Worker Error:", error);
  }
});

console.log("🤖 Seat Reclaim Background Worker is running...");

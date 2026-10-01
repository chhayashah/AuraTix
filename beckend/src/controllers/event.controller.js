const Event = require("../models/Event");

exports.createEvent = async (req, res) => {
  try {
    // req.user.id is coming from our auth middleware
    const { title, category, location, schedule, ticketTiers } = req.body;

    const event = await Event.create({
      title,
      organizer: req.user.id,
      category,
      location,
      schedule,
      ticketTiers,
      status: "published", // Defaulting to published for now
    });

    res.status(201).json({ success: true, data: event });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAllEvents = async (req, res) => {
  try {
    // Fetch only published events, and populate the organizer's name
    const events = await Event.find({ status: "published" }).populate(
      "organizer",
      "name companyName",
    );

    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: { type: String, required: true },

    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
    },

    schedule: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
    },

    ticketTiers: [
      {
        tierName: { type: String, required: true },
        price: { type: Number, required: true },
        totalCapacity: { type: Number, required: true },
        availableTickets: { type: Number, required: true },
        lockedTickets: { type: Number, default: 0 },
      },
    ],

    status: {
      type: String,
      enum: ["draft", "published", "cancelled"],
      default: "draft",
    },
  },
  { timestamps: true },
);

eventSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Event", eventSchema);

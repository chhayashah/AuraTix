import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const OrganizerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    title: "Navratri Utsav 2026",
    category: "Garba",
    address: "Sardar Patel Stadium",
    city: "Ahmedabad",
    startDate: "",
    endDate: "",
    price: 500,
    capacity: 1000,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const eventPayload = {
      title: formData.title,
      category: formData.category,
      location: {
        type: "Point",
        coordinates: [72.5714, 23.0225],
        address: formData.address,
        city: formData.city,
      },
      schedule: {
        startDate: formData.startDate,
        endDate: formData.endDate,
      },
      // Yahan se keys ke naam backend model ke hisaab se update kiye hain:
      ticketTiers: [
        {
          tierName: "General Entry",
          price: Number(formData.price),
          totalCapacity: Number(formData.capacity),
          availableTickets: Number(formData.capacity), // Start mein available tickets capacity ke barabar hongi
        },
      ],
    };

    try {
      await api.post("/events", eventPayload);
      setMessage("✅ Event created successfully! Redirecting to Home...");
      setTimeout(() => {
        navigate("/"); // Event banne ke baad home page par bhej dein jahan event list hoga
      }, 2000);
    } catch (error) {
      setMessage(
        `❌ Error: ${error.response?.data?.message || "Failed to create event"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto mt-10 p-5 max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Organizer Dashboard
      </h1>
      <p className="text-gray-600 mb-8">
        Create and manage your local Garba events.
      </p>

      {message && (
        <div
          className={`p-4 rounded mb-6 font-semibold ${message.includes("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
        >
          {message}
        </div>
      )}

      <form
        onSubmit={handleCreateEvent}
        className="bg-white p-6 rounded-lg shadow-md space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Category */}
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-blue-500 outline-none"
            >
              <option value="Garba">Garba</option>
              <option value="Concert">Concert</option>
              <option value="Workshop">Workshop</option>
            </select>
          </div>

          {/* City */}
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Address */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Venue Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date & Time
            </label>
            <input
              type="datetime-local"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-blue-500 outline-none"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date & Time
            </label>
            <input
              type="datetime-local"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Ticket Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ticket Price (₹)
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Capacity
            </label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              required
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded text-white font-bold transition ${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {loading ? "Creating Event..." : "Publish Event"}
        </button>
      </form>
    </div>
  );
};

export default OrganizerDashboard;

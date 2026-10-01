import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [selectedTier, setSelectedTier] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // 1. Event Data Fetch Karein
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/v1/events/${id}`,
        );
        setEvent(res.data.event);
        if (res.data.event.ticketTiers.length > 0) {
          setSelectedTier(res.data.event.ticketTiers[0]._id);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching event details", error);
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  // 2. 🔴 SOCKET.IO: Real-Time Seat Updates Sunein
  useEffect(() => {
    const socket = io("http://localhost:5000");

    socket.on("seatUpdate", (data) => {
      if (id === data.eventId) {
        setEvent((prevEvent) => {
          if (!prevEvent) return prevEvent;
          const updatedTiers = prevEvent.ticketTiers.map((tier) =>
            tier._id === data.ticketTierId
              ? { ...tier, availableTickets: data.availableTickets }
              : tier,
          );
          return { ...prevEvent, ticketTiers: updatedTiers };
        });
      }
    });

    return () => {
      socket.disconnect(); // Component close hone par disconnect
    };
  }, [id]);

  // 3. Razorpay Script Load Function
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // 4. Handle Lock & Book Process
  const handleBooking = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to book tickets!");
      navigate("/login");
      return;
    }

    try {
      // Step A: Lock Tickets in Backend
      const lockRes = await axios.post(
        "http://localhost:5000/api/v1/bookings/lock",
        { eventId: id, ticketTierId: selectedTier, quantity },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const bookingData = lockRes.data.booking;

      // Step B: Load Razorpay
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert(
          "Failed to load Razorpay. Please check your internet connection.",
        );
        return;
      }

      // Calculate Amount based on selected tier
      const tierDetails = event.ticketTiers.find((t) => t._id === selectedTier);
      const totalAmount = tierDetails.price * quantity;

      // Step C: Create Razorpay Order
      const orderRes = await axios.post(
        "http://localhost:5000/api/payments/create-order",
        { amount: totalAmount },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Step D: Open Razorpay Checkout Window
      const options = {
        key: "YOUR_RAZORPAY_KEY_ID_HERE", // Ise apne Razorpay Key ID se replace karein
        amount: orderRes.data.order.amount,
        currency: orderRes.data.order.currency,
        name: "AuraTix",
        description: `Booking for ${event.title}`,
        order_id: orderRes.data.order.id,
        handler: async function (response) {
          try {
            // Step E: Verify Payment
            const verifyRes = await axios.post(
              "http://localhost:5000/api/payments/verify",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId: bookingData._id,
              },
              { headers: { Authorization: `Bearer ${token}` } },
            );

            if (verifyRes.data.success) {
              alert("🎉 Ticket Booked Successfully!");
              navigate("/my-tickets", {
                state: {
                  token: verifyRes.data.ticketToken,
                  eventName: event.title,
                },
              });
            }
          } catch (error) {
            alert(
              error.response?.data?.message || "Payment verification failed!",
            );
          }
        },
        theme: { color: "#2563EB" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      alert(error.response?.data?.message || "Error locking tickets");
    }
  };

  if (loading)
    return (
      <div className="text-center mt-20 text-xl font-bold">
        Loading Event...
      </div>
    );
  if (!event)
    return (
      <div className="text-center mt-20 text-xl font-bold">Event Not Found</div>
    );

  const currentTierInfo = event.ticketTiers.find((t) => t._id === selectedTier);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6">
        {event.title}
      </h1>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h2 className="text-2xl font-bold mb-4 border-b pb-2">
          Book Your Tickets
        </h2>

        {/* Ticket Type Selection */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">
            Select Category
          </label>
          <select
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
          >
            {event.ticketTiers.map((tier) => (
              <option key={tier._id} value={tier._id}>
                {tier.name} - ₹{tier.price}
              </option>
            ))}
          </select>
        </div>

        {/* Live Seat Count Display */}
        {currentTierInfo && (
          <div className="mb-6 bg-blue-50 text-blue-800 p-4 rounded-lg font-medium flex justify-between items-center">
            <span>Price: ₹{currentTierInfo.price}</span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-bold ${currentTierInfo.availableTickets < 10 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}
            >
              🟢 {currentTierInfo.availableTickets} Seats Left (Live)
            </span>
          </div>
        )}

        {/* Quantity Selection */}
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">
            Quantity
          </label>
          <select
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            disabled={
              !currentTierInfo || currentTierInfo.availableTickets === 0
            }
          >
            {[1, 2, 3, 4, 5].map((num) => (
              <option key={num} value={num}>
                {num} Ticket(s)
              </option>
            ))}
          </select>
        </div>

        {/* Action Button */}
        <button
          onClick={handleBooking}
          disabled={
            !currentTierInfo || currentTierInfo.availableTickets < quantity
          }
          className={`w-full py-4 rounded-xl text-lg font-bold text-white transition-all shadow-md
            ${
              !currentTierInfo || currentTierInfo.availableTickets < quantity
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg"
            }`}
        >
          {!currentTierInfo || currentTierInfo.availableTickets === 0
            ? "Sold Out"
            : `Lock & Pay ₹${currentTierInfo ? currentTierInfo.price * quantity : 0}`}
        </button>
      </div>
    </div>
  );
};

export default EventDetails;

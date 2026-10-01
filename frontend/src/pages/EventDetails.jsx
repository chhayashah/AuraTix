import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [bookingStatus, setBookingStatus] = useState("");
  const [lockMessage, setLockMessage] = useState("");

  // Naya state: Backend se aayi booking ID save karne ke liye
  const [lockedBookingId, setLockedBookingId] = useState(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await api.get("/events");
        const foundEvent = response.data.data.find((e) => e._id === id);
        if (foundEvent) setEvent(foundEvent);
        else setError("Event not found");
      } catch (err) {
        setError("Failed to load event details");
      } finally {
        setLoading(false);
      }
    };
    fetchEventDetails();
  }, [id]);

  const handleLockTickets = async () => {
    if (!localStorage.getItem("token")) {
      alert("Please login to book tickets!");
      return navigate("/login");
    }

    setBookingStatus("locking");
    try {
      const response = await api.post("/bookings/lock", {
        eventId: event._id,
        ticketTierId: event.ticketTiers[0]._id,
        quantity: quantity,
      });

      // Booking ID save kar rahe hain taaki payment verification mein use ho sake
      setLockedBookingId(response.data.booking._id);
      setBookingStatus("locked");
      setLockMessage(`✅ ${quantity} Ticket(s) locked! Proceed to payment.`);
    } catch (err) {
      setBookingStatus("error");
      setLockMessage(
        `❌ ${err.response?.data?.message || "Failed to lock tickets"}`,
      );
    }
  };

  const handlePayment = async () => {
    const res = await loadRazorpayScript();
    if (!res) return alert("Razorpay SDK failed to load.");

    try {
      // 1. Backend se Secure Order ID generate karwayein
      const orderResponse = await api.post("/payments/create-order", {
        amount: event.ticketTiers[0].price * quantity,
        bookingId: lockedBookingId,
      });
      const { order } = orderResponse.data;

      // 2. Razorpay Popup setup karein
      const options = {
        key: "rzp_test_TgHi7s3Hcu2sgG", // YAHAN APNI NAYI KEY ID DAALEIN
        amount: order.amount,
        currency: order.currency,
        name: "UtsavBox",
        description: `Ticket for ${event.title}`,
        order_id: order.id, // Backend se aayi secure ID
        handler: async function (response) {
          try {
            // 3. Payment ke baad Backend se Signature Verify karwayein
            const verifyResponse = await api.post("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: lockedBookingId,
            });

            if (verifyResponse.data.success) {
              alert("🎉 Ticket Booked Successfully!");
              navigate("/"); // Ya fir /dashboard par bhej dein
            }
          } catch (error) {
            alert("Payment failed verification at backend.");
          }
        },
        prefill: {
          name: "Chhaya Shah",
          email: "chhaya@example.com",
          contact: "9999999999",
        },
        theme: { color: "#2563EB" },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error(error);
      alert("Could not initialize payment. Check console.");
    }
  };

  if (loading)
    return (
      <div className="text-center mt-20 text-xl font-semibold">Loading...</div>
    );
  if (error)
    return (
      <div className="text-center mt-20 text-red-500 font-bold">{error}</div>
    );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="h-64 bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
          <h1 className="text-4xl font-extrabold text-white text-center px-4">
            {event.title}
          </h1>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Event Details
              </h2>
              <div className="space-y-3 text-gray-600">
                <p>
                  <strong>📍 Venue:</strong> {event.location?.address},{" "}
                  {event.location?.city}
                </p>
                <p>
                  <strong>🎭 Category:</strong> {event.category}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Book Your Tickets
              </h3>

              <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                <span className="text-gray-700 font-semibold">
                  {event.ticketTiers[0]?.tierName || "General Entry"}
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  ₹{event.ticketTiers[0]?.price}
                </span>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Quantity
                </label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  disabled={
                    bookingStatus === "locked" || bookingStatus === "locking"
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded outline-none"
                >
                  {[1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>
                      {num} Ticket(s)
                    </option>
                  ))}
                </select>
              </div>

              {lockMessage && (
                <div
                  className={`p-3 rounded mb-4 text-sm font-semibold ${bookingStatus === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
                >
                  {lockMessage}
                </div>
              )}

              {bookingStatus !== "locked" ? (
                <button
                  onClick={handleLockTickets}
                  disabled={bookingStatus === "locking"}
                  className={`w-full py-3 rounded text-white font-bold transition ${bookingStatus === "locking" ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                  {bookingStatus === "locking"
                    ? "Locking Tickets..."
                    : "Lock & Book Now"}
                </button>
              ) : (
                <button
                  onClick={handlePayment}
                  className="w-full py-3 rounded text-white font-bold bg-green-600 hover:bg-green-700 transition shadow-lg animate-pulse"
                >
                  Pay ₹{event.ticketTiers[0]?.price * quantity} with Razorpay
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;

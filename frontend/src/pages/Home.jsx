import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get("/events");
        setEvents(response.data.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch events. Is the backend running?");
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading)
    return (
      <div className="text-center mt-20 text-xl font-semibold">
        Loading UtsavBox Events...
      </div>
    );
  if (error)
    return <div className="text-center mt-20 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Trending Local Events & Garba Nights
      </h1>

      {events.length === 0 ? (
        <div className="text-center text-gray-500">
          No events found. Be the first to host one!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Event Image Placeholder */}
              <div className="h-48 bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {event.category}
                </span>
              </div>

              <div className="p-5">
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  {event.title}
                </h2>
                <p className="text-gray-600 text-sm mb-4">
                  📍 {event.location?.address}, {event.location?.city}
                </p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-semibold text-blue-600">
                    By: {event.organizer?.name || "Organizer"}
                  </span>
                  <span className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-600">
                    {new Date(event.schedule?.startDate).toLocaleDateString()}
                  </span>
                </div>

                <Link
                  to={`/events/${event._id}`}
                  className="block w-full text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                >
                  View Details & Book
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;

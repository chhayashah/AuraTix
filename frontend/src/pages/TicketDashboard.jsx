import { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import api from "../services/api";

const TicketDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Note: Backend mein hume ek GET /bookings api banani padegi user ki tickets fetch karne ke liye
  // Abhi ke liye hum ise dummy data/structure ke sath set kar rahe hain

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        My Tickets
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Yeh ek single ticket card ka design hai */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden text-center p-6 border-2 border-dashed border-gray-300">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Navratri Utsav 2026
          </h2>
          <p className="text-gray-500 mb-6">Scan at the entry gate</p>

          <div className="flex justify-center mb-4">
            {/* Jab backend se QR token aayega, tab hum 'dummy_token_123' ki jagah wo token pass karenge */}
            <QRCodeCanvas
              value={"dummy_token_123_replace_later"}
              size={200}
              bgColor={"#ffffff"}
              fgColor={"#000000"}
              level={"H"}
              includeMargin={true}
            />
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm font-semibold text-green-600">
              ✅ Ticket Confirmed
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Quantity: 2 | General Entry
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDashboard;

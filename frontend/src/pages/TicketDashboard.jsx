import React from "react";
import { useLocation, Link } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";

const TicketDashboard = () => {
  const location = useLocation();

  // EventDetails se pass kiya gaya token aur event name nikal rahe hain
  const ticketToken = location.state?.token;
  const eventName = location.state?.eventName;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">My Tickets</h1>
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
          >
            Browse More Events &rarr;
          </Link>
        </div>

        {/* Conditional Rendering: Agar ticket hai toh QR dikhao, warna empty message */}
        {ticketToken ? (
          <div className="flex flex-col items-center">
            {/* VIP Ticket Card Design */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-md border border-gray-100 transform transition-all hover:scale-105 duration-300">
              {/* Ticket Header (Blue Gradient) */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-center">
                <h2 className="text-2xl font-bold text-white">{eventName}</h2>
                <p className="text-blue-100 text-sm mt-1">Admit One</p>
              </div>

              {/* Ticket Body with QR Code */}
              <div className="p-8 flex flex-col items-center border-b-2 border-dashed border-gray-300 relative">
                {/* Side Cuts for Ticket Look */}
                <div className="absolute -left-3 bottom-[-12px] h-6 w-6 bg-gray-50 rounded-full"></div>
                <div className="absolute -right-3 bottom-[-12px] h-6 w-6 bg-gray-50 rounded-full"></div>

                <p className="text-gray-500 mb-6 font-medium text-sm text-center">
                  Please present this secure QR code at the venue entry gate.
                </p>

                <div className="p-4 bg-white border-2 border-gray-100 rounded-xl shadow-inner">
                  <QRCodeCanvas
                    value={ticketToken}
                    size={220}
                    bgColor={"#ffffff"}
                    fgColor={"#000000"}
                    level={"H"}
                    includeMargin={false}
                  />
                </div>
              </div>

              {/* Ticket Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-green-600 flex items-center">
                    <span className="mr-2">✅</span> Payment Confirmed
                  </p>
                  <p className="text-xs text-gray-400 mt-1 font-medium">
                    Secured by AuraTix & Razorpay
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Empty State (Agar seedha /my-tickets url open kiya ho)
          <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100 mt-10">
            <div className="text-6xl mb-4">🎟️️</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              No Recent Tickets Found
            </h3>
            <p className="text-gray-500 mb-8 text-lg">
              You haven't booked any tickets in this session yet.
            </p>
            <Link
              to="/"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg"
            >
              Explore Events
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketDashboard;

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import EventDetails from "./pages/EventDetails";
import OrganizerDashboard from "./pages/OrganizerDashboard";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/events/:id" element={<EventDetails />} />

            {/* You'd typically protect this route, checking for organizer role */}
            <Route path="/dashboard" element={<OrganizerDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

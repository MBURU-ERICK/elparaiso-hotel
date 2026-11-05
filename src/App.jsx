import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Rooms from "./pages/Rooms";
import Restaurant from "./pages/Restaurant";
import Experiences from "./pages/Experiences";
import About from "./pages/About";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import WhatsAppButton from "./components/WhatsAppButton";
import Booking from "./pages/Booking";
import StaffLogin from "./pages/StaffLogin";
import StaffDashboard from "./pages/StaffDashboard";
import StaffReservations from "./pages/StaffReservations";
import Airbnb from "./pages/Airbnb";
import StaffAirbnb from "./pages/StaffAirbnb";
import StaffReconciliation from "./pages/StaffReconciliation";

function NotFound() {
  return (
    <main className="section" style={{ textAlign: "center" }}>
      <h1>404</h1>
      <p>Sorry, this page could not be found.</p>
    </main>
  );
}

export default function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/restaurant" element={<Restaurant />} />
        <Route path="/experiences" element={<Experiences />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/about" element={<About />} />
        <Route path="/staff/login" element={<StaffLogin />} />
        <Route path="/staff/dashboard" element={<StaffDashboard />} />
        <Route  path="/staff/reservations" element={<StaffReservations />}/>
        <Route path="/airbnb" element={<Airbnb />} />
        <Route path="/staff/airbnb" element={<StaffAirbnb />} />
        <Route path="/staff/reconciliation"element={<StaffReconciliation />}/>
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
      <WhatsAppButton />
    </>
  );
}
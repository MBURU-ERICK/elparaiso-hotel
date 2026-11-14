import "./styles/hospitality.css";
import "./styles/staff-refresh.css";
import "./styles/workspace.css";
import "./styles/customer.css";
import "./styles/guest-redesign.css";
import HelpChat from "./components/HelpChat";
import AdminDashboard from "./pages/AdminDashboard";

import { Helmet } from "react-helmet-async";
import { lazy, Suspense } from "react";
const Events = lazy(() => import("./pages/Events"));
const StaffContent = lazy(() => import("./pages/StaffContent"));
const StaffProfile = lazy(() => import("./pages/StaffProfile"));
const MealQuotation = lazy(() => import("./pages/MealQuotation"));
const Business = lazy(() => import("./pages/Business"));
const StaffCustomers = lazy(() => import("./pages/GuestRequests"));
const Booking = lazy(() => import("./pages/GuestBooking"));
const StaffLayout = lazy(() => import("./components/StaffLayout"));
const GalleryManager = lazy(() => import("./components/GalleryManager"));
const StaffRoomCategories = lazy(() => import("./pages/StaffRoomCategories"));
const StaffRooms = lazy(() => import("./pages/StaffRooms"));
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

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
import "./styles/premium.css";

const StaffLogin = lazy(() => import("./pages/StaffLogin"));
const StaffDashboard = lazy(() => import("./pages/StaffDashboard"));
const StaffReservations = lazy(() => import("./pages/StaffReservations"));
const Airbnb = lazy(() => import("./pages/PrivateStays"));
const StaffAirbnb = lazy(() => import("./pages/StaffAirbnb"));
const GuestReview = lazy(() => import("./pages/GuestReview"));
const StaffReviews = lazy(() => import("./pages/StaffReviews"));
const StaffAirbnbRooms = lazy(() => import("./pages/StaffAirbnbRooms"));
const StaffPackages = lazy(() => import("./customer/StaffPackages"));
const StaffReconciliation = lazy(() => import("./pages/StaffReconciliation"));

function NotFound() {
  return (
    <main className="section" style={{ textAlign: "center" }}>
      <h1>404</h1>
      <p>Sorry, this page could not be found.</p>
    </main>
  );
}

export default function App() {
  const { pathname } = useLocation();
  const privatePage = /^\/(account|staff|booking|review)(\/|$)/.test(pathname);
  return (
    <div className={pathname.startsWith("/staff") ? "staff-experience" : "guest-experience"}>
      {pathname === "/review" && <Helmet><meta name="referrer" content="no-referrer" /></Helmet>}
      {privatePage && <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>}
      <a className="skip-link" href="#page-content">Skip to content</a>
      
      {!pathname.startsWith("/staff") && <Navbar />}
      
      <div id="page-content" tabIndex={-1}>

      <Suspense fallback={<p className="portal-state" role="status">Loading…</p>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/private-stays" element={<Airbnb />} /><Route path="/events-groups" element={<Events />} /><Route path="/conferences" element={<Business />} /><Route path="/rooms" element={<Rooms />} />
        <Route path="/restaurant" element={<Restaurant />} />
        <Route path="/experiences" element={<Experiences />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/review" element={<GuestReview />} />
        <Route path="/events" element={<Events />} />
        <Route path="/conference-meals" element={<MealQuotation />} />
        <Route path="/business" element={<Business />} />
        <Route path="/account/*" element={<Navigate to="/booking" replace />} />
        <Route path="/about" element={<About />} />
        <Route path="/staff/login" element={<StaffLogin />} />
        <Route path="/airbnb" element={<Airbnb />} />
        <Route element={<StaffLayout />}>
          <Route path="/staff/events" element={<StaffContent key="events" kind="events" />} />
          <Route path="/staff/event-types" element={<StaffContent key="event-types" kind="event-types" />} />
          <Route path="/staff/contacts" element={<StaffContent key="contacts" kind="contacts" />} />
          <Route path="/staff/profile" element={<StaffProfile />} />
          <Route path="/staff/guest-reservations" element={<StaffCustomers reservationMode />} />
          <Route path="/staff/admin" element={<AdminDashboard />} />
          <Route path="/staff/customers" element={<StaffCustomers />} />
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
          <Route path="/staff/reservations" element={<StaffReservations />} />
          <Route path="/staff/room-categories" element={<StaffRoomCategories />} />
          <Route path="/staff/rooms" element={<StaffRooms />} />
          <Route path="/staff/airbnb/rooms" element={<StaffAirbnbRooms />} />
          <Route path="/staff/reviews" element={<StaffReviews />} />
          <Route path="/staff/packages" element={<StaffPackages />} />
          <Route path="/staff/airbnb" element={<StaffAirbnb />} />
          <Route path="/staff/reconciliation" element={<StaffReconciliation />} />
          <Route path="/staff/gallery" element={<GalleryManager />} />
        </Route>
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
      </div>

      {!pathname.startsWith("/staff") && <Footer />}
      {!pathname.startsWith("/staff") && <WhatsAppButton />}
      <HelpChat />
      
    </div>
  );
}

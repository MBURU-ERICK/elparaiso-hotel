import "./styles/hospitality.css";
import CustomerNav from "./customer/CustomerNav";
import { Helmet } from "react-helmet-async";
import { lazy, Suspense } from "react";
const Business = lazy(() => import("./pages/Business"));
const StaffCustomers = lazy(() => import("./customer/StaffCustomers"));
const InvoiceDetail = lazy(() => import("./customer/InvoiceDetail"));
const InvoiceList = lazy(() => import("./customer/InvoiceList"));
const RequestDetail = lazy(() => import("./customer/RequestDetail"));
const RequestList = lazy(() => import("./customer/RequestList"));
const RequestForm = lazy(() => import("./customer/RequestForm"));
const CustomerProfileForm = lazy(() => import("./customer/CustomerProfileForm"));
const CustomerOverview = lazy(() => import("./customer/CustomerOverview"));
const CustomerLayout = lazy(() => import("./customer/CustomerLayout"));
const CustomerAuth = lazy(() => import("./customer/CustomerAuth"));
import CustomerProvider from "./customer/CustomerProvider";
import CustomerGate from "./customer/CustomerGate";
const StaffLayout = lazy(() => import("./components/StaffLayout"));
const GalleryManager = lazy(() => import("./components/GalleryManager"));
const StaffRooms = lazy(() => import("./pages/StaffRooms"));
import { Routes, Route, useLocation } from "react-router-dom";

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
const Booking = lazy(() => import("./pages/Booking"));
const StaffLogin = lazy(() => import("./pages/StaffLogin"));
const StaffDashboard = lazy(() => import("./pages/StaffDashboard"));
const StaffReservations = lazy(() => import("./pages/StaffReservations"));
const Airbnb = lazy(() => import("./pages/Airbnb"));
const StaffAirbnb = lazy(() => import("./pages/StaffAirbnb"));
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
  const privatePage = /^\/(account|staff|booking|airbnb)(\/|$)/.test(pathname);
  return (
    <div className={pathname.startsWith("/staff") ? "staff-experience" : "guest-experience"}>
      {privatePage && <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>}
      <a className="skip-link" href="#page-content">Skip to content</a>
      <CustomerProvider>
      <Navbar />
      <CustomerNav />
      <div id="page-content" tabIndex={-1}>

      <Suspense fallback={<p className="portal-state" role="status">Loading…</p>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/restaurant" element={<Restaurant />} />
        <Route path="/experiences" element={<Experiences />} />
        <Route path="/booking" element={<CustomerGate><Booking /></CustomerGate>} />
        <Route path="/business" element={<Business />} />
        {['login', 'register', 'forgot', 'reset', 'verify'].map(mode => <Route key={mode} path={`/account/${mode}`} element={<CustomerAuth key={mode} mode={mode} />} />)}
        <Route path="/account" element={<CustomerGate verified={false}><CustomerLayout /></CustomerGate>}>
          <Route index element={<CustomerOverview />} />
          <Route path="profile" element={<CustomerProfileForm />} />
          <Route path="requests" element={<CustomerGate><RequestList /></CustomerGate>} />
          <Route path="requests/new" element={<CustomerGate><RequestForm /></CustomerGate>} />
          <Route path="requests/:id" element={<CustomerGate><RequestDetail /></CustomerGate>} />
          <Route path="invoices" element={<CustomerGate><InvoiceList /></CustomerGate>} />
          <Route path="invoices/:id" element={<CustomerGate><InvoiceDetail /></CustomerGate>} />
        </Route>
        <Route path="/about" element={<About />} />
        <Route path="/staff/login" element={<StaffLogin />} />
        <Route path="/airbnb" element={<CustomerGate><Airbnb /></CustomerGate>} />
        <Route element={<StaffLayout />}>
          <Route path="/staff/customers" element={<StaffCustomers />} />
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
          <Route path="/staff/reservations" element={<StaffReservations />} />
          <Route path="/staff/rooms" element={<StaffRooms />} />
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

      <Footer />
      <WhatsAppButton />
      </CustomerProvider>
    </div>
  );
}

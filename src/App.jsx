import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import { ThemeProvider } from './context/ThemeContext';

import Navbar from './components/customer/Navbar';
import AuthModal from './components/customer/AuthModal';
import LiveChatWidget from './components/customer/LiveChatWidget';
import Footer from './components/customer/Footer';

// Customer Pages
import Home from './pages/customer/Home';
import MoviesPage from './pages/customer/MoviesPage';
import MovieDetailsPage from './pages/customer/MovieDetailsPage';
import SeatBookingPage from './pages/customer/SeatBookingPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import TheatresPage from './pages/customer/TheatresPage';
import { EventsPage, PlaysPage, ActivitiesPage, OffersPage, GiftCardsPage, CorporatePage } from './pages/customer/SubPages';
import ProfilePage from './pages/customer/ProfilePage';

// Admin Module (Isolated)
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';

function AppLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-[#050508] text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-black">
      
      {/* CUSTOMER WEBSITE MODULE HEADER */}
      {!isAdminRoute && <Navbar />}

      {/* AUTHENTICATION MODAL */}
      <AuthModal />

      {/* FLOATING LIVE CHAT SUPPORT WIDGET */}
      {!isAdminRoute && <LiveChatWidget />}

      {/* MAIN ROUTING BODY */}
      <main className="flex-1">
        <Routes>
          {/* CUSTOMER MODULE ROUTES */}
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/movie/:id" element={<MovieDetailsPage />} />
          <Route path="/seat-booking/:showId" element={<SeatBookingPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/theatres" element={<TheatresPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/plays" element={<PlaysPage />} />
          <Route path="/activities" element={<ActivitiesPage />} />
          <Route path="/offers" element={<OffersPage />} />
          <Route path="/gift-cards" element={<GiftCardsPage />} />
          <Route path="/corporate" element={<CorporatePage />} />
          <Route path="/profile/*" element={<ProfilePage />} />

          {/* ISOLATED ADMIN MODULE ROUTES */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/*" element={<AdminLayout />} />
        </Routes>
      </main>

      {/* CUSTOMER WEBSITE MODULE FOOTER */}
      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BookingProvider>
          <Router>
            <AppLayout />
          </Router>
        </BookingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

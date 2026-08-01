import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { CityModal } from './components/CityModal';
import { SupportChatWidget } from './components/SupportChatWidget';
import { MotionBackground } from './components/MotionBackground';

import { Home } from './pages/Home';
import { Movies } from './pages/Movies';
import { MovieDetail } from './pages/MovieDetail';
import { SeatBookingModal } from './pages/SeatBookingModal';
import { CheckoutModal } from './pages/CheckoutModal';

import { Theatres } from './pages/Theatres';
import { TheatreDetail } from './pages/TheatreDetail';
import { Events } from './pages/Events';
import { Plays } from './pages/Plays';
import { Activities } from './pages/Activities';
import { Offers } from './pages/Offers';
import { GiftCards } from './pages/GiftCards';
import { Corporate } from './pages/Corporate';
import { Profile } from './pages/Profile';

import { AdminDashboard } from './pages/admin/AdminDashboard';

const MainAppContent = () => {
  const { user, selectedCity } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [selectedMovieId, setSelectedMovieId] = useState('mov_1');
  const [selectedTheatreId, setSelectedTheatreId] = useState('th_1');

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [isSeatPickerOpen, setIsSeatPickerOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Check URL pathname or query params for Admin route on initial load or popstate
  useEffect(() => {
    const checkUrlForAdmin = () => {
      const path = window.location.pathname.toLowerCase();
      const search = window.location.search.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('/admin') || search.includes('admin') || hash.includes('admin')) {
        setActiveTab('admin');
      }
    };

    checkUrlForAdmin();
    window.addEventListener('popstate', checkUrlForAdmin);
    return () => window.removeEventListener('popstate', checkUrlForAdmin);
  }, []);

  const handleSelectMovie = (id) => {
    setSelectedMovieId(id);
    setActiveTab('movie-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookNow = (id) => {
    setSelectedMovieId(id);
    setActiveTab('movie-detail');
    setIsSeatPickerOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-slate-100 dark:bg-[#0A0C10] text-slate-900 dark:text-slate-100 transition-colors duration-300 flex flex-col justify-between selection:bg-amber-500 selection:text-black font-sans">
      
      {/* Background Theme Surface */}
      <MotionBackground />

      {/* Global Navbar */}
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenCityModal={() => setIsCityOpen(true)}
      />

      {/* Main Content Router View */}
      <main className="flex-grow z-10">
        {activeTab === 'home' && (
          <Home 
            onSelectMovie={handleSelectMovie} 
            onBookNow={handleBookNow}
            selectedCity={selectedCity}
            onOpenCityModal={() => setIsCityOpen(true)}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'movies' && (
          <Movies 
            onSelectMovie={handleSelectMovie}
            onBookNow={handleBookNow}
          />
        )}

        {activeTab === 'movie-detail' && (
          <MovieDetail 
            movieId={selectedMovieId}
            onBookTickets={() => setIsSeatPickerOpen(true)}
            onSelectMovie={handleSelectMovie}
          />
        )}

        {activeTab === 'theatres' && (
          <Theatres 
            onSelectTheatre={(id) => {
              setSelectedTheatreId(id);
              setActiveTab('theatre-detail');
            }}
          />
        )}

        {activeTab === 'theatre-detail' && (
          <TheatreDetail 
            theatreId={selectedTheatreId}
            onBookMovieShow={(movieId) => handleBookNow(movieId)}
          />
        )}

        {activeTab === 'events' && (
          <Events onBookEvent={(evt) => handleBookNow('mov_1')} />
        )}

        {activeTab === 'plays' && (
          <Plays onBookPlay={(play) => handleBookNow('mov_1')} />
        )}

        {activeTab === 'activities' && (
          <Activities onBookActivity={(act) => handleBookNow('mov_1')} />
        )}

        {activeTab === 'offers' && (
          <Offers onBookOffer={(offer) => handleBookNow('mov_1')} />
        )}

        {activeTab === 'gift-cards' && (
          <GiftCards />
        )}

        {activeTab === 'corporate' && (
          <Corporate />
        )}

        {activeTab === 'profile-info' && (
          <Profile initialTab="profile-info" />
        )}

        {activeTab === 'profile-bookings' && (
          <Profile initialTab="bookings" />
        )}

        {activeTab === 'profile-wishlist' && (
          <Profile initialTab="wishlist" />
        )}

        {activeTab === 'profile-support' && (
          <Profile initialTab="support" />
        )}

        {activeTab === 'profile-settings' && (
          <Profile initialTab="settings" />
        )}

        {/* Admin Dashboard Panel */}
        {activeTab === 'admin' && (
          <AdminDashboard onReturnHome={() => setActiveTab('home')} />
        )}
      </main>

      {/* Footer - Displayed Exclusively on the Home Page */}
      {activeTab === 'home' && <Footer setActiveTab={setActiveTab} />}

      {/* Global Floating WhatsApp Support Widget */}
      <SupportChatWidget onOpenSupportTab={() => setActiveTab('profile-support')} />

      {/* Auth Modal (Login / Sign Up) */}
      {isAuthOpen && (
        <AuthModal 
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onAdminRedirect={() => {
            setIsAuthOpen(false);
            setActiveTab('admin');
          }}
        />
      )}

      {/* City Location Picker Modal */}
      {isCityOpen && (
        <CityModal 
          isOpen={isCityOpen}
          onClose={() => setIsCityOpen(false)}
        />
      )}

      {/* Interactive Seat Picker Matrix Modal */}
      {isSeatPickerOpen && (
        <SeatBookingModal 
          isOpen={isSeatPickerOpen}
          onClose={() => setIsSeatPickerOpen(false)}
          movieId={selectedMovieId}
          onProceedToCheckout={() => {
            setIsSeatPickerOpen(false);
            setIsCheckoutOpen(true);
          }}
        />
      )}

      {/* Dynamic UPI Payment & Ticket Pass Generator Modal */}
      {isCheckoutOpen && (
        <CheckoutModal 
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          movieId={selectedMovieId}
          onPaymentSuccess={() => {
            setIsCheckoutOpen(false);
            setActiveTab('profile-bookings');
          }}
        />
      )}

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <MainAppContent />
      </BookingProvider>
    </AuthProvider>
  );
}

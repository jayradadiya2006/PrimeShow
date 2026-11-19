import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BookingProvider, useBooking } from './context/BookingContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { CityModal } from './components/CityModal';
import { SupportChatWidget } from './components/SupportChatWidget';
import { MotionBackground } from './components/MotionBackground';

import { Home } from './pages/Home';
import { Movies } from './pages/Movies';
import { MovieDetail } from './pages/MovieDetail';
import { SearchResults } from './pages/SearchResults';
import { SeatBookingModal } from './pages/SeatBookingModal';
import { CheckoutModal } from './pages/CheckoutModal';

import { Theatres } from './pages/Theatres';
import { TheatreDetail } from './pages/TheatreDetail';
import { Events } from './pages/Events';
import { EventDetail } from './pages/EventDetail';
import { Plays } from './pages/Plays';
import { Activities } from './pages/Activities';
import { Offers } from './pages/Offers';
import { GiftCards } from './pages/GiftCards';
import { Corporate } from './pages/Corporate';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';

import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminErrorBoundary } from './components/AdminErrorBoundary';
import { GlobalErrorBoundary } from './components/GlobalErrorBoundary';
import { VerifiedTicketModal } from './components/VerifiedTicketModal';

const MainAppContent = () => {
  const { user, selectedCity } = useAuth();
  const { moviesList, theatresList, selectShowForBooking, myBookings } = useBooking();
  const [urlTicketPass, setUrlTicketPass] = useState(null);
  const [searchQuery, setSearchQuery] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('q') || params.get('search') || '';
    }
    return '';
  });
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const search = window.location.search.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('/admin') || search.includes('admin') || hash.includes('admin')) return 'admin';
      if (path.includes('/settings') || search.includes('settings') || hash.includes('settings')) return 'settings';
      if (path.includes('/profile') || search.includes('profile') || hash.includes('profile')) return 'profile-info';
      if (search.includes('q=') || search.includes('search=') || path.includes('/search')) return 'search';
    }
    return 'home';
  });
  const [selectedMovieId, setSelectedMovieId] = useState('mov_1');
  const [selectedTheatreId, setSelectedTheatreId] = useState('th_1');
  const [selectedEventId, setSelectedEventId] = useState('');

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [isSeatPickerOpen, setIsSeatPickerOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Check URL pathname or query params for Admin, Settings, Profile, or Search routes
  useEffect(() => {
    const checkUrlRoutes = () => {
      const path = window.location.pathname.toLowerCase();
      const search = window.location.search.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('/admin') || search.includes('admin') || hash.includes('admin')) {
        setActiveTab('admin');
      } else if (path.includes('/settings') || search.includes('settings') || hash.includes('settings')) {
        setActiveTab('settings');
      } else if (path.includes('/profile') || search.includes('profile') || hash.includes('profile')) {
        setActiveTab('profile-info');
      } else if (search.includes('q=') || search.includes('search=') || path.includes('/search')) {
        const params = new URLSearchParams(window.location.search);
        const q = params.get('q') || params.get('search') || '';
        if (q) setSearchQuery(q);
        setActiveTab('search');
      }

      // Check for ticketId from scanned QR code
      const params = new URLSearchParams(window.location.search);
      const ticketIdParam = params.get('ticketId') || params.get('ticket') || params.get('bookingId');
      if (ticketIdParam) {
        let found = null;
        if (Array.isArray(myBookings)) {
          found = myBookings.find(b => b && (b.id === ticketIdParam || b._id === ticketIdParam));
        }
        if (!found) {
          try {
            const raw = localStorage.getItem('primeshow_my_bookings_v2');
            if (raw) {
              const list = JSON.parse(raw);
              found = list.find(b => b && (b.id === ticketIdParam || b._id === ticketIdParam));
            }
          } catch (e) {}
        }
        if (!found) {
          found = {
            id: ticketIdParam,
            movieTitle: 'Drishyam: The Conclusion',
            theatreName: 'INOX, VR Mall',
            screenName: 'Screen 1 (Dolby Atmos)',
            showDate: new Date().toISOString().split('T')[0],
            showTime: '10:00 AM',
            seats: ['P6', 'P7'],
            tier: 'Premium Tier',
            totalAmount: 65,
            transactionId: 'TXN-PAY-' + ticketIdParam.replace('bk_', '')
          };
        }
        setUrlTicketPass(found);
      }
    };

    checkUrlRoutes();
    window.addEventListener('popstate', checkUrlRoutes);
    return () => window.removeEventListener('popstate', checkUrlRoutes);
  }, [myBookings]);

  const handleSearchSubmit = (query) => {
    const clean = (query || '').trim();
    setSearchQuery(clean);
    setActiveTab('search');
    if (typeof window !== 'undefined' && window.history) {
      const url = clean ? `?q=${encodeURIComponent(clean)}` : window.location.pathname;
      window.history.pushState(null, '', url);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectMovie = (id) => {
    const validMovie = (Array.isArray(moviesList) && moviesList.length > 0)
      ? (moviesList.find(m => m.id === id || m._id === id || m.title === id) || moviesList[0])
      : null;
    const targetId = validMovie?.id || validMovie?._id || id || 'mov_1';

    setSelectedMovieId(targetId);
    setActiveTab('movie-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookNow = (id) => {
    const validMovie = (Array.isArray(moviesList) && moviesList.length > 0)
      ? (moviesList.find(m => m.id === id || m._id === id || m.title === id) || moviesList[0])
      : null;
    const targetId = validMovie?.id || validMovie?._id || id || 'mov_1';

    if (validMovie && selectShowForBooking) {
      const defaultTh = validMovie.theatres?.[0] || theatresList?.[0] || { id: 'th_1', name: 'PVR Cinemas', city: 'Surat' };
      const defaultDate = validMovie.showDates?.[0] || new Date().toISOString().split('T')[0];
      const rawShow = defaultTh.shows?.[0] || { id: 'sh_101', time: '07:30 PM', price: 480, screenId: 'sc_1', format: 'IMAX 3D' };
      const defaultShow = {
        ...rawShow,
        date: rawShow.date || defaultDate,
        showDate: rawShow.showDate || rawShow.date || defaultDate
      };
      selectShowForBooking(validMovie, defaultTh, defaultShow);
    }

    setSelectedMovieId(targetId);
    setActiveTab('movie-detail');
    setIsSeatPickerOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Dedicated Pages without distraction (both First & Second Navbars are completely hidden)
  const isDedicatedPage = [
    'profile-info', 'profile-bookings', 'profile-wishlist', 
    'profile-support', 'profile', 'profile-settings', 'settings', 'admin', 'auth', 'login', 'register'
  ].includes(activeTab) || isCityOpen || isAuthOpen;

  return (
    <div className="relative min-h-screen bg-[#FFFFFF] text-slate-900 flex flex-col justify-between selection:bg-[#D90000] selection:text-white font-sans">
      
      {/* Background Theme Surface */}
      <MotionBackground />

      {/* Global Navbars (Hidden on Profile, Settings, and Admin pages for clean distraction-free UI) */}
      {!isDedicatedPage && (
        <Navbar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenCityModal={() => setIsCityOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
          onSelectMovie={handleSelectMovie}
          onSelectTheatre={(id) => {
            setSelectedTheatreId(id);
            setActiveTab('theatre-detail');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onSelectEvent={(eventId) => {
            setSelectedEventId(eventId);
            setActiveTab('event-detail');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* Main Content Router View */}
      <main className="flex-grow z-10">
        {activeTab === 'search' && (
          <GlobalErrorBoundary onReturnHome={() => setActiveTab('home')}>
            <SearchResults 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSelectMovie={handleSelectMovie}
              onBookNow={handleBookNow}
              onSelectTheatre={(id) => {
                setSelectedTheatreId(id);
                setActiveTab('theatre-detail');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectEvent={(eventId) => {
                setSelectedEventId(eventId);
                setActiveTab('event-detail');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              setActiveTab={setActiveTab}
            />
          </GlobalErrorBoundary>
        )}

        {activeTab === 'home' && (
          <GlobalErrorBoundary onReturnHome={() => setActiveTab('home')}>
            <Home 
              onSelectMovie={handleSelectMovie} 
              onBookNow={handleBookNow}
              selectedCity={selectedCity}
              onOpenCityModal={() => setIsCityOpen(true)}
              setActiveTab={setActiveTab}
            />
          </GlobalErrorBoundary>
        )}

        {activeTab === 'movies' && (
          <GlobalErrorBoundary onReturnHome={() => setActiveTab('home')}>
            <Movies 
              onSelectMovie={handleSelectMovie}
              onBookNow={handleBookNow}
            />
          </GlobalErrorBoundary>
        )}

        {activeTab === 'movie-detail' && (
          <GlobalErrorBoundary onReturnHome={() => setActiveTab('home')}>
            <MovieDetail 
              movieId={selectedMovieId}
              onBookTickets={() => setIsSeatPickerOpen(true)}
              onSelectMovie={handleSelectMovie}
              onBackToMovies={() => setActiveTab('home')}
            />
          </GlobalErrorBoundary>
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
            onBackToTheatres={() => setActiveTab('theatres')}
            onBookShowSlot={(show) => {
              if (show?.movieId) setSelectedMovieId(show.movieId);
              setIsSeatPickerOpen(true);
            }}
            onBookMovieShow={(movieId) => handleBookNow(movieId)}
          />
        )}

        {activeTab === 'events' && (
          <Events 
            onSelectEvent={(eventId) => {
              setSelectedEventId(eventId);
              setActiveTab('event-detail');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBookEvent={(evt) => handleBookNow('mov_1')} 
          />
        )}

        {activeTab === 'event-detail' && (
          <EventDetail
            eventId={selectedEventId}
            onBackToEvents={() => setActiveTab('events')}
            onSelectMovie={handleSelectMovie}
          />
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

        {(activeTab === 'profile-info' || activeTab === 'profile') && (
          <Profile initialTab="profile-info" onReturnHome={() => setActiveTab('home')} />
        )}

        {activeTab === 'profile-bookings' && (
          <Profile initialTab="bookings" onReturnHome={() => setActiveTab('home')} />
        )}

        {activeTab === 'profile-wishlist' && (
          <Profile initialTab="wishlist" onReturnHome={() => setActiveTab('home')} />
        )}

        {activeTab === 'profile-support' && (
          <Profile initialTab="support" onReturnHome={() => setActiveTab('home')} />
        )}

        {/* Dedicated Settings Page (Decoupled from Profile) */}
        {(activeTab === 'settings' || activeTab === 'profile-settings') && (
          <Settings onReturnHome={() => setActiveTab('home')} />
        )}

        {/* Admin Dashboard Panel (Protected by Error Boundary) */}
        {activeTab === 'admin' && (
          <AdminErrorBoundary onReturnHome={() => setActiveTab('home')}>
            <AdminDashboard onReturnHome={() => setActiveTab('home')} />
          </AdminErrorBoundary>
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
          onProfileRedirect={() => {
            setIsAuthOpen(false);
            setActiveTab('profile-info');
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

      {/* Interactive Seat Selection Modal */}
      {isSeatPickerOpen && (
        <SeatBookingModal 
          isOpen={isSeatPickerOpen}
          onClose={() => setIsSeatPickerOpen(false)}
          onProceedToPayment={() => {
            setIsSeatPickerOpen(false);
            setIsCheckoutOpen(true);
          }}
        />
      )}

      {/* Payment Gateway Modal */}
      {isCheckoutOpen && (
        <CheckoutModal 
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          onPaymentSuccess={() => {
            setIsCheckoutOpen(false);
            setActiveTab('profile-bookings');
          }}
        />
      )}

      {/* Verified Ticket Pass Modal from Scanned QR Code */}
      {urlTicketPass && (
        <VerifiedTicketModal
          isOpen={!!urlTicketPass}
          onClose={() => {
            setUrlTicketPass(null);
            if (typeof window !== 'undefined' && window.history) {
              const cleanUrl = window.location.pathname;
              window.history.pushState(null, '', cleanUrl);
            }
          }}
          ticket={urlTicketPass}
        />
      )}

    </div>
  );
};

export function App() {
  return (
    <GlobalErrorBoundary>
      <AuthProvider>
        <BookingProvider>
          <MainAppContent />
        </BookingProvider>
      </AuthProvider>
    </GlobalErrorBoundary>
  );
}

export default App;

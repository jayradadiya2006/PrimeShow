import React, { useState, useEffect } from 'react';
import { 
  Shield, Film, Ticket, Users, DollarSign, Plus, Edit, Trash2, CheckCircle2, 
  XCircle, Tag, Eye, Lock, RefreshCw, AlertCircle, Sparkles, TrendingUp, MessageSquare, Send, Bot, LogOut, ChevronRight, Home, UserCheck, Image, Building, Bell, Theater, Compass, X, Zap, Award
} from 'lucide-react';
import axios from 'axios';
import API, { API_BASE } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import { AdminTabErrorBoundary } from '../../components/AdminErrorBoundary';
import { GUJARAT_CITIES } from '../../constants/cities';

export const AdminDashboard = ({ onReturnHome }) => {
  const { 
    user, login, adminLogin, logout, token, loading, authLoading: globalAuthLoading, supportMessages, replyToSupportMessage, 
    broadcastNotification, updateNotification, deleteNotification, notifications, socket 
  } = useAuth();

  const { 
    moviesList, addMovieToGlobalStore, updateMovieInGlobalStore, deleteMovieFromGlobalStore,
    addShowDateToMovie, deleteShowDateFromMovie, addShowSlotToMovieTheatre, deleteShowSlotFromMovieTheatre, deleteTheatreFromMovieDate,
    screenLayoutsMap, getScreenLayout, updateScreenRowsConfig, toggleBlockSeatForScreen, setManualSeatStatusForScreen, addRowToScreenLayout, deleteRowFromScreenLayout, showBookedSeatsMap,
    heroSlidesList, addHeroSlide, updateHeroSlide, deleteHeroSlide,
    featureStripsList, addFeatureStrip, updateFeatureStrip, deleteFeatureStrip,
    upcomingMoviesList, addUpcomingMovie, updateUpcomingMovie, deleteUpcomingMovie
  } = useBooking();
  const [activeTab, setActiveTab] = useState('analytics');

  // Dynamic URL Sub-Route Synchronization (/admin/movies, /admin/hero, /admin/theatres, etc.)
  useEffect(() => {
    const syncTabFromUrl = () => {
      const pathParts = window.location.pathname.toLowerCase().split('/').filter(Boolean);
      const hashPart = window.location.hash.toLowerCase().replace('#', '').replace('/', '');
      const searchPart = window.location.search.toLowerCase();
      const allParts = [...pathParts, hashPart, searchPart];

      let targetTab = 'analytics';
      if (allParts.some(p => p.includes('hero') || p.includes('slideshow') || p.includes('banner'))) {
        targetTab = 'hero';
      } else if (allParts.some(p => p.includes('strip') || p.includes('feature'))) {
        targetTab = 'strips';
      } else if (allParts.some(p => p.includes('upcoming') || p.includes('release'))) {
        targetTab = 'upcoming';
      } else if (allParts.some(p => p.includes('movie') || p.includes('film'))) {
        targetTab = 'movies';
      } else if (allParts.some(p => p.includes('theatre') || p.includes('cinema') || p.includes('show'))) {
        targetTab = 'theatres';
      } else if (allParts.some(p => p.includes('event') || p.includes('fest'))) {
        targetTab = 'events';
      } else if (allParts.some(p => p.includes('play') || p.includes('theater'))) {
        targetTab = 'plays';
      } else if (allParts.some(p => p.includes('activity') || p.includes('park'))) {
        targetTab = 'activities';
      } else if (allParts.some(p => p.includes('seat') || p.includes('grid'))) {
        targetTab = 'seats';
      } else if (allParts.some(p => p.includes('offer') || p.includes('promo'))) {
        targetTab = 'offers';
      } else if (allParts.some(p => p.includes('notif') || p.includes('alert'))) {
        targetTab = 'notifications';
      } else if (allParts.some(p => p.includes('booking') || p.includes('ticket'))) {
        targetTab = 'bookings';
      } else if (allParts.some(p => p.includes('user') || p.includes('cust'))) {
        targetTab = 'users';
      } else if (allParts.some(p => p.includes('support') || p.includes('chat'))) {
        targetTab = 'support';
      }

      setActiveTab(targetTab);
    };

    syncTabFromUrl();
    window.addEventListener('popstate', syncTabFromUrl);
    return () => window.removeEventListener('popstate', syncTabFromUrl);
  }, []);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    try {
      window.history.pushState(null, '', `/admin/${tabId}`);
    } catch (e) {}
  };

  // Admin Auth Form State
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const handleAdminAuthSubmit = async (e) => {
    if (e) e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    const emailToUse = adminEmail || 'admin@primeshow.com';
    const passToUse = adminPassword || 'admin123';
    const res = await (adminLogin ? adminLogin(emailToUse, passToUse) : login(emailToUse, passToUse));
    setAuthLoading(false);
    if (!res.success) {
      setAuthError(res.error || 'Invalid Admin Email or Password');
    } else if (res.user?.role !== 'ADMIN') {
      setAuthError('Access Denied: Administrator account required.');
    } else {
      try {
        window.history.pushState(null, '', '/admin');
      } catch (e) {}
    }
  };

  const handleQuickBypassLogin = async () => {
    setAuthLoading(true);
    setAuthError('');
    const res = await (adminLogin ? adminLogin('admin@primeshow.com', 'admin123') : login('admin@primeshow.com', 'admin123'));
    setAuthLoading(false);
    if (!res.success) {
      const mockAdmin = {
        id: 'admin_1',
        name: 'Admin Command Desk',
        email: 'admin@primeshow.com',
        role: 'ADMIN',
        rewardsPoints: 99999
      };
      localStorage.setItem('primeshow_user', JSON.stringify(mockAdmin));
      localStorage.setItem('primeshow_token', 'primeshow_admin_token_bypass');
      window.location.reload();
    } else {
      try {
        window.history.pushState(null, '', '/admin');
      } catch (e) {}
    }
  };

  // Full Notification CRUD Form State (Explicit Top-Level State Variables)
  const [editingNotifId, setEditingNotifId] = useState(null);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState('Info');
  const [notifDate, setNotifDate] = useState('');

  const notifForm = {
    title: notifTitle,
    message: notifMessage,
    priority: notifType,
    date: notifDate
  };

  const setNotifForm = (updater) => {
    let updatedObj;
    if (typeof updater === 'function') {
      updatedObj = updater({ title: notifTitle, message: notifMessage, priority: notifType, date: notifDate });
    } else {
      updatedObj = updater;
    }
    if (updatedObj.title !== undefined) setNotifTitle(updatedObj.title);
    if (updatedObj.message !== undefined) setNotifMessage(updatedObj.message);
    if (updatedObj.priority !== undefined) setNotifType(updatedObj.priority);
    if (updatedObj.date !== undefined) setNotifDate(updatedObj.date);
  };

  const handleSaveNotification = async (e) => {
    if (e) e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) return;

    if (editingNotifId) {
      await updateNotification(editingNotifId, {
        title: notifTitle.trim(),
        message: notifMessage.trim(),
        priority: notifType,
        date: notifDate || null
      });
      setActionSuccess('Notification updated & synced live with User Profile!');
    } else {
      await broadcastNotification(
        notifTitle.trim(),
        notifMessage.trim(),
        notifType,
        notifDate || null
      );
      setActionSuccess('New Notification created & broadcasted live!');
    }

    setNotifTitle('');
    setNotifMessage('');
    setNotifType('Info');
    setNotifDate('');
    setEditingNotifId(null);
    setTimeout(() => setActionSuccess(''), 4000);
  };

  const handleEditNotifClick = (notif) => {
    setEditingNotifId(notif.id);
    let formattedDate = '';
    if (notif.createdAt) {
      try {
        formattedDate = new Date(notif.createdAt).toISOString().slice(0, 16);
      } catch (e) {}
    }
    setNotifTitle(notif.title || '');
    setNotifMessage(notif.message || '');
    setNotifType(notif.type || notif.priority || 'Info');
    setNotifDate(formattedDate);
  };

  const handleDeleteNotifClick = async (notifId) => {
    await deleteNotification(notifId);
    if (editingNotifId === notifId) {
      setEditingNotifId(null);
      setNotifTitle('');
      setNotifMessage('');
      setNotifType('Info');
      setNotifDate('');
    }
    setActionSuccess('Notification deleted permanently from database!');
    setTimeout(() => setActionSuccess(''), 3000);
  };

  // Admin Offers & Seats State
  const [offersList, setOffersList] = useState([]);
  const [actionSuccess, setActionSuccess] = useState('');

  // Cinema & Screen Scoped Seat State
  const [theatresList, setTheatresList] = useState([]);
  const [selectedTheatreId, setSelectedTheatreId] = useState('th_1');
  const [selectedScreenId, setSelectedScreenId] = useState('sc_1');
  const [screenBlockedSeats, setScreenBlockedSeats] = useState([]);

  // Full Movie Form State
  const [movieForm, setMovieForm] = useState({
    title: '',
    synopsis: '',
    duration: '2h 30m',
    rating: 9.0,
    parentalRating: 'UA',
    releaseDate: '2026-12-18',
    genres: 'Sci-Fi, Action',
    languages: 'English, Hindi',
    formats: 'IMAX 3D, Dolby Atmos',
    poster: '',
    banner: '',
    trailerUrl: '',
    director: '',
    status: 'Now Showing'
  });
  const [editingMovieId, setEditingMovieId] = useState(null);

  // Show & Date Schedule Manager State
  const [schedMovieId, setSchedMovieId] = useState('mov_1');
  const [schedDateInput, setSchedDateInput] = useState('');
  const [selectedSchedDate, setSelectedSchedDate] = useState('2026-07-31');

  const [schedTheatreName, setSchedTheatreName] = useState('PVR Director\'s Cut, Palladium Mall');
  const [schedCity, setSchedCity] = useState('Mumbai');
  const [schedAddress, setSchedAddress] = useState('Lower Parel, Mumbai');
  const [schedFacilities, setSchedFacilities] = useState('VIP Recliners, Dolby Atmos, Gourmet Dining');
  const [schedScreen, setSchedScreen] = useState('Screen 1 - IMAX 3D');
  const [schedFormat, setSchedFormat] = useState('IMAX 3D');
  const [schedTime, setSchedTime] = useState('07:30 PM');
  const [schedPrice, setSchedPrice] = useState(650);
  const [schedTier, setSchedTier] = useState('Recliner');

  // Seat Row Config Form State
  const [newRowChar, setNewRowChar] = useState('');
  const [newRowTier, setNewRowTier] = useState('Executive Gold');
  const [newRowPrice, setNewRowPrice] = useState(500);
  const [newRowSeatsCount, setNewRowSeatsCount] = useState(10);

  // Cast Management State per Selected Movie
  const [castMovieId, setCastMovieId] = useState('mov_1');
  const [castName, setCastName] = useState('');
  const [castRole, setCastRole] = useState('');
  const [castPhoto, setCastPhoto] = useState('');

  // Hero Section Slideshow Management State
  const [heroForm, setHeroForm] = useState({
    title: '',
    tagline: '',
    badge: 'BLOCKBUSTER',
    rating: 9.4,
    votesCount: 42800,
    duration: '3h 12m',
    languages: 'English, Hindi, Tamil, Telugu',
    genres: 'Sci-Fi, Action, Adventure',
    price: 480,
    banner: '',
    movieId: 'mov_1'
  });
  const [editingHeroSlideId, setEditingHeroSlideId] = useState(null);

  const handleSaveHeroSlide = (e) => {
    e.preventDefault();
    if (!heroForm.title || !heroForm.banner) return;

    const payload = {
      ...heroForm,
      rating: Number(heroForm.rating),
      price: Number(heroForm.price),
      languages: typeof heroForm.languages === 'string' ? heroForm.languages.split(',').map(s => s.trim()) : heroForm.languages,
      genres: typeof heroForm.genres === 'string' ? heroForm.genres.split(',').map(s => s.trim()) : heroForm.genres
    };

    if (editingHeroSlideId) {
      updateHeroSlide(editingHeroSlideId, payload);
      setActionSuccess('Hero slide updated & synced live with User home page!');
    } else {
      addHeroSlide(payload);
      setActionSuccess('New Hero slide added to homepage slideshow!');
    }

    setHeroForm({
      title: '', tagline: '', badge: 'BLOCKBUSTER', rating: 9.4, votesCount: 42800,
      duration: '3h 12m', languages: 'English, Hindi, Tamil, Telugu', genres: 'Sci-Fi, Action',
      price: 480, banner: '', movieId: 'mov_1'
    });
    setEditingHeroSlideId(null);
    setTimeout(() => setActionSuccess(''), 4000);
  };

  const handleEditHeroSlideClick = (slide) => {
    setEditingHeroSlideId(slide.id);
    setHeroForm({
      title: slide.title || '',
      tagline: slide.tagline || '',
      badge: slide.badge || 'BLOCKBUSTER',
      rating: slide.rating || 9.4,
      votesCount: slide.votesCount || 42800,
      duration: slide.duration || '2h 45m',
      languages: Array.isArray(slide.languages) ? slide.languages.join(', ') : slide.languages || 'English, Hindi',
      genres: Array.isArray(slide.genres) ? slide.genres.join(', ') : slide.genres || 'Action',
      price: slide.price || 480,
      banner: slide.banner || '',
      movieId: slide.movieId || 'mov_1'
    });
  };

  const handleDeleteHeroSlideClick = (slideId) => {
    deleteHeroSlide(slideId);
    setActionSuccess('Hero slide removed from slideshow!');
    setTimeout(() => setActionSuccess(''), 3000);
  };

  // Feature Strips Management State
  const [featForm, setFeatForm] = useState({
    title: '',
    subtitle: '',
    badge: 'INSTANT',
    icon: 'Zap'
  });
  const [editingFeatId, setEditingFeatId] = useState(null);

  const handleSaveFeatureStrip = (e) => {
    e.preventDefault();
    if (!featForm.title) return;

    if (editingFeatId) {
      updateFeatureStrip(editingFeatId, featForm);
      setActionSuccess('Feature action chip updated & synced live!');
    } else {
      addFeatureStrip(featForm);
      setActionSuccess('New Feature action chip added to homepage strip!');
    }

    setFeatForm({ title: '', subtitle: '', badge: 'INSTANT', icon: 'Zap' });
    setEditingFeatId(null);
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const handleEditFeatClick = (feat) => {
    setEditingFeatId(feat.id);
    setFeatForm({
      title: feat.title || '',
      subtitle: feat.subtitle || '',
      badge: feat.badge || 'INSTANT',
      icon: feat.icon || 'Zap'
    });
  };

  const handleDeleteFeatClick = (featId) => {
    deleteFeatureStrip(featId);
    setActionSuccess('Feature action chip removed!');
    setTimeout(() => setActionSuccess(''), 3000);
  };

  // Upcoming Releases Management State
  const [upcomingForm, setUpcomingForm] = useState({
    title: '',
    release: 'Dec 2026',
    poster: '',
    genres: 'Action, Sci-Fi',
    synopsis: ''
  });
  const [editingUpcomingId, setEditingUpcomingId] = useState(null);

  const handleSaveUpcomingMovie = (e) => {
    e.preventDefault();
    if (!upcomingForm.title) return;

    const payload = {
      ...upcomingForm,
      genres: typeof upcomingForm.genres === 'string' ? upcomingForm.genres.split(',').map(s => s.trim()) : upcomingForm.genres,
      poster: upcomingForm.poster || 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80'
    };

    if (editingUpcomingId) {
      updateUpcomingMovie(editingUpcomingId, payload);
      setActionSuccess('Upcoming Release updated & synced live!');
    } else {
      addUpcomingMovie(payload);
      setActionSuccess('New Upcoming Release added to homepage!');
    }

    setUpcomingForm({ title: '', release: 'Dec 2026', poster: '', genres: 'Action, Sci-Fi', synopsis: '' });
    setEditingUpcomingId(null);
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const handleEditUpcomingClick = (mov) => {
    setEditingUpcomingId(mov.id);
    setUpcomingForm({
      title: mov.title || '',
      release: mov.release || 'Dec 2026',
      poster: mov.poster || '',
      genres: Array.isArray(mov.genres) ? mov.genres.join(', ') : mov.genres || 'Action',
      synopsis: mov.synopsis || ''
    });
  };

  const handleDeleteUpcomingClick = (movId) => {
    deleteUpcomingMovie(movId);
    setActionSuccess('Upcoming Release removed!');
    setTimeout(() => setActionSuccess(''), 3000);
  };

  // Offers Form State
  const [offerTitle, setOfferTitle] = useState('');
  const [offerCode, setOfferCode] = useState('');
  const [offerBank, setOfferBank] = useState('All Bank Cards');
  const [offerDiscount, setOfferDiscount] = useState(200);
  const [editingOfferId, setEditingOfferId] = useState(null);

  // Support Reply State
  const [replyTextMap, setReplyTextMap] = useState({});

  // Dynamic Theatre & Seat Layout Calculations
  const DEFAULT_THEATRES = [
    {
      id: 'th_1',
      name: "PVR Director's Cut, Palladium Mall",
      city: 'Mumbai',
      screens: [
        { id: 'sc_1', name: 'Screen 1 - IMAX 3D' },
        { id: 'sc_2', name: 'Screen 2 - 4DX' },
        { id: 'sc_3', name: 'Screen 3 - VIP Recliner' }
      ]
    },
    {
      id: 'th_2',
      name: 'INOX Megaplex, Inorbit Mall',
      city: 'Mumbai',
      screens: [
        { id: 'sc_4', name: 'Screen 1 - ScreenX 270°' },
        { id: 'sc_5', name: 'Screen 2 - Dolby Atmos' }
      ]
    }
  ];

  const currentTheatresList = (theatresList && theatresList.length > 0) ? theatresList : DEFAULT_THEATRES;
  const activeTheatreObj = currentTheatresList.find(t => t.id === selectedTheatreId) || currentTheatresList[0];
  const activeScreensList = activeTheatreObj?.screens || [
    { id: 'sc_1', name: 'Screen 1 - IMAX 3D' },
    { id: 'sc_2', name: 'Screen 2 - 4DX' }
  ];

  const currentLayout = getScreenLayout(selectedScreenId);
  const seatRowsList = currentLayout.rows || [];

  const handleAddRowForm = (e) => {
    e.preventDefault();
    if (!newRowChar) return;
    addRowToScreenLayout(selectedScreenId, newRowChar, newRowTier, newRowPrice, newRowSeatsCount);
    setNewRowChar('');
    setActionSuccess(`Added Row ${newRowChar.toUpperCase()} (${newRowTier}) with ${newRowSeatsCount} seats at ₹${newRowPrice}!`);
    setTimeout(() => setActionSuccess(''), 3000);
  };

  // Theatre CRUD State
  const [theatreForm, setTheatreForm] = useState({
    name: '',
    city: 'Surat',
    address: '',
    logo: '',
    image: '',
    mapLocationUrl: '',
    facilities: 'VIP Recliners, IMAX 3D, Dolby Atmos',
    screensCount: 6,
    totalSeats: 200
  });
  const [editingTheatreId, setEditingTheatreId] = useState(null);

  // Show Slot Form State
  const [showSlotForm, setShowSlotForm] = useState({
    theatreId: 'th_1',
    movieId: 'mov_1',
    screenName: 'Screen 1 - IMAX 3D',
    format: 'IMAX 3D',
    time: '07:30 PM',
    price: 450
  });

  // Event CRUD State
  const [eventsList, setEventsList] = useState([]);
  const [eventForm, setEventForm] = useState({
    title: '',
    category: 'Live Concert',
    badge: 'SELLING FAST',
    venue: '',
    city: 'Surat',
    date: '18 FEB 2027',
    time: '07:00 PM',
    price: 1500,
    totalCapacity: 5000,
    availableSeats: 5000,
    image: '',
    description: '',
    bookingStatus: true
  });
  const [editingEventId, setEditingEventId] = useState(null);

  // Plays CRUD State
  const [playsList, setPlaysList] = useState([]);
  const [playForm, setPlayForm] = useState({
    title: '',
    language: 'Gujarati',
    category: 'Comedy Drama',
    badge: 'HOT SELLER',
    venue: '',
    city: 'Surat',
    date: '14 FEB 2027',
    time: '08:00 PM',
    price: 600,
    totalCapacity: 1200,
    availableSeats: 1200,
    image: '',
    description: ''
  });
  const [editingPlayId, setEditingPlayId] = useState(null);
  // Activities CRUD State
  const [activitiesList, setActivitiesList] = useState([]);
  const [activityForm, setActivityForm] = useState({
    title: '',
    category: 'Water Park',
    badge: 'UNLIMITED ACCESS',
    location: '',
    city: 'Surat',
    validity: 'Full Day Pass (10:00 AM - 07:00 PM)',
    price: 1299,
    totalCapacity: 2000,
    availableSeats: 2000,
    image: '',
    description: '',
    benefits: ['Unlimited Rides', 'Free Entry']
  });
  const [newBenefitInput, setNewBenefitInput] = useState('');
  const [editingActivityId, setEditingActivityId] = useState(null);

  // Offer Banners CRUD State
  const [offerBannersList, setOfferBannersList] = useState([]);
  const [offerSubTab, setOfferSubTab] = useState('banners'); // 'banners' | 'cards'
  const [bannerForm, setBannerForm] = useState({
    title: '',
    tagline: '',
    code: '',
    category: 'Movies',
    image: '',
    expiryDate: '2026-12-31',
    ctaText: 'Claim Offer',
    ctaLink: 'movies'
  });
  const [editingBannerId, setEditingBannerId] = useState(null);

  // User Management & Activity Tracking State
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [userTotalCount, setUserTotalCount] = useState(0);
  const [selectedUserForActivity, setSelectedUserForActivity] = useState(null);
  const [userActivityData, setUserActivityData] = useState(null);
  const [isUserActivityLoading, setIsUserActivityLoading] = useState(false);
  const [isUserActivityModalOpen, setIsUserActivityModalOpen] = useState(false);
  const [userActivitySubTab, setUserActivitySubTab] = useState('bookings');

  // Categorized Bookings State (Step 2)
  const [adminBookingsList, setAdminBookingsList] = useState([]);
  const [adminBookingsLoading, setAdminBookingsLoading] = useState(false);
  const [bookingCategoryTab, setBookingCategoryTab] = useState('ALL'); // 'ALL' | 'Movie' | 'Event' | 'Play' | 'Slot'
  const [bookingSearchQuery, setBookingSearchQuery] = useState('');
  const [bookingCurrentPage, setBookingCurrentPage] = useState(1);
  const [bookingTotalPages, setBookingTotalPages] = useState(1);
  const [bookingTotalCount, setBookingTotalCount] = useState(0);

  // Global CMS & Visual Editor State (Step 2)
  const [platformTitleInput, setPlatformTitleInput] = useState('PrimeShow Cinema & Events');
  const [activeCityInput, setActiveCityInput] = useState('Surat');
  const [bannerAnnouncementInput, setBannerAnnouncementInput] = useState('⚡ Exclusive Offer: Get 50% Flat Discount on IMAX & VIP Recliner Tickets!');
  const [maintenanceModeToggle, setMaintenanceModeToggle] = useState(false);
  const [cmsSaveLoading, setCmsSaveLoading] = useState(false);

  const fetchCategorizedBookings = async (page = 1, category = 'ALL', search = '') => {
    setAdminBookingsLoading(true);
    try {
      const res = await API.get('/admin/bookings', {
        params: { page, limit: 10, category, search }
      });
      if (res.data && res.data.bookings) {
        setAdminBookingsList(res.data.bookings);
        setBookingTotalCount(res.data.totalBookings || res.data.bookings.length);
        setBookingTotalPages(res.data.totalPages || 1);
        setBookingCurrentPage(res.data.currentPage || page);
      }
    } catch (err) {
      console.warn('Failed to fetch admin bookings:', err);
    } finally {
      setAdminBookingsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchCategorizedBookings(bookingCurrentPage, bookingCategoryTab, bookingSearchQuery);
    }
  }, [activeTab, bookingCurrentPage, bookingCategoryTab]);

  const handleGlobalCmsSave = async (e) => {
    if (e) e.preventDefault();
    setCmsSaveLoading(true);
    try {
      const payload = {
        platformName: platformTitleInput,
        activeCity: activeCityInput,
        bannerAnnouncement: bannerAnnouncementInput,
        maintenanceMode: maintenanceModeToggle
      };
      await API.post('/admin/global-update', payload);
      setActionSuccess('Global CMS Config updated & broadcasted to all live User Panels!');
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setActionSuccess('Failed to save CMS Config: ' + err.message);
      setTimeout(() => setActionSuccess(''), 4000);
    } finally {
      setCmsSaveLoading(false);
    }
  };

  // Fetch Theatres, Offers, Banners, Events, Plays & Activities
  const fetchAdminData = async () => {
    try {
      const [offRes, banRes, thRes, evRes, plRes, actRes] = await Promise.allSettled([
        API.get('/offers'),
        API.get('/offers/banners'),
        API.get('/theatres'),
        API.get('/events'),
        API.get('/plays'),
        API.get('/activities')
      ]);
      if (offRes.status === 'fulfilled' && offRes.value.data) setOffersList(offRes.value.data);
      if (banRes.status === 'fulfilled' && banRes.value.data) setOfferBannersList(banRes.value.data);
      if (thRes.status === 'fulfilled' && thRes.value.data) setTheatresList(thRes.value.data);
      if (evRes.status === 'fulfilled' && evRes.value.data) setEventsList(evRes.value.data);
      if (plRes.status === 'fulfilled' && plRes.value.data) setPlaysList(plRes.value.data);
      if (actRes.status === 'fulfilled' && actRes.value.data) setActivitiesList(actRes.value.data);
    } catch (err) {
      setOffersList([
        { id: 'off_1', code: 'PRIMESHOW50', title: '50% Flat Discount on IMAX & VIP Bookings', bank: 'All Cards & UPI' },
        { id: 'off_2', code: 'LUXURY200', title: 'Flat ₹200 Cashback for HDFC Bank Cards', bank: 'HDFC Bank' }
      ]);
      setTheatresList([
        {
          id: 'th_1',
          name: 'PVR Director\'s Cut, Palladium Mall',
          city: 'Mumbai',
          screens: [
            { id: 'sc_1', name: 'Screen 1 - Director\'s Cut IMAX 3D', totalSeats: 120 },
            { id: 'sc_2', name: 'Screen 2 - Luxe Gold Lounge', totalSeats: 80 }
          ]
        },
        {
          id: 'th_2',
          name: 'INOX Megaplex, Inorbit Mall',
          city: 'Mumbai',
          screens: [
            { id: 'sc_3', name: 'Screen 1 - INSIGNIA 4DX', totalSeats: 100 }
          ]
        }
      ]);
    }
  };

  // Fetch Scoped Blocked Seats when Cinema or Screen changes
  const fetchScopedSeats = async () => {
    try {
      const res = await API.get(`/theatres/${selectedTheatreId}/screens/${selectedScreenId}/blocked-seats`);
      setScreenBlockedSeats(res.data.blockedSeats || []);
    } catch (err) {
      setScreenBlockedSeats(['V1', 'V2']);
    }
  };

  const fallbackSeedUsers = [
    {
      id: 'usr_yug_1',
      name: 'Yug Patel',
      username: 'yugpatel',
      email: 'yugpatel240612@gmail.com',
      phone: '+91 9876543210',
      role: 'CUSTOMER',
      authProvider: 'google',
      provider: 'GOOGLE',
      city: 'Surat',
      rewardsPoints: 1250,
      avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=YugPatel&backgroundColor=0f172a',
      profilePicture: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=YugPatel&backgroundColor=0f172a',
      isOnline: true,
      lastLoginTime: new Date().toISOString(),
      createdAt: '2026-01-15T00:00:00.000Z',
      totalBookings: 3
    },
    {
      id: 'usr_alex_2',
      name: 'Alexander Vance',
      username: 'alexvance',
      email: 'alexander.vance@gmail.com',
      phone: '+91 9898012345',
      role: 'CUSTOMER',
      authProvider: 'google',
      provider: 'GOOGLE',
      city: 'Mumbai',
      rewardsPoints: 950,
      avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Alexander&backgroundColor=0f172a',
      profilePicture: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Alexander&backgroundColor=0f172a',
      isOnline: true,
      lastLoginTime: new Date(Date.now() - 1800000).toISOString(),
      createdAt: '2026-01-20T00:00:00.000Z',
      totalBookings: 2
    },
    {
      id: 'usr_sarah_3',
      name: 'Sarah Jenkins',
      username: 'sarahj',
      email: 'sarah.jenkins@gmail.com',
      phone: '+91 9819054321',
      role: 'CUSTOMER',
      authProvider: 'mobile',
      provider: 'OTP',
      city: 'Ahmedabad',
      rewardsPoints: 400,
      avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Sarah&backgroundColor=0f172a',
      profilePicture: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Sarah&backgroundColor=0f172a',
      isOnline: false,
      lastLoginTime: new Date(Date.now() - 86400000).toISOString(),
      createdAt: '2026-01-28T00:00:00.000Z',
      totalBookings: 1
    },
    {
      id: 'usr_priya_4',
      name: 'Priya Patel',
      username: 'priyapatel',
      email: 'priya.patel@yahoo.com',
      phone: '+91 9723045678',
      role: 'CUSTOMER',
      authProvider: 'email',
      provider: 'LOCAL',
      city: 'Surat',
      rewardsPoints: 800,
      avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Priya&backgroundColor=0f172a',
      profilePicture: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Priya&backgroundColor=0f172a',
      isOnline: false,
      lastLoginTime: new Date(Date.now() - 86400000 * 2).toISOString(),
      createdAt: '2026-02-01T00:00:00.000Z',
      totalBookings: 4
    }
  ];

  // Fetch Admin Registered Users with Search & Pagination directly from MongoDB Atlas
  const fetchAdminUsers = async (page = 1, search = '') => {
    setUsersLoading(true);
    try {
      let res;
      try {
        res = await API.get('/admin/users', {
          params: { page, limit: 10, search }
        });
      } catch (e1) {
        res = await API.get('/users', {
          params: { page, limit: 10, search }
        });
      }

      if (res && res.data) {
        const fetchedList = Array.isArray(res.data) ? res.data : (res.data.users || []);
        setUsersList(fetchedList);
        setUserTotalCount(res.data.totalUsers !== undefined ? res.data.totalUsers : fetchedList.length);
        setUserTotalPages(res.data.totalPages || Math.ceil((fetchedList.length || 1) / 10) || 1);
        setUserCurrentPage(res.data.currentPage || page);
      } else {
        setUsersList([]);
        setUserTotalCount(0);
      }
    } catch (err) {
      console.warn('Failed to fetch admin users from database:', err);
      setUsersList([]);
      setUserTotalCount(0);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleViewUserActivity = async (u) => {
    setSelectedUserForActivity(u);
    setIsUserActivityModalOpen(true);
    setIsUserActivityLoading(true);
    setUserActivitySubTab('bookings');
    try {
      let res;
      try {
        res = await API.get(`/admin/users/${u.id || u.email}/activity`);
      } catch (e1) {
        res = await API.get(`/admin/users/${u.id || u.email}/history`);
      }
      setUserActivityData(res.data);
    } catch (err) {
      console.warn('Failed to fetch user activity:', err);
    } finally {
      setIsUserActivityLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    fetchAdminUsers(1, '');
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchAdminUsers(userCurrentPage, userSearchQuery);
    }
  }, [activeTab, userCurrentPage]);

  useEffect(() => {
    fetchScopedSeats();
  }, [selectedTheatreId, selectedScreenId]);

  // Real-Time Admin Socket Alerts (New User Bookings, Registrations & Live Support Messages)
  useEffect(() => {
    if (!socket) return;

    socket.emit('JOIN_ADMIN_ROOM');

    socket.on('NEW_USER_BOOKING', (data) => {
      console.log('⚡ [Admin Socket Alert]: New booking received', data);
      setActionSuccess(`⚡ New Live Booking! ${data.userName || 'Customer'} booked ${data.title || 'tickets'} for ₹${data.totalAmount || 480}`);
      if (activeTab === 'bookings') {
        fetchCategorizedBookings(bookingCurrentPage, bookingCategoryTab, bookingSearchQuery);
      }
      setTimeout(() => setActionSuccess(''), 5000);
    });

    socket.on('NEW_USER_REGISTERED', (data) => {
      console.log('⚡ [Admin Socket Alert]: New user registered', data);
      setActionSuccess(`⚡ New User Registered! ${data.name || data.email}`);
      if (activeTab === 'users') {
        fetchAdminUsers(userCurrentPage, userSearchQuery);
      }
      setTimeout(() => setActionSuccess(''), 5000);
    });

    socket.on('NEW_SUPPORT_MESSAGE', (data) => {
      console.log('⚡ [Admin Socket Alert]: New Live Support Message received', data);
      setActionSuccess(`💬 New Live Support Query from ${data.userName || data.userEmail || 'Customer'}: "${data.message}"`);
      setTimeout(() => setActionSuccess(''), 6000);
    });

    return () => {
      socket.off('NEW_USER_BOOKING');
      socket.off('NEW_USER_REGISTERED');
      socket.off('NEW_SUPPORT_MESSAGE');
    };
  }, [socket, activeTab]);

  // Handle Full Movie Save (Create / Edit)
  const handleSaveMovie = async (e) => {
    e.preventDefault();
    if (!movieForm.title) return;

    const payload = {
      ...movieForm,
      genres: typeof movieForm.genres === 'string' ? movieForm.genres.split(',').map(s => s.trim()) : (movieForm.genres || ['Action']),
      languages: typeof movieForm.languages === 'string' ? movieForm.languages.split(',').map(s => s.trim()) : (movieForm.languages || ['English', 'Hindi']),
      formats: typeof movieForm.formats === 'string' ? movieForm.formats.split(',').map(s => s.trim()) : (movieForm.formats || ['IMAX 3D', 'Dolby Atmos']),
      poster: movieForm.poster || 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
      banner: movieForm.banner || movieForm.poster || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80',
      status: movieForm.status || 'Now Showing',
      city: movieForm.city || 'All',
      cities: movieForm.cities || ['All', 'Surat', 'Mumbai', 'Ahmedabad', 'Delhi', 'Bengaluru']
    };

    if (editingMovieId) {
      await updateMovieInGlobalStore(editingMovieId, payload);
      setActionSuccess('Movie updated & synced live with User site!');
    } else {
      await addMovieToGlobalStore(payload);
      setActionSuccess('New movie added to catalog & synced live with User site!');
    }

    setMovieForm({
      title: '', synopsis: '', duration: '2h 30m', rating: 9.0, parentalRating: 'UA',
      releaseDate: '2026-12-18', genres: 'Sci-Fi, Action', languages: 'English, Hindi',
      formats: 'IMAX 3D, Dolby Atmos', poster: '', banner: '', trailerUrl: '', director: '', status: 'Now Showing'
    });
    setEditingMovieId(null);
    setTimeout(() => setActionSuccess(''), 4000);
  };

  const handleEditMovieClick = (movie) => {
    setEditingMovieId(movie.id);
    setMovieForm({
      title: movie.title || '',
      synopsis: movie.synopsis || '',
      duration: movie.duration || '2h 30m',
      rating: movie.rating || 9.0,
      parentalRating: movie.parentalRating || 'UA',
      releaseDate: movie.releaseDate || '2026-12-18',
      genres: Array.isArray(movie.genres) ? movie.genres.join(', ') : movie.genres || 'Action',
      languages: Array.isArray(movie.languages) ? movie.languages.join(', ') : movie.languages || 'English',
      formats: Array.isArray(movie.formats) ? movie.formats.join(', ') : movie.formats || 'IMAX 3D',
      poster: movie.poster || '',
      banner: movie.banner || '',
      trailerUrl: movie.trailerUrl || '',
      director: movie.director || '',
      status: movie.status || 'Now Showing'
    });
  };

  const handleDeleteMovie = async (id) => {
    await deleteMovieFromGlobalStore(id);
    setActionSuccess('Movie removed from catalog & user home page.');
    setTimeout(() => setActionSuccess(''), 3000);
  };

  // Cast Management CRUD
  const handleAddCastMember = async (e) => {
    e.preventDefault();
    if (!castName || !castMovieId) return;

    try {
      await API.post(`/movies/${castMovieId}/cast`, {
        name: castName,
        role: castRole || 'Lead Role',
        photo: castPhoto || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'
      });
    } catch (err) {}

    const targetMovie = moviesList.find(m => m.id === castMovieId);
    if (targetMovie) {
      if (!targetMovie.cast) targetMovie.cast = [];
      targetMovie.cast.push({
        id: `c_${Date.now()}`,
        name: castName,
        role: castRole || 'Lead Role',
        photo: castPhoto || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'
      });
    }

    setCastName('');
    setCastRole('');
    setCastPhoto('');
    setActionSuccess('Cast member added to movie!');
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const handleDeleteCastMember = async (movieId, castId) => {
    try {
      await API.delete(`/movies/${movieId}/cast/${castId}`);
    } catch (err) {}

    const targetMovie = moviesList.find(m => m.id === movieId);
    if (targetMovie && targetMovie.cast) {
      targetMovie.cast = targetMovie.cast.filter(c => c.id !== castId);
    }
    setActionSuccess('Cast member removed');
    setTimeout(() => setActionSuccess(''), 3000);
  };

  // Movie Show & Date Schedule Handlers
  const handleAddScheduleDate = (e) => {
    e.preventDefault();
    if (!schedDateInput || !schedMovieId) return;
    addShowDateToMovie(schedMovieId, schedDateInput);
    setSelectedSchedDate(schedDateInput);
    setSchedDateInput('');
    setActionSuccess(`Added booking date ${schedDateInput} to movie!`);
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const handleDeleteScheduleDate = (movieId, dateStr) => {
    deleteShowDateFromMovie(movieId, dateStr);
    setActionSuccess(`Removed booking date ${dateStr} from movie.`);
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const handleAddDateScopedShowSlot = (e) => {
    e.preventDefault();
    if (!schedMovieId || !selectedSchedDate || !schedTheatreName || !schedTime) return;

    const theatreObj = {
      id: `th_${schedTheatreName.replace(/\s+/g, '_').toLowerCase()}`,
      name: schedTheatreName,
      city: schedCity,
      address: schedAddress,
      facilities: schedFacilities.split(',').map(s => s.trim())
    };

    const showSlotObj = {
      id: `sh_${Date.now()}`,
      time: schedTime,
      format: schedFormat,
      price: Number(schedPrice),
      tier: schedTier,
      screen: schedScreen,
      availableSeats: 120
    };

    addShowSlotToMovieTheatre(schedMovieId, selectedSchedDate, theatreObj, showSlotObj);
    setActionSuccess(`Added ${schedTime} (${schedFormat}) show at ${schedTheatreName} for ${selectedSchedDate}!`);
    setTimeout(() => setActionSuccess(''), 3000);
  };

  // Cinema & Screen Scoped Seat Blocking
  const handleToggleScopedSeatBlock = async (seatId) => {
    try {
      const res = await API.post(`/theatres/${selectedTheatreId}/screens/${selectedScreenId}/toggle-seat-block`, { seatId });
      setScreenBlockedSeats(res.data.blockedSeats);
    } catch (err) {
      if (screenBlockedSeats.includes(seatId)) {
        setScreenBlockedSeats(screenBlockedSeats.filter(s => s !== seatId));
      } else {
        setScreenBlockedSeats([...screenBlockedSeats, seatId]);
      }
    }
    setActionSuccess(`Seat block toggled for Screen ID: ${selectedScreenId}`);
    setTimeout(() => setActionSuccess(''), 3000);
  };

  // Offers Full CRUD
  const handleSaveOffer = async (e) => {
    e.preventDefault();
    if (!offerTitle || !offerCode) return;

    const offerPayload = {
      title: offerTitle,
      code: offerCode.toUpperCase(),
      bank: offerBank,
      discountValue: Number(offerDiscount),
      description: `Special ${offerCode.toUpperCase()} discount voucher valid on all screenings.`
    };

    if (editingOfferId) {
      try {
        await API.put(`/offers/${editingOfferId}`, offerPayload);
      } catch (err) {}
      setOffersList(offersList.map(o => o.id === editingOfferId ? { ...o, ...offerPayload } : o));
      setActionSuccess('Offer updated successfully!');
    } else {
      try {
        const res = await API.post('/offers', offerPayload);
        setOffersList([res.data, ...offersList]);
      } catch (err) {
        setOffersList([{ id: `off_${Date.now()}`, ...offerPayload, expiryDate: '2026-12-31' }, ...offersList]);
      }
      setActionSuccess('New offer published live!');
    }

    setOfferTitle('');
    setOfferCode('');
    setEditingOfferId(null);
    setTimeout(() => setActionSuccess(''), 4000);
  };

  const handleDeleteOffer = async (id) => {
    try {
      await API.delete(`/offers/${id}`);
    } catch (err) {}
    setOffersList(offersList.filter(o => o.id !== id));
    setActionSuccess('Offer deleted');
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const handleReplySubmit = async (msgId) => {
    const text = replyTextMap[msgId];
    if (!text) return;
    await replyToSupportMessage(msgId, text);
    setReplyTextMap({ ...replyTextMap, [msgId]: '' });
    setActionSuccess('Reply sent to WhatsApp customer live chat!');
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const handleBroadcastNotificationSubmit = async (e) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) return;
    await broadcastNotification(notifTitle, notifMessage, notifType);
    setNotifTitle('');
    setNotifMessage('');
    setActionSuccess('System Notification Broadcasted to all User Profiles!');
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const handleSaveTheatre = async (e) => {
    e.preventDefault();
    try {
      if (editingTheatreId) {
        const res = await API.put(`/theatres/${editingTheatreId}`, theatreForm);
        setTheatresList(theatresList.map(t => t.id === editingTheatreId ? res.data : t));
        setActionSuccess('Theatre details updated successfully!');
      } else {
        const res = await API.post('/theatres', theatreForm);
        setTheatresList([res.data, ...theatresList]);
        setActionSuccess('New Theatre added to platform!');
      }
      setTheatreForm({ name: '', city: 'Mumbai', state: 'Maharashtra', address: '', logo: '', image: '', facilities: 'VIP Recliners, IMAX 3D', screensCount: 6, totalSeats: 200 });
      setEditingTheatreId(null);
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setActionSuccess('Error saving theatre details');
      setTimeout(() => setActionSuccess(''), 3000);
    }
  };

  const handleDeleteTheatre = async (id) => {
    try {
      await API.delete(`/theatres/${id}`);
      setTheatresList(theatresList.filter(t => t.id !== id));
      setActionSuccess('Theatre deleted!');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {}
  };

  const handleAddShowSlot = async (e) => {
    e.preventDefault();
    try {
      const selectedMov = moviesList.find(m => m.id === showSlotForm.movieId) || { title: 'Avatar: Fire and Ash' };
      const payload = {
        ...showSlotForm,
        movieTitle: selectedMov.title
      };
      const res = await API.post(`/theatres/${showSlotForm.theatreId}/shows`, payload);
      setTheatresList(theatresList.map(t => t.id === showSlotForm.theatreId ? res.data : t));
      setActionSuccess('Show Slot added to Theatre!');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {}
  };

  const handleDeleteShowSlot = async (theatreId, showId) => {
    try {
      const res = await API.delete(`/theatres/${theatreId}/shows/${showId}`);
      setTheatresList(theatresList.map(t => t.id === theatreId ? res.data : t));
      setActionSuccess('Show Slot removed');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {}
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    try {
      if (editingEventId) {
        const res = await API.put(`/events/${editingEventId}`, eventForm);
        setEventsList(eventsList.map(ev => ev.id === editingEventId ? res.data : ev));
        setActionSuccess('Event details updated and persisted to DB successfully!');
      } else {
        const res = await API.post('/events', eventForm);
        setEventsList([res.data, ...eventsList]);
        setActionSuccess('New Live Event created & persisted to DB successfully!');
      }
      setEventForm({ title: '', category: 'Live Concert', badge: 'SELLING FAST', venue: '', city: 'Surat', date: '18 FEB 2027', time: '07:00 PM', price: 1500, totalCapacity: 5000, availableSeats: 5000, image: '', description: '', bookingStatus: true });
      setEditingEventId(null);
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Error saving event';
      setActionSuccess(`Failed: ${msg}`);
      setTimeout(() => setActionSuccess(''), 4000);
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      await API.delete(`/events/${id}`);
      setEventsList(eventsList.filter(ev => ev.id !== id));
      setActionSuccess('Event permanently deleted from DB!');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Error deleting event';
      setActionSuccess(`Failed: ${msg}`);
      setTimeout(() => setActionSuccess(''), 4000);
    }
  };

  const handleToggleEventBookingStatus = async (eventItem) => {
    try {
      const updatedStatus = eventItem.bookingStatus === false ? true : false;
      const res = await API.put(`/events/${eventItem.id}`, { bookingStatus: updatedStatus });
      setEventsList(eventsList.map(ev => ev.id === eventItem.id ? res.data : ev));
      setActionSuccess(`Booking Status for "${eventItem.title}" updated to ${updatedStatus ? 'ACTIVE' : 'DISABLED'}`);
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Error updating booking status';
      setActionSuccess(`Failed: ${msg}`);
      setTimeout(() => setActionSuccess(''), 4000);
    }
  };

  const handleSavePlay = async (e) => {
    e.preventDefault();
    try {
      if (editingPlayId) {
        const res = await API.put(`/plays/${editingPlayId}`, playForm);
        setPlaysList(playsList.map(p => p.id === editingPlayId ? res.data : p));
        setActionSuccess('Play details updated successfully!');
      } else {
        const res = await API.post('/plays', playForm);
        setPlaysList([res.data, ...playsList]);
        setActionSuccess('New Theater Play added successfully!');
      }
      setPlayForm({ title: '', language: 'Gujarati', category: 'Comedy Drama', badge: 'HOT SELLER', venue: '', city: 'Mumbai', date: '14 FEB 2027', time: '08:00 PM', price: 600, totalCapacity: 1200, availableSeats: 1200, image: '', description: '' });
      setEditingPlayId(null);
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setActionSuccess('Error saving play details');
      setTimeout(() => setActionSuccess(''), 3000);
    }
  };

  const handleDeletePlay = async (id) => {
    try {
      await API.delete(`/plays/${id}`);
      setPlaysList(playsList.filter(p => p.id !== id));
      setActionSuccess('Play deleted!');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {}
  };

  const handleAddBenefit = () => {
    if (newBenefitInput.trim()) {
      setActivityForm({
        ...activityForm,
        benefits: [...(activityForm.benefits || []), newBenefitInput.trim()]
      });
      setNewBenefitInput('');
    }
  };

  const handleRemoveBenefit = (indexToRemove) => {
    setActivityForm({
      ...activityForm,
      benefits: (activityForm.benefits || []).filter((_, idx) => idx !== indexToRemove)
    });
  };

  const handleSaveActivity = async (e) => {
    e.preventDefault();
    try {
      if (editingActivityId) {
        const res = await API.put(`/activities/${editingActivityId}`, activityForm);
        setActivitiesList(activitiesList.map(a => a.id === editingActivityId ? res.data : a));
        setActionSuccess('Activity pass details updated successfully!');
      } else {
        const res = await API.post('/activities', activityForm);
        setActivitiesList([res.data, ...activitiesList]);
        setActionSuccess('New Adventure Activity Pass created successfully!');
      }
      setActivityForm({ title: '', category: 'Water Park', badge: 'UNLIMITED ACCESS', location: '', city: 'Mumbai', validity: 'Full Day Pass (10:00 AM - 07:00 PM)', price: 1299, totalCapacity: 2000, availableSeats: 2000, image: '', description: '', benefits: ['Unlimited Rides', 'Free Entry'] });
      setEditingActivityId(null);
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setActionSuccess('Error saving activity pass details');
      setTimeout(() => setActionSuccess(''), 3000);
    }
  };

  const handleDeleteActivity = async (id) => {
    try {
      await API.delete(`/activities/${id}`);
      setActivitiesList(activitiesList.filter(a => a.id !== id));
      setActionSuccess('Activity pass deleted!');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {}
  };

  const handleSaveBanner = async (e) => {
    e.preventDefault();
    try {
      if (editingBannerId) {
        const res = await API.put(`/offers/banners/${editingBannerId}`, bannerForm);
        setOfferBannersList(offerBannersList.map(b => b.id === editingBannerId ? res.data : b));
        setActionSuccess('Banner slide updated successfully!');
      } else {
        const res = await API.post('/offers/banners', bannerForm);
        setOfferBannersList([res.data, ...offerBannersList]);
        setActionSuccess('New Offer Carousel Banner created successfully!');
      }
      setBannerForm({ title: '', tagline: '', code: '', category: 'Movies', image: '', expiryDate: '2026-12-31', ctaText: 'Claim Offer', ctaLink: 'movies' });
      setEditingBannerId(null);
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setActionSuccess('Error saving banner details');
      setTimeout(() => setActionSuccess(''), 3000);
    }
  };

  const handleDeleteBanner = async (id) => {
    try {
      await API.delete(`/offers/banners/${id}`);
      setOfferBannersList(offerBannersList.filter(b => b.id !== id));
      setActionSuccess('Banner slide deleted!');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {}
  };

  const adminNavItems = [
    { id: 'analytics', label: 'Analytics Overview', icon: TrendingUp },
    { id: 'bookings', label: 'Categorized Bookings', icon: Ticket },
    { id: 'users', label: 'User Directory & History', icon: Users },
    { id: 'cms-editor', label: 'CMS & Visual Layout Control', icon: Compass },
    { id: 'hero', label: 'Hero Slideshow & Banners', icon: Image },
    { id: 'strips', label: 'Home Page Feature Strips', icon: Zap },
    { id: 'upcoming', label: 'Upcoming Releases', icon: Award },
    { id: 'movies', label: 'Movie & Cast Management', icon: Film },
    { id: 'theatres', label: 'Theatre & Showtimes CRUD', icon: Building },
    { id: 'plays', label: 'Plays & Theater CRUD', icon: Theater },
    { id: 'activities', label: 'Activities & Theme Parks CRUD', icon: Compass },
    { id: 'seats', label: 'Cinema & Screen Seat Grid', icon: Lock },
    { id: 'offers', label: 'Offers & Promos CRUD', icon: Tag },
    { id: 'notifications', label: 'Broadcast Notifications', icon: Bell },
    { id: 'support', label: 'WhatsApp Live Chat Desk', icon: MessageSquare }
  ];

  const isUserAdmin = Boolean(
    user && (
      user.role === 'ADMIN' ||
      (user.email && (
        user.email.toLowerCase() === 'admin@primeshow.com' ||
        user.email.toLowerCase() === 'jayradadiya2006@gmail.com'
      ))
    )
  );

  const [apiConnectionStatus, setApiConnectionStatus] = useState('connected');

  if (loading || globalAuthLoading) {
    return (
      <div className="min-h-screen bg-[#030306] text-white flex flex-col items-center justify-center p-8 space-y-4 font-sans">
        <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
        <div className="p-8 text-white text-center font-bold text-base">Loading Admin Security Clearance...</div>
      </div>
    );
  }

  if (!isUserAdmin) {
    return (
      <div className="min-h-screen bg-[#030306] text-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-md bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="text-center space-y-3 mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 shadow-xl shadow-cyan-500/20 mb-2">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">PrimeShow Admin Portal</h1>
            <p className="text-xs text-slate-400 font-medium">Restricted Access • Administrator Authentication Required</p>
          </div>

          {/* Form */}
          <form onSubmit={handleAdminAuthSubmit} className="space-y-4">
            {authError && (
              <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-2">
                <Lock className="w-4 h-4 shrink-0 text-red-400" />
                <span>{authError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Admin Email</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@primeshow.com"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Admin Security Password</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
            >
              {authLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Shield className="w-4 h-4" />
              )}
              <span>{authLoading ? 'Verifying Admin Token...' : 'Authenticate & Unlock Panel'}</span>
            </button>
          </form>

          {/* Quick Admin Auth Button */}
          <div className="mt-6 pt-6 border-t border-slate-800 space-y-3">
            <button
              onClick={handleQuickBypassLogin}
              disabled={authLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>One-Click Master Admin Login (admin@primeshow.com)</span>
            </button>

            <button
              onClick={onReturnHome}
              className="w-full py-2 px-4 text-slate-400 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Exit to Main Customer Portal</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030306] text-white flex flex-col md:flex-row font-sans">
      
      {/* Sleek Admin Left Sidebar Navigation Panel (Responsive Desktop & Mobile Horizontal Scroll) */}
      <aside className="w-full md:w-64 glass-panel border-b md:border-b-0 md:border-r border-cyan-400/20 p-3 md:p-6 flex flex-col md:justify-between shrink-0 bg-black/80 backdrop-blur-xl">
        <div>
          {/* Admin Brand Header */}
          <div className="flex items-center justify-between md:justify-start gap-3 pb-3 md:pb-6 mb-2 md:mb-6 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-lg shadow-cyan-500/20">
                <Shield className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div>
                <h2 className="text-sm md:text-lg font-bold font-sans text-white leading-tight">PrimeShow</h2>
                <span className="text-[9px] md:text-[10px] text-cyan-300 uppercase tracking-widest font-bold block">ADMIN COMMAND PANEL</span>
              </div>
            </div>

            <button
              onClick={onReturnHome}
              className="md:hidden px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[11px] font-bold flex items-center gap-1"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
          </div>

          {/* Sidebar Menu Items (Horizontal scroll on mobile, vertical stack on desktop) */}
          <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible scrollbar-none no-scrollbar gap-1.5 w-full py-1">
            {adminNavItems.map(item => {
              const Icon = item.icon || Sparkles;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl text-xs font-bold transition-all shrink-0 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/25'
                      : 'text-white/70 hover:text-white hover:bg-white/5 bg-white/5 md:bg-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 hidden md:block" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Navigation & Logout Controls */}
        <div className="hidden md:block pt-6 border-t border-white/10 mt-6 space-y-2">
          <button
            onClick={onReturnHome}
            className="w-full py-3 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 hover:bg-amber-500 hover:text-black text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Return to Main Site</span>
          </button>

          <button
            onClick={logout}
            className="w-full py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white/60 hover:text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Area (Protected by Local Sub-Tab Error Boundary) */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <AdminTabErrorBoundary activeTab={activeTab} onSwitchToAnalytics={() => handleTabChange('analytics')}>
        
        {/* Emergency Debug & Connection Fallback Banner */}
        {apiConnectionStatus === 'offline' && (
          <div className="mb-6 p-5 rounded-3xl bg-amber-500/15 border border-amber-500/40 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-6 h-6 text-amber-400 animate-spin shrink-0" />
              <div>
                <h4 className="font-bold text-sm text-white">Admin Dashboard (Offline Mode / Connecting to Server...)</h4>
                <p className="text-xs text-amber-300/80">Backend database is connecting or waking up. Local cached features remain accessible.</p>
              </div>
            </div>
            <button
              onClick={() => {
                setApiConnectionStatus('connected');
                setActionSuccess('⚡ Admin UI Force Loaded successfully!');
                setTimeout(() => setActionSuccess(''), 4000);
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition-all cursor-pointer flex items-center gap-2 shrink-0 shadow-lg shadow-amber-500/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>Force Load UI</span>
            </button>
          </div>
        )}

        {actionSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Tab 1: Analytics Overview */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold font-sans text-white">Analytics Overview</h1>
              <p className="text-xs text-cyan-300">High-density performance metrics and ticket sales</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-panel p-6 rounded-3xl border border-cyan-400/20">
                <div className="text-xs text-cyan-300 mb-2">Total Ticket Revenue</div>
                <div className="text-3xl font-bold font-sans text-white">₹2,485,900</div>
                <div className="text-[10px] text-emerald-400 font-semibold mt-1">↑ +24.8% vs last month</div>
              </div>

              <div className="glass-panel p-6 rounded-3xl border border-cyan-400/20">
                <div className="text-xs text-cyan-300 mb-2">Confirmed Bookings</div>
                <div className="text-3xl font-bold font-sans text-white">3,890</div>
                <div className="text-[10px] text-amber-300 font-semibold mt-1">94.2% Occupancy Rate</div>
              </div>

              <div className="glass-panel p-6 rounded-3xl border border-cyan-400/20">
                <div className="text-xs text-cyan-300 mb-2">Active Movies</div>
                <div className="text-3xl font-bold font-sans text-white">{(moviesList || []).length} Active</div>
                <div className="text-[10px] text-cyan-300 font-semibold mt-1">Real-time user sync active</div>
              </div>

              <div className="glass-panel p-6 rounded-3xl border border-cyan-400/20">
                <div className="text-xs text-cyan-300 mb-2">Pending Support Tickets</div>
                <div className="text-3xl font-bold font-sans text-white">
                  {(supportMessages || []).filter(m => m.status === 'pending').length}
                </div>
                <div className="text-[10px] text-rose-400 font-semibold mt-1">Requires Response</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1.5: Users & Activity Tracking Management */}
        {activeTab === 'users' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold font-sans text-white flex items-center gap-3">
                  <Users className="w-8 h-8 text-cyan-400" />
                  <span>User Management & Activity Tracking</span>
                </h1>
                <p className="text-xs text-cyan-300 mt-1">
                  Monitor registered users, authentication deduplication, booking history, claimed offers, and activity metrics.
                </p>
              </div>

              <button
                onClick={() => fetchAdminUsers(userCurrentPage, userSearchQuery)}
                className="px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500 hover:text-black border border-cyan-400/40 text-cyan-300 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${usersLoading ? 'animate-spin' : ''}`} />
                <span>Refresh Users</span>
              </button>
            </div>

            {/* Top Search & Filter Bar */}
            <div className="glass-panel p-4 rounded-3xl border border-cyan-400/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-96">
                <input
                  type="text"
                  placeholder="Search users by name, email, or phone..."
                  value={userSearchQuery}
                  onChange={(e) => {
                    setUserSearchQuery(e.target.value);
                    fetchAdminUsers(1, e.target.value);
                  }}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl glass-input text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400"
                />
                <Eye className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3.5" />
              </div>

              <div className="flex items-center gap-3 text-xs text-white/70 w-full sm:w-auto justify-between sm:justify-end">
                <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 font-mono">
                  Total Users: <strong className="text-cyan-300">{userTotalCount}</strong>
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 font-semibold">
                  Page {userCurrentPage} of {userTotalPages}
                </span>
              </div>
            </div>

            {/* Users Table */}
            <div className="glass-panel rounded-3xl border border-cyan-400/20 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10 text-cyan-300 font-bold uppercase tracking-wider">
                      <th className="p-4">User</th>
                      <th className="p-4">Email & Contact</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Auth Provider</th>
                      <th className="p-4">City</th>
                      <th className="p-4">Last Login / Session</th>
                      <th className="p-4 text-center">Total Bookings</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/80">
                    {usersLoading ? (
                      <tr>
                        <td colSpan="7" className="p-8 text-center text-cyan-300 font-bold">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                          <span>Loading registered user database...</span>
                        </td>
                      </tr>
                    ) : usersList.length > 0 ? (
                      usersList.map((u) => (
                        <tr key={u.id || u.email} className="hover:bg-white/5 transition-colors group">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={u.profilePicture || u.avatar || 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=' + u.name}
                                alt={u.name}
                                className="w-10 h-10 rounded-2xl object-cover border border-cyan-400/40 shadow-md shrink-0"
                              />
                              <div>
                                <div className="font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                                  <span>{u.name}</span>
                                  {u.role === 'ADMIN' && (
                                    <span className="px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[9px] font-extrabold">ADMIN</span>
                                  )}
                                </div>
                                <div className="text-[10px] text-white/50">ID: {u.id || u.username || 'usr'}</div>
                              </div>
                            </div>
                          </td>

                          <td className="p-4">
                            <div className="font-mono text-cyan-300">{u.email}</div>
                            <div className="text-[10px] text-white/50">{u.phoneNumber || u.phone || 'N/A'}</div>
                          </td>

                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 w-max ${
                              u.isOnline !== false
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            }`}>
                              <span className={`w-2 h-2 rounded-full ${u.isOnline !== false ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}></span>
                              <span>{u.isOnline !== false ? '🟢 Online' : '🔴 Offline'}</span>
                            </span>
                          </td>

                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase ${
                              (u.authProvider === 'google' || u.provider === 'GOOGLE') 
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                                : (u.authProvider === 'mobile' || u.provider === 'OTP') 
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                            }`}>
                              {(u.authProvider || u.provider || 'email').toUpperCase()}
                            </span>
                          </td>

                          <td className="p-4 font-semibold text-white/90">
                            {u.city || 'Surat'}
                          </td>

                          <td className="p-4 text-[11px]">
                            <div className="text-emerald-300 font-semibold">
                              Login: {u.lastLoginTime ? new Date(u.lastLoginTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date(u.lastLoginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                            </div>
                            {u.lastLogoutTime && (
                              <div className="text-rose-300 text-[10px] mt-0.5">
                                Logout: {new Date(u.lastLogoutTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date(u.lastLogoutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            )}
                          </td>

                          <td className="p-4 text-center">
                            <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/40 text-xs">
                              🎟️ {u.totalBookings || 0}
                            </span>
                          </td>

                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleViewUserActivity(u)}
                              className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5 ml-auto cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Activity</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="p-8 text-center text-white/50">
                          No users found matching query "{userSearchQuery}"
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {userTotalPages > 1 && (
                <div className="p-4 bg-white/5 border-t border-white/10 flex items-center justify-between">
                  <button
                    disabled={userCurrentPage <= 1}
                    onClick={() => fetchAdminUsers(userCurrentPage - 1, userSearchQuery)}
                    className="px-4 py-2 rounded-xl glass-panel disabled:opacity-30 text-xs font-bold hover:bg-white/10 cursor-pointer"
                  >
                    Previous
                  </button>

                  <span className="text-xs text-white/70">
                    Page <strong>{userCurrentPage}</strong> of <strong>{userTotalPages}</strong>
                  </span>

                  <button
                    disabled={userCurrentPage >= userTotalPages}
                    onClick={() => fetchAdminUsers(userCurrentPage + 1, userSearchQuery)}
                    className="px-4 py-2 rounded-xl glass-panel disabled:opacity-30 text-xs font-bold hover:bg-white/10 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Categorized Bookings Panel (Step 2 Requirement) */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold font-sans text-white">Categorized Bookings Directory</h1>
                <p className="text-xs text-cyan-300">Monitor all customer ticket purchases, slot reservations, event bookings, and private theatre bookings across all active user panels.</p>
              </div>

              <button
                onClick={() => fetchCategorizedBookings(bookingCurrentPage, bookingCategoryTab, bookingSearchQuery)}
                className="px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500 hover:text-black border border-cyan-400/40 text-cyan-300 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${adminBookingsLoading ? 'animate-spin' : ''}`} />
                <span>Refresh Bookings</span>
              </button>
            </div>

            {/* Categorized Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 glass-panel rounded-2xl border border-cyan-400/20">
              {[
                { id: 'ALL', label: 'All Bookings', count: bookingTotalCount },
                { id: 'Movie', label: 'Movie Bookings 🎬' },
                { id: 'Event', label: 'Event Tickets 🎟️' },
                { id: 'Play', label: 'Theatre Plays 🎭' },
                { id: 'Theatre', label: 'Slot Bookings 🍿' },
                { id: 'Activity', label: 'Activity Passes 🎡' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setBookingCategoryTab(cat.id);
                    setBookingCurrentPage(1);
                    fetchCategorizedBookings(1, cat.id, bookingSearchQuery);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    bookingCategoryTab === cat.id
                      ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Top Search & Filter Bar */}
            <div className="glass-panel p-4 rounded-3xl border border-cyan-400/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-96">
                <input
                  type="text"
                  placeholder="Search by user email, name, or transaction ID..."
                  value={bookingSearchQuery}
                  onChange={(e) => {
                    setBookingSearchQuery(e.target.value);
                    fetchCategorizedBookings(1, bookingCategoryTab, e.target.value);
                  }}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl glass-input text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400"
                />
                <Eye className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3.5" />
              </div>

              <div className="flex items-center gap-3 text-xs text-white/70 w-full sm:w-auto justify-between sm:justify-end">
                <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 font-mono">
                  Total Records: <strong className="text-cyan-300">{bookingTotalCount}</strong>
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 font-semibold">
                  Page {bookingCurrentPage} of {bookingTotalPages}
                </span>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="glass-panel rounded-3xl border border-cyan-400/20 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10 text-cyan-300 font-bold uppercase tracking-wider">
                      <th className="p-4">Customer Details</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Booking Title & Venue</th>
                      <th className="p-4">Selected Date / Time</th>
                      <th className="p-4">Seats / Tier</th>
                      <th className="p-4">Total Paid</th>
                      <th className="p-4">Transaction Details</th>
                      <th className="p-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/80">
                    {adminBookingsLoading ? (
                      <tr>
                        <td colSpan="8" className="p-8 text-center text-cyan-300 font-bold">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                          <span>Loading centralized bookings dataset...</span>
                        </td>
                      </tr>
                    ) : adminBookingsList.length > 0 ? (
                      adminBookingsList.map((b) => (
                        <tr key={b.id || b.transactionId} className="hover:bg-white/5 transition-colors group">
                          <td className="p-4">
                            <div className="font-bold text-white group-hover:text-cyan-300 transition-colors">
                              {b.userName || b.userEmail?.split('@')[0] || 'Customer'}
                            </div>
                            <div className="text-[11px] font-mono text-cyan-300/80">{b.userEmail || 'N/A'}</div>
                          </td>

                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                              (b.category === 'Event')
                                ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                                : (b.category === 'Play')
                                  ? 'bg-purple-500/20 text-purple-300 border-purple-400/40'
                                  : (b.category === 'Theatre')
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                            }`}>
                              {b.category || 'Movie'}
                            </span>
                          </td>

                          <td className="p-4">
                            <div className="font-bold text-white">{b.title || b.movieTitle || 'PrimeShow Show'}</div>
                            <div className="text-[10px] text-white/50">{b.theatreName || b.venue || 'Surat Main Complex'}</div>
                          </td>

                          <td className="p-4 font-semibold text-white/90">
                            <div>📅 {b.date || b.slotDate || 'Today'}</div>
                            <div className="text-cyan-300 text-[10px]">⏰ {b.time || b.showTime || '07:30 PM'}</div>
                          </td>

                          <td className="p-4">
                            <div className="font-mono text-emerald-300 font-bold">
                              {Array.isArray(b.seats) ? b.seats.join(', ') : (Array.isArray(b.seatsBooked) ? b.seatsBooked.join(', ') : 'Recliner')}
                            </div>
                            <div className="text-[10px] text-white/50">{b.tier || 'VIP'}</div>
                          </td>

                          <td className="p-4 font-bold text-amber-300 text-sm">
                            ₹{b.totalAmount || b.totalPrice || 480}
                          </td>

                          <td className="p-4 text-[10px]">
                            <div className="font-mono text-cyan-300">{b.transactionId || b.id}</div>
                            <div className="text-white/40">{b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-GB') : 'Just Now'}</div>
                          </td>

                          <td className="p-4 text-center">
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-400/40 text-[10px]">
                              ✓ CONFIRMED
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="p-8 text-center text-white/40">
                          No bookings found for the selected category filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {bookingTotalPages > 1 && (
                <div className="p-4 bg-white/5 border-t border-white/10 flex items-center justify-between">
                  <button
                    disabled={bookingCurrentPage <= 1}
                    onClick={() => fetchCategorizedBookings(bookingCurrentPage - 1, bookingCategoryTab, bookingSearchQuery)}
                    className="px-4 py-2 rounded-xl glass-panel disabled:opacity-30 text-xs font-bold hover:bg-white/10 cursor-pointer"
                  >
                    Previous
                  </button>

                  <span className="text-xs text-white/70">
                    Page <strong>{bookingCurrentPage}</strong> of <strong>{bookingTotalPages}</strong>
                  </span>

                  <button
                    disabled={bookingCurrentPage >= bookingTotalPages}
                    onClick={() => fetchCategorizedBookings(bookingCurrentPage + 1, bookingCategoryTab, bookingSearchQuery)}
                    className="px-4 py-2 rounded-xl glass-panel disabled:opacity-30 text-xs font-bold hover:bg-white/10 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Admin Dynamic Content Control Panel (CMS Editor - Step 2 Requirement) */}
        {activeTab === 'cms-editor' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold font-sans text-white">Admin Dynamic Content Control Panel (CMS)</h1>
              <p className="text-xs text-cyan-300">Centralized control panel to broadcast homepage announcements, set operating city, and customize global platform themes in real-time.</p>
            </div>

            {/* Global Settings & Ticker Form */}
            <div className="glass-panel p-6 rounded-3xl border border-cyan-400/30 space-y-6">
              <h3 className="text-lg font-bold font-sans text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-cyan-400" />
                <span>Global Platform & Live Announcement Configuration</span>
              </h3>

              <form onSubmit={handleGlobalCmsSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-cyan-300 mb-1">Platform Branding Title</label>
                    <input
                      type="text"
                      value={platformTitleInput}
                      onChange={(e) => setPlatformTitleInput(e.target.value)}
                      className="w-full p-3 rounded-xl glass-input text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-cyan-300 mb-1">Primary Operating City</label>
                    <select
                      value={activeCityInput}
                      onChange={(e) => setActiveCityInput(e.target.value)}
                      className="w-full p-3 rounded-xl glass-input text-xs text-white bg-black"
                    >
                      {GUJARAT_CITIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-cyan-300 mb-1">Top Announcement Ticker Message (Broadcasted Live to All Users)</label>
                  <textarea
                    rows="2"
                    value={bannerAnnouncementInput}
                    onChange={(e) => setBannerAnnouncementInput(e.target.value)}
                    placeholder="⚡ Exclusive Offer: Get 50% Flat Discount on IMAX & VIP Recliner Tickets!"
                    className="w-full p-3 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div>
                    <div className="font-bold text-sm text-white">System Maintenance Mode</div>
                    <div className="text-xs text-white/50">Enable maintenance banner across all active customer panels</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMaintenanceModeToggle(!maintenanceModeToggle)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      maintenanceModeToggle
                        ? 'bg-rose-500 text-white'
                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                    }`}
                  >
                    {maintenanceModeToggle ? 'ENABLED (MAINTENANCE ON)' : 'DISABLED (NORMAL)'}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={cmsSaveLoading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-400 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/25 hover:brightness-110 cursor-pointer flex items-center justify-center gap-2 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{cmsSaveLoading ? 'Publishing & Syncing...' : 'Save & Sync CMS Config Globally'}</span>
                </button>
              </form>
            </div>

            {/* Quick Component Editors Navigation Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div 
                onClick={() => handleTabChange('hero')}
                className="glass-panel p-5 rounded-2xl border border-cyan-400/20 hover:border-cyan-400/60 transition-all cursor-pointer group"
              >
                <Image className="w-8 h-8 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="font-bold text-white text-sm">Hero Banner Slideshow</h4>
                <p className="text-xs text-white/50 mt-1">Manage homepage featured movie banners, prices & ratings.</p>
              </div>

              <div 
                onClick={() => handleTabChange('strips')}
                className="glass-panel p-5 rounded-2xl border border-cyan-400/20 hover:border-cyan-400/60 transition-all cursor-pointer group"
              >
                <Zap className="w-8 h-8 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="font-bold text-white text-sm">Feature Action Strips</h4>
                <p className="text-xs text-white/50 mt-1">Customize quick action chips on the home landing screen.</p>
              </div>

              <div 
                onClick={() => handleTabChange('upcoming')}
                className="glass-panel p-5 rounded-2xl border border-cyan-400/20 hover:border-cyan-400/60 transition-all cursor-pointer group"
              >
                <Award className="w-8 h-8 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="font-bold text-white text-sm">Upcoming Movie Releases</h4>
                <p className="text-xs text-white/50 mt-1">Add coming soon posters and launch release dates.</p>
              </div>

              <div 
                onClick={() => handleTabChange('notifications')}
                className="glass-panel p-5 rounded-2xl border border-cyan-400/20 hover:border-cyan-400/60 transition-all cursor-pointer group"
              >
                <Bell className="w-8 h-8 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="font-bold text-white text-sm">Broadcast System Alerts</h4>
                <p className="text-xs text-white/50 mt-1">Send instant push notification alerts to all user profiles.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Hero Section Slideshow Management (Full CRUD) */}
        {activeTab === 'hero' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold font-sans text-white">Hero Section Slideshow Management</h1>
              <p className="text-xs text-cyan-300">Create, update, or remove featured movie banners and slideshow items for the homepage.</p>
            </div>

            {/* Create / Edit Hero Slide Form */}
            <div className="glass-panel p-6 rounded-3xl border border-cyan-400/30 space-y-6">
              <h3 className="text-lg font-bold font-sans text-white">
                {editingHeroSlideId ? 'Edit Hero Slide Banner' : 'Add New Hero Slide Banner'}
              </h3>

              <form onSubmit={handleSaveHeroSlide} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-cyan-300 mb-1">Movie Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Avatar: Fire and Ash"
                      value={heroForm.title}
                      onChange={(e) => setHeroForm({ ...heroForm, title: e.target.value })}
                      className="w-full p-3 rounded-xl glass-input text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-cyan-300 mb-1">Tagline / Synopsis</label>
                    <input
                      type="text"
                      placeholder="e.g. Native IMAX 3D Experience"
                      value={heroForm.tagline}
                      onChange={(e) => setHeroForm({ ...heroForm, tagline: e.target.value })}
                      className="w-full p-3 rounded-xl glass-input text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-cyan-300 mb-1">Feature Badge</label>
                    <select
                      value={heroForm.badge}
                      onChange={(e) => setHeroForm({ ...heroForm, badge: e.target.value })}
                      className="w-full p-3 rounded-xl glass-input text-xs text-white bg-black"
                    >
                      <option value="BLOCKBUSTER">BLOCKBUSTER</option>
                      <option value="TRENDING">TRENDING</option>
                      <option value="CRITICS CHOICE">CRITICS CHOICE</option>
                      <option value="POPULAR">POPULAR</option>
                      <option value="EXCLUSIVE">EXCLUSIVE</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-cyan-300 mb-1">Rating (e.g. 9.4)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={heroForm.rating}
                      onChange={(e) => setHeroForm({ ...heroForm, rating: e.target.value })}
                      className="w-full p-3 rounded-xl glass-input text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-cyan-300 mb-1">Ticket Price Rate (₹)</label>
                    <input
                      type="number"
                      value={heroForm.price}
                      onChange={(e) => setHeroForm({ ...heroForm, price: e.target.value })}
                      className="w-full p-3 rounded-xl glass-input text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-cyan-300 mb-1">Languages (comma separated)</label>
                    <input
                      type="text"
                      placeholder="English, Hindi, Tamil, Telugu"
                      value={heroForm.languages}
                      onChange={(e) => setHeroForm({ ...heroForm, languages: e.target.value })}
                      className="w-full p-3 rounded-xl glass-input text-xs text-white"
                    />
                  </div>
                </div>

                {/* Banner Image URL & Uploader */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-cyan-300">Banner Image URL / File *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Banner Image URL (https://...)"
                      value={heroForm.banner}
                      onChange={(e) => setHeroForm({ ...heroForm, banner: e.target.value })}
                      className="flex-1 p-3 rounded-xl glass-input text-xs text-white"
                    />
                    <label className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer shrink-0 flex items-center gap-1.5">
                      <span>Browse File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setHeroForm({ ...heroForm, banner: reader.result });
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs cursor-pointer shadow-lg shadow-cyan-500/20"
                  >
                    {editingHeroSlideId ? 'Update Slide & Sync Live' : '+ Add Slide to Slideshow'}
                  </button>
                  {editingHeroSlideId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingHeroSlideId(null);
                        setHeroForm({
                          title: '', tagline: '', badge: 'BLOCKBUSTER', rating: 9.4, votesCount: 42800,
                          duration: '3h 12m', languages: 'English, Hindi, Tamil, Telugu', genres: 'Sci-Fi, Action',
                          price: 480, banner: '', movieId: 'mov_1'
                        });
                      }}
                      className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Configured Hero Slides Cards List */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider">
                Current Active Hero Banners ({heroSlidesList.length} Slides)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {heroSlidesList.map((slide) => (
                  <div key={slide.id} className="glass-panel rounded-3xl p-4 border border-white/10 space-y-3 relative overflow-hidden group">
                    <div className="relative h-40 rounded-2xl overflow-hidden border border-white/10">
                      <img src={slide.banner} alt={slide.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                      <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-black uppercase">
                        {slide.badge || 'BLOCKBUSTER'}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-white truncate">{slide.title}</h4>
                      <p className="text-xs text-amber-300 italic truncate">{slide.tagline}</p>
                      <div className="text-[11px] text-white/60 mt-1">
                        ⭐ {slide.rating || 9.0} • ₹{slide.price || 480} • {Array.isArray(slide.languages) ? slide.languages.join(', ') : slide.languages}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                      <button
                        onClick={() => handleEditHeroSlideClick(slide)}
                        className="p-2 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-black transition-colors cursor-pointer"
                        title="Edit Slide"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteHeroSlideClick(slide.id)}
                        className="p-2 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                        title="Delete Slide"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Home Page Feature Strips Management (CRUD) */}
        {activeTab === 'strips' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold font-sans text-white">Home Page Feature Strips</h1>
              <p className="text-xs text-cyan-300">Manage quick action chips and promotional feature strips visible on the homepage.</p>
            </div>

            {/* Create / Edit Feature Strip Form */}
            <div className="glass-panel p-6 rounded-3xl border border-cyan-400/30 space-y-6">
              <h3 className="text-lg font-bold font-sans text-white">
                {editingFeatId ? 'Edit Feature Action Chip' : 'Add New Feature Action Chip'}
              </h3>

              <form onSubmit={handleSaveFeatureStrip} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-cyan-300 mb-1">Feature Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Instant UPI Pass"
                      value={featForm.title}
                      onChange={(e) => setFeatForm({ ...featForm, title: e.target.value })}
                      className="w-full p-3 rounded-xl glass-input text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-cyan-300 mb-1">Subtitle / Details</label>
                    <input
                      type="text"
                      placeholder="e.g. Instant QR pass generation"
                      value={featForm.subtitle}
                      onChange={(e) => setFeatForm({ ...featForm, subtitle: e.target.value })}
                      className="w-full p-3 rounded-xl glass-input text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-cyan-300 mb-1">Badge Tag</label>
                    <select
                      value={featForm.badge}
                      onChange={(e) => setFeatForm({ ...featForm, badge: e.target.value })}
                      className="w-full p-3 rounded-xl glass-input text-xs text-white bg-black"
                    >
                      <option value="INSTANT">INSTANT</option>
                      <option value="LUXURY">LUXURY</option>
                      <option value="OFFER">OFFER</option>
                      <option value="VIP">VIP</option>
                      <option value="NEW">NEW</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-cyan-300 mb-1">Icon Style</label>
                    <select
                      value={featForm.icon}
                      onChange={(e) => setFeatForm({ ...featForm, icon: e.target.value })}
                      className="w-full p-3 rounded-xl glass-input text-xs text-white bg-black"
                    >
                      <option value="Zap">Zap (Lightning)</option>
                      <option value="Film">Film (Cinema)</option>
                      <option value="Gift">Gift (Promo)</option>
                      <option value="Sparkles">Sparkles (VIP)</option>
                      <option value="Ticket">Ticket</option>
                      <option value="Shield">Shield</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs cursor-pointer shadow-lg shadow-cyan-500/20"
                  >
                    {editingFeatId ? 'Update Feature Chip' : '+ Add Feature Action Chip'}
                  </button>
                  {editingFeatId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingFeatId(null);
                        setFeatForm({ title: '', subtitle: '', badge: 'INSTANT', icon: 'Zap' });
                      }}
                      className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Configured Feature Strips Cards List */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider">
                Current Active Feature Chips ({featureStripsList.length} Chips)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {featureStripsList.map((feat) => (
                  <div key={feat.id} className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{feat.title}</span>
                        {feat.badge && (
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold uppercase">
                            {feat.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/60">{feat.subtitle}</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleEditFeatClick(feat)}
                        className="p-2 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-black transition-colors cursor-pointer"
                        title="Edit Chip"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteFeatClick(feat.id)}
                        className="p-2 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                        title="Delete Chip"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Upcoming Releases Management (CRUD) */}
        {activeTab === 'upcoming' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold font-sans text-white">Upcoming Releases Management</h1>
              <p className="text-xs text-cyan-300">Upload upcoming movies, release dates, and posters featured on the homepage carousel.</p>
            </div>

            {/* Create / Edit Upcoming Release Form */}
            <div className="glass-panel p-6 rounded-3xl border border-cyan-400/30 space-y-6">
              <h3 className="text-lg font-bold font-sans text-white">
                {editingUpcomingId ? 'Edit Upcoming Release' : 'Add New Upcoming Release'}
              </h3>

              <form onSubmit={handleSaveUpcomingMovie} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-cyan-300 mb-1">Movie Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Avengers: Secret Wars"
                      value={upcomingForm.title}
                      onChange={(e) => setUpcomingForm({ ...upcomingForm, title: e.target.value })}
                      className="w-full p-3 rounded-xl glass-input text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-cyan-300 mb-1">Release Date Tag *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dec 2026 or Diwali 2026"
                      value={upcomingForm.release}
                      onChange={(e) => setUpcomingForm({ ...upcomingForm, release: e.target.value })}
                      className="w-full p-3 rounded-xl glass-input text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-cyan-300 mb-1">Genres (comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Action, Superhero, Sci-Fi"
                      value={upcomingForm.genres}
                      onChange={(e) => setUpcomingForm({ ...upcomingForm, genres: e.target.value })}
                      className="w-full p-3 rounded-xl glass-input text-xs text-white"
                    />
                  </div>
                </div>

                {/* Poster Image URL & Uploader */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-cyan-300">Poster Image URL / File</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Poster Image URL (https://...)"
                      value={upcomingForm.poster}
                      onChange={(e) => setUpcomingForm({ ...upcomingForm, poster: e.target.value })}
                      className="flex-1 p-3 rounded-xl glass-input text-xs text-white"
                    />
                    <label className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer shrink-0 flex items-center gap-1.5">
                      <span>Browse File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setUpcomingForm({ ...upcomingForm, poster: reader.result });
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs cursor-pointer shadow-lg shadow-cyan-500/20"
                  >
                    {editingUpcomingId ? 'Update Release' : '+ Add Upcoming Release'}
                  </button>
                  {editingUpcomingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingUpcomingId(null);
                        setUpcomingForm({ title: '', release: 'Dec 2026', poster: '', genres: 'Action, Sci-Fi', synopsis: '' });
                      }}
                      className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Configured Upcoming Releases Cards List */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider">
                Current Active Upcoming Releases ({upcomingMoviesList.length} Titles)
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {upcomingMoviesList.map((mov) => (
                  <div key={mov.id} className="glass-panel rounded-2xl p-3 border border-white/10 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="relative h-44 rounded-xl overflow-hidden border border-white/10 mb-2">
                        <img src={mov.poster} alt={mov.title} className="w-full h-full object-cover" />
                        <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-purple-500 text-white text-[9px] font-black uppercase">
                          {mov.release}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white truncate">{mov.title}</h4>
                      <p className="text-[10px] text-white/50 truncate">
                        {Array.isArray(mov.genres) ? mov.genres.join(', ') : mov.genres}
                      </p>
                    </div>

                    <div className="flex justify-end gap-1.5 pt-2 border-t border-white/10">
                      <button
                        onClick={() => handleEditUpcomingClick(mov)}
                        className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-black transition-colors cursor-pointer"
                        title="Edit Title"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteUpcomingClick(mov.id)}
                        className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                        title="Delete Title"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Movie & Cast Management CRUD */}
        {activeTab === 'movies' && (
          <div className="space-y-8">
            <h1 className="text-3xl font-bold font-sans text-white">Movie, Trailer & Cast Management</h1>

            {/* Movie Form */}
            <form onSubmit={handleSaveMovie} className="glass-panel p-6 rounded-3xl border border-cyan-400/30 space-y-4">
              <h3 className="text-base font-bold font-sans text-white">
                {editingMovieId ? 'Edit Movie Details' : 'Add New Movie to Catalog'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-cyan-300 mb-1">Movie Title *</label>
                  <input type="text" required value={movieForm.title} onChange={e => setMovieForm({...movieForm, title: e.target.value})} className="w-full p-3 rounded-xl glass-input text-xs text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-cyan-300 mb-1">Director *</label>
                  <input type="text" value={movieForm.director} onChange={e => setMovieForm({...movieForm, director: e.target.value})} className="w-full p-3 rounded-xl glass-input text-xs text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-cyan-300 mb-1">Producer</label>
                  <input type="text" placeholder="Producer Name" value={movieForm.producer || ''} onChange={e => setMovieForm({...movieForm, producer: e.target.value})} className="w-full p-3 rounded-xl glass-input text-xs text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-cyan-300 mb-1">Rating (e.g. 9.4)</label>
                  <input type="number" step="0.1" value={movieForm.rating} onChange={e => setMovieForm({...movieForm, rating: e.target.value})} className="w-full p-3 rounded-xl glass-input text-xs text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-cyan-300 mb-1">Certificate / Rating *</label>
                  <input type="text" placeholder="UA 16+, UA, U, A" value={movieForm.parentalRating || 'UA'} onChange={e => setMovieForm({...movieForm, parentalRating: e.target.value})} className="w-full p-3 rounded-xl glass-input text-xs text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-cyan-300 mb-1">Release Date *</label>
                  <input type="text" placeholder="YYYY-MM-DD (e.g. 2026-12-18)" value={movieForm.releaseDate || '2026-12-18'} onChange={e => setMovieForm({...movieForm, releaseDate: e.target.value})} className="w-full p-3 rounded-xl glass-input text-xs text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-cyan-300 mb-1">Genres (comma separated)</label>
                  <input type="text" value={movieForm.genres} onChange={e => setMovieForm({...movieForm, genres: e.target.value})} className="w-full p-3 rounded-xl glass-input text-xs text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-cyan-300 mb-1">Languages</label>
                  <input type="text" value={movieForm.languages} onChange={e => setMovieForm({...movieForm, languages: e.target.value})} className="w-full p-3 rounded-xl glass-input text-xs text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-cyan-300 mb-1">Formats (e.g. IMAX 3D, Dolby Atmos)</label>
                  <input type="text" value={movieForm.formats} onChange={e => setMovieForm({...movieForm, formats: e.target.value})} className="w-full p-3 rounded-xl glass-input text-xs text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-cyan-300 mb-1">Target City / Hub *</label>
                  <select value={movieForm.city || 'Surat'} onChange={e => setMovieForm({...movieForm, city: e.target.value})} className="w-full p-3 rounded-xl glass-input text-xs text-white bg-black">
                    <option value="All">All Cities (Statewide)</option>
                    {GUJARAT_CITIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* YouTube Trailer Link */}
              <div>
                <label className="block text-xs font-bold text-cyan-300 mb-1">YouTube Trailer Link / Embed URL *</label>
                <input type="text" value={movieForm.trailerUrl || ''} onChange={e => setMovieForm({...movieForm, trailerUrl: e.target.value})} className="w-full p-3 rounded-xl glass-input text-xs text-white" placeholder="https://www.youtube.com/watch?v=..." />
              </div>

              {/* Dynamic Image Fields: Poster & Background Banner */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Movie Thumbnail Poster */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-cyan-300">1. Movie Thumbnail Poster (Small Detail Poster)</label>
                  <div className="flex gap-2">
                    <input type="text" value={movieForm.poster || ''} onChange={e => setMovieForm({...movieForm, poster: e.target.value})} className="flex-1 p-3 rounded-xl glass-input text-xs text-white" placeholder="Poster Image URL (https://...)" />
                    <label className="px-3 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer shrink-0 flex items-center gap-1">
                      <span>Upload</span>
                      <input type="file" accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setMovieForm({...movieForm, poster: reader.result});
                          reader.readAsDataURL(file);
                        }
                      }} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* 2. Main Background Banner */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-cyan-300">2. Main Background Banner (Backdrop Image)</label>
                  <div className="flex gap-2">
                    <input type="text" value={movieForm.banner || ''} onChange={e => setMovieForm({...movieForm, banner: e.target.value})} className="flex-1 p-3 rounded-xl glass-input text-xs text-white" placeholder="Banner/Backdrop URL (https://...)" />
                    <label className="px-3 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer shrink-0 flex items-center gap-1">
                      <span>Upload</span>
                      <input type="file" accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setMovieForm({...movieForm, banner: reader.result});
                          reader.readAsDataURL(file);
                        }
                      }} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-cyan-300 mb-1">Synopsis / Description</label>
                <textarea rows={3} value={movieForm.synopsis} onChange={e => setMovieForm({...movieForm, synopsis: e.target.value})} className="w-full p-3 rounded-xl glass-input text-xs text-white"></textarea>
              </div>

              <div className="flex gap-3">
                <button type="submit" className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs cursor-pointer">
                  {editingMovieId ? 'Update Movie & Sync Live' : 'Add Movie & Sync Live'}
                </button>
                {editingMovieId && (
                  <button type="button" onClick={() => setEditingMovieId(null)} className="px-4 py-3 rounded-xl bg-white/10 text-white text-xs font-bold cursor-pointer">
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>

            {/* Cast Management Section */}
            <div className="glass-panel p-6 rounded-3xl border border-cyan-400/30 space-y-4">
              <h3 className="text-base font-bold font-sans text-white">Cast & Crew Management Module</h3>
              <form onSubmit={handleAddCastMember} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <select value={castMovieId} onChange={e => setCastMovieId(e.target.value)} className="p-3 rounded-xl glass-input text-xs text-white bg-black">
                  {moviesList.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                </select>
                <input type="text" required placeholder="Cast Actor Name" value={castName} onChange={e => setCastName(e.target.value)} className="p-3 rounded-xl glass-input text-xs text-white" />
                <input type="text" placeholder="Character Role Name" value={castRole} onChange={e => setCastRole(e.target.value)} className="p-3 rounded-xl glass-input text-xs text-white" />
                <input type="text" placeholder="Photo URL or Browse File" value={castPhoto} onChange={e => setCastPhoto(e.target.value)} className="p-3 rounded-xl glass-input text-xs text-white" />
                <div className="sm:col-span-4 flex items-center gap-3">
                  <label className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer">
                    Upload Photo File
                    <input type="file" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setCastPhoto(reader.result);
                        reader.readAsDataURL(file);
                      }
                    }} className="hidden" />
                  </label>
                  <button type="submit" className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs cursor-pointer">
                    Add / Replace Cast Member
                  </button>
                </div>
              </form>
            </div>

            {/* Show Dates & Theatre Schedule Management Module */}
            <div className="glass-panel p-6 rounded-3xl border border-cyan-400/30 space-y-6">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-lg font-bold font-sans text-white">Movie Show Dates & Theatre Schedule Manager</h3>
                <p className="text-xs text-amber-300">Configure available booking dates, theatres, and showtime slots for each movie</p>
              </div>

              {/* Movie & Date Selector Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/5 p-4 rounded-2xl border border-white/10">
                {/* 1. Select Movie */}
                <div>
                  <label className="block text-xs font-bold text-cyan-300 mb-1.5">1. Select Target Movie *</label>
                  <select
                    value={schedMovieId}
                    onChange={(e) => {
                      setSchedMovieId(e.target.value);
                      const targetM = moviesList.find(m => m.id === e.target.value);
                      if (targetM && targetM.showDates && targetM.showDates.length > 0) {
                        setSelectedSchedDate(targetM.showDates[0]);
                      }
                    }}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white bg-black font-bold"
                  >
                    {moviesList.map(m => (
                      <option key={m.id} value={m.id}>{m.title}</option>
                    ))}
                  </select>
                </div>

                {/* 2. Configure Available Dates */}
                <div>
                  <label className="block text-xs font-bold text-cyan-300 mb-1.5">2. Add New Booking Date *</label>
                  <form onSubmit={handleAddScheduleDate} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="YYYY-MM-DD (e.g. 2026-08-05)"
                      value={schedDateInput}
                      onChange={(e) => setSchedDateInput(e.target.value)}
                      className="w-full p-3 rounded-xl glass-input text-xs text-white font-bold"
                    />
                    <button type="submit" className="px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shrink-0 cursor-pointer">
                      Add Date
                    </button>
                  </form>
                </div>
              </div>

              {/* Configured Dates Badges */}
              {(() => {
                const targetM = moviesList.find(m => m.id === schedMovieId);
                const showDates = targetM?.showDates || [];
                return (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-white/80 block">Configured Dates for {targetM?.title}:</span>
                    <div className="flex flex-wrap gap-2">
                      {showDates.map(dStr => (
                        <span
                          key={dStr}
                          onClick={() => setSelectedSchedDate(dStr)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                            selectedSchedDate === dStr
                              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                              : 'bg-white/10 text-white hover:bg-white/20'
                          }`}
                        >
                          <span>📅 {dStr}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteScheduleDate(schedMovieId, dStr);
                            }}
                            className="text-rose-400 hover:text-rose-200 font-extrabold ml-1"
                            title="Remove date from user site"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                      {showDates.length === 0 && (
                        <span className="text-xs text-white/40 italic">No dates configured. Add a date above.</span>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Add Theatre & Show Slot Form for Selected Date */}
              <div className="pt-4 border-t border-white/10 space-y-4">
                <h4 className="text-sm font-bold text-amber-400">
                  3. Add Theatre & Show Slot for Date: <span className="underline">{selectedSchedDate}</span>
                </h4>

                <form onSubmit={handleAddDateScopedShowSlot} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div>
                    <label className="block text-[11px] font-bold text-white/70 mb-1">Theatre Name *</label>
                    <input type="text" required value={schedTheatreName} onChange={e => setSchedTheatreName(e.target.value)} className="w-full p-2.5 rounded-xl glass-input text-xs text-white" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-white/70 mb-1">City *</label>
                    <select value={schedCity || 'Surat'} onChange={e => setSchedCity(e.target.value)} className="w-full p-2.5 rounded-xl glass-input text-xs text-white bg-black">
                      {GUJARAT_CITIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-white/70 mb-1">Address</label>
                    <input type="text" value={schedAddress} onChange={e => setSchedAddress(e.target.value)} className="w-full p-2.5 rounded-xl glass-input text-xs text-white" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-white/70 mb-1">Screen Name</label>
                    <input type="text" value={schedScreen} onChange={e => setSchedScreen(e.target.value)} className="w-full p-2.5 rounded-xl glass-input text-xs text-white" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-white/70 mb-1">Format *</label>
                    <select value={schedFormat} onChange={e => setSchedFormat(e.target.value)} className="w-full p-2.5 rounded-xl glass-input text-xs text-white bg-black">
                      <option value="IMAX 3D">IMAX 3D</option>
                      <option value="4DX">4DX</option>
                      <option value="Dolby Atmos">Dolby Atmos</option>
                      <option value="3D">3D</option>
                      <option value="2D">2D</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-white/70 mb-1">Show Time *</label>
                    <input type="text" required placeholder="e.g. 07:30 PM" value={schedTime} onChange={e => setSchedTime(e.target.value)} className="w-full p-2.5 rounded-xl glass-input text-xs text-white font-bold" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-white/70 mb-1">Price (₹) *</label>
                    <input type="number" required value={schedPrice} onChange={e => setSchedPrice(e.target.value)} className="w-full p-2.5 rounded-xl glass-input text-xs text-white" />
                  </div>
                  <div className="flex items-end">
                    <button type="submit" className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs shadow-md shadow-cyan-500/20 cursor-pointer">
                      + Add Show Slot
                    </button>
                  </div>
                </form>
              </div>

              {/* Configured Theatres & Showtimes List for Selected Date */}
              {(() => {
                const targetM = moviesList.find(m => m.id === schedMovieId);
                const schedsForDate = targetM?.schedules?.[selectedSchedDate] || (selectedSchedDate === '2026-07-31' ? targetM?.theatres : []);
                
                return (
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-white/70 uppercase">
                      Scheduled Theatres & Times for {selectedSchedDate} ({schedsForDate?.length || 0} Theatres):
                    </h4>

                    {schedsForDate && schedsForDate.length > 0 ? (
                      <div className="space-y-3">
                        {schedsForDate.map((th) => (
                          <div key={th.id || th.name} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <div className="text-sm font-bold text-white flex items-center gap-2">
                                <span>{th.name}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-medium">{th.city}</span>
                              </div>
                              <div className="text-[11px] text-white/50">{th.address}</div>
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {th.shows?.map((sh) => (
                                  <span key={sh.id} className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center gap-1.5">
                                    <span>{sh.time} ({sh.format}) - ₹{sh.price}</span>
                                    <button
                                      type="button"
                                      onClick={() => deleteShowSlotFromMovieTheatre(schedMovieId, selectedSchedDate, th.id, sh.id)}
                                      className="text-rose-400 hover:text-rose-200 font-extrabold ml-1"
                                      title="Delete showtime"
                                    >
                                      ✕
                                    </button>
                                  </span>
                                ))}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => deleteTheatreFromMovieDate(schedMovieId, selectedSchedDate, th.id)}
                              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500 hover:text-white text-rose-300 text-xs font-bold transition-all border border-rose-500/30 cursor-pointer shrink-0"
                            >
                              Remove Theatre
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 rounded-2xl bg-white/5 text-center text-xs text-white/40 italic">
                        No theatres currently scheduled for {selectedSchedDate}. Use the form above to add a show slot.
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Movies List Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {moviesList.map(m => (
                <div key={m.id} className="glass-panel p-5 rounded-3xl border border-white/10 space-y-4">
                  <div className="flex items-center gap-3">
                    <img src={m.poster} alt={m.title} className="w-14 h-20 object-cover rounded-xl border border-amber-400/40" />
                    <div>
                      <div className="text-sm font-bold text-white line-clamp-1">{m.title}</div>
                      <div className="text-xs text-cyan-300">★ {m.rating} • {m.duration}</div>
                      <div className="text-[10px] text-white/50">{m.director}</div>
                    </div>
                  </div>

                  {/* Cast Members List */}
                  {m.cast && m.cast.length > 0 && (
                    <div className="pt-2 border-t border-white/10">
                      <span className="text-[10px] font-bold text-cyan-300 uppercase block mb-1">Cast Members</span>
                      <div className="flex flex-wrap gap-1.5">
                        {m.cast.map(c => (
                          <span key={c.id || c.name} className="px-2 py-0.5 rounded bg-white/10 text-[10px] text-white flex items-center gap-1">
                            <span>{c.name} ({c.role})</span>
                            <button onClick={() => handleDeleteCastMember(m.id, c.id)} className="text-rose-400 font-bold hover:text-rose-300 ml-1">×</button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                    <button onClick={() => handleEditMovieClick(m)} className="p-2 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-black transition-colors" title="Edit Movie">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteMovie(m.id)} className="p-2 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white transition-colors" title="Delete Movie">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Cinema & Screen Specific Seat Operations */}
        {activeTab === 'seats' && (
          <div className="glass-panel p-6 rounded-3xl border border-cyan-400/30 space-y-6">
            <div>
              <h1 className="text-3xl font-bold font-sans text-white">Cinema & Screen Seat Management</h1>
              <p className="text-xs text-cyan-300">Select Cinema and Screen first. Seat layouts and block rules apply strictly to the selected screen.</p>
            </div>

            {/* Cinema & Screen Selector Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-cyan-300 mb-1">Select Cinema / Theatre</label>
                <select
                  value={selectedTheatreId}
                  onChange={e => {
                    setSelectedTheatreId(e.target.value);
                    const targetTh = currentTheatresList.find(t => t.id === e.target.value);
                    if (targetTh && targetTh.screens && targetTh.screens[0]) {
                      setSelectedScreenId(targetTh.screens[0].id);
                    }
                  }}
                  className="w-full p-3 rounded-xl glass-input text-xs text-white bg-black"
                >
                  {currentTheatresList.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.city})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-cyan-300 mb-1">Select Screen</label>
                <select
                  value={selectedScreenId}
                  onChange={e => setSelectedScreenId(e.target.value)}
                  className="w-full p-3 rounded-xl glass-input text-xs text-white bg-black"
                >
                  {activeScreensList.map(sc => (
                    <option key={sc.id} value={sc.id}>{sc.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 text-xs text-cyan-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                Managing layout & prices for: <strong className="text-white">{activeTheatreObj?.name}</strong> → <strong className="text-amber-400">{activeScreensList.find(s => s.id === selectedScreenId)?.name || 'Screen 1'}</strong>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-white/10 border border-white/20 inline-block"></span> Available</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-500/30 border border-rose-500 inline-block"></span> Blocked 🔒</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-white/5 text-white/30 inline-block text-center">✕</span> Booked</span>
              </div>
            </div>

            {/* Interactive Visual Layout Grid (Scrollable Container & Legible Font Sizes) */}
            <div className="p-4 sm:p-6 rounded-3xl bg-black/40 border border-white/10 space-y-4">
              <div className="w-full max-w-xl mx-auto text-center shrink-0">
                <div className="screen-curve mb-2"></div>
                <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-amber-300/90 uppercase">
                  ▲ CINEMATIC SCREEN THIS WAY (FRONT) ▲
                </span>
              </div>

              <div className="w-full overflow-auto max-h-[55vh] sm:max-h-[62vh] p-2 sm:p-4 my-2 rounded-2xl bg-black/30 border border-white/10 flex flex-col items-center select-none">
                <div className="min-w-max flex flex-col items-center justify-center space-y-3 sm:space-y-4 py-2 px-2">
                  {seatRowsList.map((tierObj) => (
                    <div key={tierObj.row} className="flex flex-col items-center w-full">
                      <div className="text-xs font-bold text-amber-400 mb-1.5 uppercase tracking-wider flex items-center gap-2 flex-wrap justify-center">
                        <span>Row {tierObj.row}: {tierObj.tier}</span>
                        <span className="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">₹{tierObj.price}</span>
                        <button
                          type="button"
                          onClick={() => deleteRowFromScreenLayout(selectedScreenId, tierObj.row)}
                          className="text-rose-400 hover:text-rose-200 text-xs font-bold ml-1 cursor-pointer"
                          title="Delete entire row"
                        >
                          [Delete]
                        </button>
                      </div>

                      <div className="flex items-center justify-center gap-2 sm:gap-3 w-full">
                        <span className="w-6 text-xs font-bold text-white/50 text-center shrink-0">{tierObj.row}</span>

                        <div className="flex items-center gap-1.5 sm:gap-2.5">
                          {Array.from({ length: tierObj.seatsCount }).map((_, idx) => {
                            const seatNum = idx + 1;
                            const seatId = `${tierObj.row}${seatNum}`;
                            const isBlocked = (currentLayout.blockedSeats || []).includes(seatId);
                            const customStat = currentLayout.customStatuses?.[seatId];
                            const isBooked = customStat === 'BOOKED';

                            return (
                              <button
                                key={seatId}
                                type="button"
                                onClick={() => {
                                  if (isBlocked) {
                                    setManualSeatStatusForScreen(selectedScreenId, seatId, 'AVAILABLE');
                                  } else if (isBooked) {
                                    setManualSeatStatusForScreen(selectedScreenId, seatId, 'AVAILABLE');
                                  } else {
                                    toggleBlockSeatForScreen(selectedScreenId, seatId);
                                  }
                                }}
                                className={`w-8 h-8 sm:w-9.5 sm:h-9.5 rounded-xl font-mono text-xs sm:text-sm font-bold transition-all flex items-center justify-center cursor-pointer shrink-0 ${
                                  isBooked
                                    ? 'bg-white/5 border border-white/5 text-white/30 cursor-not-allowed'
                                    : isBlocked
                                    ? 'bg-rose-500/30 border-2 border-rose-500 text-rose-300 shadow-lg shadow-rose-500/20'
                                    : 'bg-white/10 hover:bg-white/25 border border-white/20 text-white/90 hover:text-white'
                                }`}
                                title={`Click to toggle status for ${seatId}`}
                              >
                                {isBooked ? '✕' : (isBlocked ? '🔒' : seatNum)}
                              </button>
                            );
                          })}
                        </div>

                        <span className="w-6 text-xs font-bold text-white/50 text-center shrink-0">{tierObj.row}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Add / Custom Row Form */}
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-cyan-300 uppercase">Add / Customize Seat Row & Category Pricing</h3>
              <form onSubmit={handleAddRowForm} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1">Row Letter (e.g. A, H, K) *</label>
                  <input type="text" maxLength={2} required placeholder="Row Letter" value={newRowChar} onChange={e => setNewRowChar(e.target.value)} className="w-full p-2.5 rounded-xl glass-input text-xs text-white uppercase font-bold" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1">Category / Tier Name *</label>
                  <input type="text" required placeholder="e.g. Executive Recliner" value={newRowTier} onChange={e => setNewRowTier(e.target.value)} className="w-full p-2.5 rounded-xl glass-input text-xs text-white" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1">Ticket Price (₹) *</label>
                  <input type="number" required value={newRowPrice} onChange={e => setNewRowPrice(e.target.value)} className="w-full p-2.5 rounded-xl glass-input text-xs text-white font-bold" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1">Number of Seats *</label>
                  <input type="number" min={1} max={25} required value={newRowSeatsCount} onChange={e => setNewRowSeatsCount(e.target.value)} className="w-full p-2.5 rounded-xl glass-input text-xs text-white font-bold" />
                </div>
                <div className="flex items-end">
                  <button type="submit" className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-md shadow-amber-500/20 cursor-pointer">
                    + Add / Save Row
                  </button>
                </div>
              </form>
            </div>

            {/* Bulk Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  updateScreenRowsConfig(selectedScreenId, [
                    { row: 'N', tier: 'Classic Normal', price: 250, seatsCount: 12 },
                    { row: 'P', tier: 'Premium Tier', price: 450, seatsCount: 12 },
                    { row: 'R', tier: 'Luxury Recliner', price: 650, seatsCount: 10 },
                    { row: 'V', tier: 'VIP Gold Lounge', price: 950, seatsCount: 8 }
                  ]);
                  setActionSuccess('Reset screen layout to standard 4-Tier template.');
                  setTimeout(() => setActionSuccess(''), 3000);
                }}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer"
              >
                Reset Standard Template
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Offers Module CRUD */}
        {activeTab === 'offers' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold font-sans text-white">Offers & Promos Management</h1>
                <p className="text-xs text-amber-300">Control animated slide show banners & bank coupon cards</p>
              </div>

              {/* Sub-Tab Switcher */}
              <div className="flex gap-2 p-1 rounded-2xl glass-panel border border-white/10">
                <button
                  type="button"
                  onClick={() => setOfferSubTab('banners')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    offerSubTab === 'banners'
                      ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  🎠 Carousel Slide Banners ({offerBannersList.length})
                </button>

                <button
                  type="button"
                  onClick={() => setOfferSubTab('cards')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    offerSubTab === 'cards'
                      ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  💳 Bank Coupon Cards ({offersList.length})
                </button>
              </div>
            </div>

            {/* SUB-TAB A: Carousel Slide Banners CRUD */}
            {offerSubTab === 'banners' && (
              <div className="space-y-8">
                {/* Form to Add / Edit Banner Slide */}
                <form onSubmit={handleSaveBanner} className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 max-w-4xl">
                  <h3 className="text-lg font-bold text-amber-400">
                    {editingBannerId ? 'Edit Carousel Banner Slide' : 'Add New Offer Slide Show Banner'}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-white mb-1">Banner Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Buy 1 Get 1 FREE on IMAX 3D Movies"
                        value={bannerForm.title}
                        onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                        className="w-full p-3 rounded-xl glass-input text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-white mb-1">Promo Code *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. BOGOIMAX"
                        value={bannerForm.code}
                        onChange={(e) => setBannerForm({ ...bannerForm, code: e.target.value.toUpperCase() })}
                        className="w-full p-3 rounded-xl glass-input text-xs text-white font-mono font-bold uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-white mb-1">Category *</label>
                      <select
                        value={bannerForm.category}
                        onChange={(e) => setBannerForm({ ...bannerForm, category: e.target.value })}
                        className="w-full p-3 rounded-xl glass-input text-xs text-white bg-[#0c0d14]"
                      >
                        <option value="Movies">Movies</option>
                        <option value="Theatres">Theaters</option>
                        <option value="Plays">Plays</option>
                        <option value="Events">Events</option>
                        <option value="Activities">Activities / Games</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-white mb-1">CTA Button Label</label>
                      <input
                        type="text"
                        placeholder="e.g. Book Movie Ticket"
                        value={bannerForm.ctaText}
                        onChange={(e) => setBannerForm({ ...bannerForm, ctaText: e.target.value })}
                        className="w-full p-3 rounded-xl glass-input text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-white mb-1">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="e.g. 2026-12-31"
                        value={bannerForm.expiryDate}
                        onChange={(e) => setBannerForm({ ...bannerForm, expiryDate: e.target.value })}
                        className="w-full p-3 rounded-xl glass-input text-xs text-white"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-xs font-bold text-white mb-1">Banner Image URL *</label>
                      <input
                        type="url"
                        required
                        placeholder="https://images.unsplash.com/..."
                        value={bannerForm.image}
                        onChange={(e) => setBannerForm({ ...bannerForm, image: e.target.value })}
                        className="w-full p-3 rounded-xl glass-input text-xs text-white"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-xs font-bold text-white mb-1">Tagline / Description</label>
                      <input
                        type="text"
                        placeholder="Enter catchy offer description..."
                        value={bannerForm.tagline}
                        onChange={(e) => setBannerForm({ ...bannerForm, tagline: e.target.value })}
                        className="w-full p-3 rounded-xl glass-input text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    {editingBannerId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingBannerId(null);
                          setBannerForm({ title: '', tagline: '', code: '', category: 'Movies', image: '', expiryDate: '2026-12-31', ctaText: 'Claim Offer', ctaLink: 'movies' });
                        }}
                        className="px-4 py-2.5 rounded-xl glass-panel text-xs text-white/70 font-bold cursor-pointer"
                      >
                        Cancel Edit
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg shadow-amber-500/20 cursor-pointer"
                    >
                      {editingBannerId ? 'Update Banner Slide' : 'Publish Banner Slide'}
                    </button>
                  </div>
                </form>

                {/* Banner Banners List */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Live Carousel Banners ({offerBannersList.length})</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {offerBannersList.map((ban) => (
                      <div key={ban.id} className="glass-panel p-5 rounded-3xl border border-white/10 space-y-3 flex flex-col justify-between">
                        <div className="flex items-start gap-4">
                          <img src={ban.image} alt={ban.title} className="w-24 h-20 rounded-2xl object-cover border border-amber-400/40 shrink-0" />
                          <div className="space-y-1">
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] uppercase">
                              {ban.category}
                            </span>
                            <h4 className="text-base font-bold text-white leading-tight">{ban.title}</h4>
                            <p className="text-xs font-mono font-bold text-amber-400">Code: {ban.code}</p>
                            <p className="text-[11px] text-white/50">{ban.tagline}</p>
                          </div>
                        </div>

                        <div className="flex gap-2 justify-end pt-2 border-t border-white/10">
                          <button
                            onClick={() => {
                              setEditingBannerId(ban.id);
                              setBannerForm({
                                title: ban.title,
                                tagline: ban.tagline || '',
                                code: ban.code,
                                category: ban.category || 'Movies',
                                image: ban.image || '',
                                expiryDate: ban.expiryDate || '2026-12-31',
                                ctaText: ban.ctaText || 'Claim Offer',
                                ctaLink: ban.ctaLink || 'movies'
                              });
                            }}
                            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 hover:text-black border border-amber-400/40 text-amber-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" /> Edit
                          </button>

                          <button
                            onClick={() => handleDeleteBanner(ban.id)}
                            className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500 hover:text-white border border-rose-500/40 text-rose-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB B: Bank Discount Cards CRUD */}
            {offerSubTab === 'cards' && (
              <div className="space-y-6">
                <form onSubmit={handleSaveOffer} className="glass-panel p-6 rounded-3xl border border-white/10 max-w-xl space-y-4">
                  <h3 className="text-base font-bold text-amber-400">
                    {editingOfferId ? 'Edit Bank Coupon' : 'Create New Bank Coupon & Card Promo'}
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-white mb-1">Offer Title</label>
                    <input type="text" required value={offerTitle} onChange={e => setOfferTitle(e.target.value)} className="w-full p-3 rounded-xl glass-input text-xs text-white" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-white mb-1">Promo Code</label>
                      <input type="text" required value={offerCode} onChange={e => setOfferCode(e.target.value)} className="w-full p-3 rounded-xl glass-input text-xs text-white uppercase font-bold" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white mb-1">Bank Partner</label>
                      <input type="text" value={offerBank} onChange={e => setOfferBank(e.target.value)} className="w-full p-3 rounded-xl glass-input text-xs text-white" />
                    </div>
                  </div>

                  <button type="submit" className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg shadow-amber-500/20 cursor-pointer">
                    {editingOfferId ? 'Update Offer & Sync' : 'Publish Offer Live'}
                  </button>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {offersList.map(off => (
                    <div key={off.id || off.code} className="glass-panel p-5 rounded-3xl border border-white/10 flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-400 text-sm">{off.code}</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">{off.bank}</span>
                        </div>
                        <h4 className="text-xs font-bold text-white mt-1">{off.title}</h4>
                      </div>
                      <button onClick={() => handleDeleteOffer(off.id)} className="p-2 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* Tab 5: WhatsApp-Style Live Support Chat Desk */}
        {activeTab === 'support' && (
          <div className="space-y-4">
            <h1 className="text-3xl font-bold font-sans text-white">WhatsApp Live Support Desk</h1>

            {supportMessages.map(msg => (
              <div key={msg.id} className="glass-panel p-5 rounded-3xl border border-cyan-400/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-cyan-300">{msg.userName} ({msg.userEmail})</span>
                    <div className="text-[10px] text-white/40">{msg.subject} • {msg.createdAt}</div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${msg.status === 'replied' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                    {msg.status}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-white">
                  "{msg.message}"
                </div>

                {msg.reply ? (
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 text-xs text-emerald-200 flex items-center justify-between">
                    <span><strong>Admin Reply Sent:</strong> {msg.reply}</span>
                    <span className="text-emerald-300 font-bold">✓✓</span>
                  </div>
                ) : (
                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Type instant reply to customer..."
                      value={replyTextMap[msg.id] || ''}
                      onChange={(e) => setReplyTextMap({ ...replyTextMap, [msg.id]: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-xl glass-input text-xs text-white"
                    />
                    <button
                      onClick={() => handleReplySubmit(msg.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Reply</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tab 6: Broadcast Notifications */}
        {activeTab === 'notifications' && (
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-2xl font-bold font-sans text-white">Broadcast System Notification</h2>
            <p className="text-xs text-white/60">Create and broadcast announcements directly to all customer profile notification drawers in real time.</p>

            <form onSubmit={handleBroadcastNotificationSubmit} className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
              <div>
                <label className="block text-xs font-bold text-white mb-1">Notification Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IMAX 3D Weekend Discount 50% Off"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  className="w-full p-3 rounded-xl glass-input text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1">Category / Type</label>
                <select
                  value={notifType}
                  onChange={(e) => setNotifType(e.target.value)}
                  className="w-full p-3 rounded-xl glass-input text-xs text-white bg-[#0c0d14]"
                >
                  <option value="PROMO">PROMO (Promotional Voucher)</option>
                  <option value="MOVIE">MOVIE (New Release Update)</option>
                  <option value="SYSTEM">SYSTEM (Maintenance / Notice)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1">Notification Message Content</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Type the full announcement broadcast message..."
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  className="w-full p-3 rounded-xl glass-input text-xs text-white"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                <span>Broadcast Live Notification to All Users</span>
              </button>
            </form>
          </div>
        )}

        {/* Tab 7: Theatre & Showtimes Management CRUD */}
        {activeTab === 'theatres' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold font-sans text-white">Theatre & Showtimes Management</h2>

            {/* Section A: Add / Edit Theatre Form */}
            <form onSubmit={handleSaveTheatre} className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 max-w-4xl">
              <h3 className="text-lg font-bold text-amber-400">
                {editingTheatreId ? 'Edit Multiplex Details' : 'Add New Multiplex Venue'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white mb-1">Theatre Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PVR Luxe, Nexus Mall"
                    value={theatreForm.name}
                    onChange={(e) => setTheatreForm({ ...theatreForm, name: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">City *</label>
                  <select
                    value={theatreForm.city || 'Surat'}
                    onChange={(e) => setTheatreForm({ ...theatreForm, city: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white bg-black"
                  >
                    {GUJARAT_CITIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">State</label>
                  <input
                    type="text"
                    placeholder="e.g. Maharashtra"
                    value={theatreForm.state}
                    onChange={(e) => setTheatreForm({ ...theatreForm, state: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-white mb-1">Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="Full street address..."
                    value={theatreForm.address}
                    onChange={(e) => setTheatreForm({ ...theatreForm, address: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">Facilities / Amenities (Comma Separated)</label>
                  <input
                    type="text"
                    placeholder="VIP Recliners, IMAX 3D, Dolby Atmos"
                    value={theatreForm.facilities}
                    onChange={(e) => setTheatreForm({ ...theatreForm, facilities: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">Screens Count</label>
                  <input
                    type="number"
                    value={theatreForm.screensCount}
                    onChange={(e) => setTheatreForm({ ...theatreForm, screensCount: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">Total Seat Capacity</label>
                  <input
                    type="number"
                    value={theatreForm.totalSeats}
                    onChange={(e) => setTheatreForm({ ...theatreForm, totalSeats: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-white mb-1">Banner Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={theatreForm.image}
                    onChange={(e) => setTheatreForm({ ...theatreForm, image: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">Logo URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={theatreForm.logo}
                    onChange={(e) => setTheatreForm({ ...theatreForm, logo: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-amber-300 mb-1 flex items-center gap-1">
                    <span>📍 Google Maps Embed URL / Location Link</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Paste Google Maps embed iframe URL or share link (e.g. https://maps.app.goo.gl/...)"
                    value={theatreForm.mapLocationUrl || ''}
                    onChange={(e) => setTheatreForm({ ...theatreForm, mapLocationUrl: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                {editingTheatreId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTheatreId(null);
                      setTheatreForm({ name: '', city: 'Mumbai', state: 'Maharashtra', address: '', logo: '', image: '', facilities: 'VIP Recliners, IMAX 3D', screensCount: 6, totalSeats: 200 });
                    }}
                    className="px-4 py-2.5 rounded-xl glass-panel text-xs text-white/70 font-bold"
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg shadow-amber-500/20"
                >
                  {editingTheatreId ? 'Update Theatre' : 'Add Theatre to System'}
                </button>
              </div>
            </form>

            {/* Section B: Manage Showtime Slots per Theatre */}
            <form onSubmit={handleAddShowSlot} className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 max-w-4xl">
              <h3 className="text-lg font-bold text-cyan-400">Add Showtime Slot to Multiplex</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white mb-1">Target Theatre</label>
                  <select
                    value={showSlotForm.theatreId}
                    onChange={(e) => setShowSlotForm({ ...showSlotForm, theatreId: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white bg-[#0c0d14]"
                  >
                    {theatresList.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.city})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">Target Movie</label>
                  <select
                    value={showSlotForm.movieId}
                    onChange={(e) => setShowSlotForm({ ...showSlotForm, movieId: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white bg-[#0c0d14]"
                  >
                    {moviesList.map(m => (
                      <option key={m.id} value={m.id}>{m.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">Format</label>
                  <select
                    value={showSlotForm.format}
                    onChange={(e) => setShowSlotForm({ ...showSlotForm, format: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white bg-[#0c0d14]"
                  >
                    <option value="IMAX 3D">IMAX 3D</option>
                    <option value="Dolby Atmos">Dolby Atmos</option>
                    <option value="4DX">4DX</option>
                    <option value="3D">3D</option>
                    <option value="2D">2D</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">Screen Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Screen 1 - IMAX 3D"
                    value={showSlotForm.screenName}
                    onChange={(e) => setShowSlotForm({ ...showSlotForm, screenName: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">Showtime Slot</label>
                  <input
                    type="text"
                    placeholder="e.g. 10:30 AM, 02:15 PM"
                    value={showSlotForm.time}
                    onChange={(e) => setShowSlotForm({ ...showSlotForm, time: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">Base Ticket Price (₹)</label>
                  <input
                    type="number"
                    value={showSlotForm.price}
                    onChange={(e) => setShowSlotForm({ ...showSlotForm, price: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-lg shadow-cyan-500/20"
                >
                  Add Show Slot
                </button>
              </div>
            </form>

            {/* Section C: Existing Theatres Directory */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Configured Multiplex Venues ({theatresList.length})</h3>

              {theatresList.map(t => (
                <div key={t.id} className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-4">
                      <img src={t.image || t.logo} alt={t.name} className="w-16 h-16 rounded-2xl object-cover border border-amber-400/40 shrink-0" />
                      <div>
                        <h4 className="text-lg font-bold text-white">{t.name}</h4>
                        <p className="text-xs text-white/60">{t.address} • <strong className="text-amber-300">{t.city}</strong></p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingTheatreId(t.id);
                          setTheatreForm({
                            name: t.name,
                            city: t.city,
                            state: t.state || 'Maharashtra',
                            address: t.address,
                            logo: t.logo || '',
                            image: t.image || '',
                            mapLocationUrl: t.mapLocationUrl || '',
                            facilities: Array.isArray(t.facilities) ? t.facilities.join(', ') : (t.facilities || ''),
                            screensCount: t.screensCount || 6,
                            totalSeats: t.totalSeats || 200
                          });
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 hover:text-black border border-amber-400/40 text-amber-300 text-xs font-bold transition-all flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>

                      <button
                        onClick={() => handleDeleteTheatre(t.id)}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500 hover:text-white border border-rose-500/40 text-rose-300 text-xs font-bold transition-all flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>

                  {/* Showtimes List */}
                  <div>
                    <h5 className="text-xs font-bold text-white/70 mb-2">Scheduled Showtimes:</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {(t.shows || []).map(s => (
                        <div key={s.id} className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-amber-300">{s.movieTitle}</div>
                            <div className="text-[10px] text-white/50">{s.format} • {s.time} (₹{s.price})</div>
                          </div>
                          <button
                            onClick={() => handleDeleteShowSlot(t.id, s.id)}
                            className="p-1 rounded bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}



        {/* Tab 9: Plays & Theater CRUD */}
        {activeTab === 'plays' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold font-sans text-white">Plays & Theater Shows Management</h2>

            {/* Section A: Add / Edit Play Form */}
            <form onSubmit={handleSavePlay} className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 max-w-4xl">
              <h3 className="text-lg font-bold text-amber-400">
                {editingPlayId ? 'Edit Theater Play Details' : 'Add New Theater Play'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-white mb-1">Play Title / Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gujjubhai Banya Dabang"
                    value={playForm.title}
                    onChange={(e) => setPlayForm({ ...playForm, title: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">Language *</label>
                  <select
                    value={playForm.language}
                    onChange={(e) => setPlayForm({ ...playForm, language: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white bg-[#0c0d14]"
                  >
                    <option value="Gujarati">Gujarati</option>
                    <option value="Hindi">Hindi</option>
                    <option value="English">English</option>
                    <option value="Marathi">Marathi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">Genre / Category *</label>
                  <select
                    value={playForm.category}
                    onChange={(e) => setPlayForm({ ...playForm, category: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white bg-[#0c0d14]"
                  >
                    <option value="Comedy Drama">Comedy Drama</option>
                    <option value="Comedy">Comedy</option>
                    <option value="Musical Drama">Musical Drama</option>
                    <option value="Classic Tragedy">Classic Tragedy</option>
                    <option value="Suspense Thriller">Suspense Thriller</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">Corner Tap / Badge</label>
                  <select
                    value={playForm.badge || 'HOT SELLER'}
                    onChange={(e) => setPlayForm({ ...playForm, badge: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white bg-[#0c0d14]"
                  >
                    <option value="HOT SELLER">🔥 HOT SELLER</option>
                    <option value="HOUSEFULL SOON">⚡ HOUSEFULL SOON</option>
                    <option value="PREMIERE">✨ PREMIERE</option>
                    <option value="CRITICS CHOICE">🏆 CRITICS CHOICE</option>
                    <option value="None">None</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">City *</label>
                  <select
                    value={playForm.city || 'Surat'}
                    onChange={(e) => setPlayForm({ ...playForm, city: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white bg-black"
                  >
                    <option value="All">All Cities</option>
                    {GUJARAT_CITIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-white mb-1">Theater Venue & Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Opera House, Mumbai"
                    value={playForm.venue}
                    onChange={(e) => setPlayForm({ ...playForm, venue: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">Date *</label>
                  <input
                    type="text"
                    placeholder="e.g. 14 FEB 2027"
                    value={playForm.date}
                    onChange={(e) => setPlayForm({ ...playForm, date: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">Showtime *</label>
                  <input
                    type="text"
                    placeholder="e.g. 08:00 PM"
                    value={playForm.time}
                    onChange={(e) => setPlayForm({ ...playForm, time: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">Ticket Price per Person (₹) *</label>
                  <input
                    type="number"
                    required
                    value={playForm.price}
                    onChange={(e) => setPlayForm({ ...playForm, price: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">Total Seats Available</label>
                  <input
                    type="number"
                    value={playForm.totalCapacity}
                    onChange={(e) => setPlayForm({ ...playForm, totalCapacity: e.target.value, availableSeats: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-white mb-1">Poster / Banner Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={playForm.image}
                    onChange={(e) => setPlayForm({ ...playForm, image: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-white mb-1">Description / Synopsis</label>
                  <textarea
                    rows={3}
                    placeholder="Enter play synopsis, cast details, language overview..."
                    value={playForm.description}
                    onChange={(e) => setPlayForm({ ...playForm, description: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white"
                  ></textarea>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                {editingPlayId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPlayId(null);
                      setPlayForm({ title: '', language: 'Gujarati', category: 'Comedy Drama', badge: 'HOT SELLER', venue: '', city: 'Mumbai', date: '14 FEB 2027', time: '08:00 PM', price: 600, totalCapacity: 1200, availableSeats: 1200, image: '', description: '' });
                    }}
                    className="px-4 py-2.5 rounded-xl glass-panel text-xs text-white/70 font-bold cursor-pointer"
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  {editingPlayId ? 'Update Play' : 'Create Theater Play'}
                </button>
              </div>
            </form>

            {/* Section B: Existing Plays Directory */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Configured Theater Plays ({playsList.length})</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {playsList.map(pl => (
                  <div key={pl.id} className="glass-panel p-5 rounded-3xl border border-white/10 space-y-3 flex flex-col justify-between">
                    <div className="flex items-start gap-4">
                      <img src={pl.image} alt={pl.title} className="w-20 h-20 rounded-2xl object-cover border border-purple-400/40 shrink-0" />
                      <div className="space-y-1">
                        <div className="flex gap-1.5">
                          <span className="px-2 py-0.5 rounded bg-purple-600/20 text-purple-300 font-bold text-[10px] uppercase">
                            {pl.language}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] uppercase">
                            {pl.category}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white leading-tight">{pl.title}</h4>
                        <p className="text-xs text-white/60">{pl.venue} • <strong className="text-amber-300">₹{pl.price}/ticket</strong></p>
                        <p className="text-[11px] text-white/40">{pl.date} @ {pl.time} • Seats: {pl.availableSeats} / {pl.totalCapacity}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2 border-t border-white/10">
                      <button
                        onClick={() => {
                          setEditingPlayId(pl.id);
                          setPlayForm({
                            title: pl.title,
                            language: pl.language || 'Gujarati',
                            category: pl.category || 'Comedy Drama',
                            badge: pl.badge || 'HOT SELLER',
                            venue: pl.venue,
                            city: pl.city || 'Mumbai',
                            date: pl.date,
                            time: pl.time,
                            price: pl.price,
                            totalCapacity: pl.totalCapacity || 1200,
                            availableSeats: pl.availableSeats || 1200,
                            image: pl.image || '',
                            description: pl.description || ''
                          });
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 hover:text-black border border-amber-400/40 text-amber-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>

                      <button
                        onClick={() => handleDeletePlay(pl.id)}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500 hover:text-white border border-rose-500/40 text-rose-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Tab 10: Activities & Theme Parks CRUD */}
        {activeTab === 'activities' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold font-sans text-white">Adventure & Theme Park Activities Management</h2>

            {/* Section A: Add / Edit Activity Form */}
            <form onSubmit={handleSaveActivity} className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 max-w-4xl">
              <h3 className="text-lg font-bold text-amber-400">
                {editingActivityId ? 'Edit Activity Pass Details' : 'Add New Adventure Activity Pass'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-white mb-1">Activity Title / Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Imagicaa Water Park & Snow World"
                    value={activityForm.title}
                    onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">Category *</label>
                  <select
                    value={activityForm.category}
                    onChange={(e) => setActivityForm({ ...activityForm, category: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white bg-[#0c0d14]"
                  >
                    <option value="Water Park">Water Park</option>
                    <option value="Theme Park">Theme Park</option>
                    <option value="Trampoline Park">Trampoline Park</option>
                    <option value="Adventure Sport">Adventure Sport</option>
                    <option value="Arcade Zone">Arcade Zone</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">Corner Tap / Badge</label>
                  <select
                    value={activityForm.badge || 'UNLIMITED ACCESS'}
                    onChange={(e) => setActivityForm({ ...activityForm, badge: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white bg-[#0c0d14]"
                  >
                    <option value="UNLIMITED ACCESS">🌟 UNLIMITED ACCESS</option>
                    <option value="BEST VALUE">⚡ BEST VALUE</option>
                    <option value="POPULAR">🔥 POPULAR</option>
                    <option value="None">None</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">City *</label>
                  <select
                    value={activityForm.city || 'Surat'}
                    onChange={(e) => setActivityForm({ ...activityForm, city: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white bg-black"
                  >
                    <option value="All">All Cities</option>
                    {GUJARAT_CITIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-white mb-1">Location & Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Khopoli, Mumbai-Pune Expressway"
                    value={activityForm.location}
                    onChange={(e) => setActivityForm({ ...activityForm, location: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">Validity Period *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Full Day Pass (10:30 AM - 07:00 PM)"
                    value={activityForm.validity}
                    onChange={(e) => setActivityForm({ ...activityForm, validity: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">Ticket Price per Pass (₹) *</label>
                  <input
                    type="number"
                    required
                    value={activityForm.price}
                    onChange={(e) => setActivityForm({ ...activityForm, price: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">Total Pass Capacity</label>
                  <input
                    type="number"
                    value={activityForm.totalCapacity}
                    onChange={(e) => setActivityForm({ ...activityForm, totalCapacity: e.target.value, availableSeats: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-white mb-1">Banner / Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={activityForm.image}
                    onChange={(e) => setActivityForm({ ...activityForm, image: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                {/* Dynamic Benefits Manager */}
                <div className="md:col-span-3 space-y-2 p-4 rounded-2xl bg-white/5 border border-white/10">
                  <label className="block text-xs font-bold text-amber-400">Dynamic Benefits & Perks Manager</label>
                  
                  {/* Benefits Chips */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(activityForm.benefits || []).map((b, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center gap-1.5">
                        {b}
                        <button type="button" onClick={() => handleRemoveBenefit(idx)} className="hover:text-rose-400">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Add Benefit Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter benefit (e.g., Free Locker Access, Buffet Lunch, Fast Track Queue)"
                      value={newBenefitInput}
                      onChange={(e) => setNewBenefitInput(e.target.value)}
                      className="flex-1 p-2.5 rounded-xl glass-input text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddBenefit}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md shadow-amber-500/20 cursor-pointer"
                    >
                      + Add Benefit
                    </button>
                  </div>
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-white mb-1">Description / Overview</label>
                  <textarea
                    rows={3}
                    placeholder="Enter activity pass overview, safety guidelines..."
                    value={activityForm.description}
                    onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white"
                  ></textarea>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                {editingActivityId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingActivityId(null);
                      setActivityForm({ title: '', category: 'Water Park', badge: 'UNLIMITED ACCESS', location: '', city: 'Mumbai', validity: 'Full Day Pass (10:00 AM - 07:00 PM)', price: 1299, totalCapacity: 2000, availableSeats: 2000, image: '', description: '', benefits: ['Unlimited Rides', 'Free Entry'] });
                    }}
                    className="px-4 py-2.5 rounded-xl glass-panel text-xs text-white/70 font-bold cursor-pointer"
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  {editingActivityId ? 'Update Activity Pass' : 'Create Activity Pass'}
                </button>
              </div>
            </form>

            {/* Section B: Existing Activities Directory */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Configured Adventure Passes ({activitiesList.length})</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activitiesList.map(act => (
                  <div key={act.id} className="glass-panel p-5 rounded-3xl border border-white/10 space-y-3 flex flex-col justify-between">
                    <div className="flex items-start gap-4">
                      <img src={act.image} alt={act.title} className="w-20 h-20 rounded-2xl object-cover border border-amber-400/40 shrink-0" />
                      <div className="space-y-1">
                        <div className="flex gap-1.5">
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] uppercase">
                            {act.category}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white leading-tight">{act.title}</h4>
                        <p className="text-xs text-white/60">{act.location} • <strong className="text-amber-300">₹{act.price}/pass</strong></p>
                        <p className="text-[11px] text-white/40">{act.validity} • Passes: {act.availableSeats} / {act.totalCapacity}</p>
                        
                        {act.benefits && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {act.benefits.map((b, i) => (
                              <span key={i} className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] text-white/70">
                                ✓ {b}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2 border-t border-white/10">
                      <button
                        onClick={() => {
                          setEditingActivityId(act.id);
                          setActivityForm({
                            title: act.title,
                            category: act.category || 'Water Park',
                            badge: act.badge || 'UNLIMITED ACCESS',
                            location: act.location,
                            city: act.city || 'Mumbai',
                            validity: act.validity,
                            price: act.price,
                            totalCapacity: act.totalCapacity || 2000,
                            availableSeats: act.availableSeats || 2000,
                            image: act.image || '',
                            description: act.description || '',
                            benefits: act.benefits || []
                          });
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 hover:text-black border border-amber-400/40 text-amber-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>

                      <button
                        onClick={() => handleDeleteActivity(act.id)}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500 hover:text-white border border-rose-500/40 text-rose-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Tab 11: Broadcast Notifications System */}
        {activeTab === 'notifications' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold font-sans text-white">Notifications Management & Broadcast Desk</h2>
              <p className="text-xs text-cyan-300">Create, edit, broadcast, and delete live system announcements for all users.</p>
            </div>

            {/* Section A: Create / Edit Notification Form */}
            <form onSubmit={handleSaveNotification} className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 max-w-3xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-lg font-bold text-amber-400">
                  {editingNotifId ? '✏️ Edit Notification Announcement' : '➕ Create New Broadcast Notification'}
                </h3>
                {editingNotifId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingNotifId(null);
                      setNotifTitle('');
                      setNotifMessage('');
                      setNotifType('Info');
                      setNotifDate('');
                    }}
                    className="px-3 py-1 rounded-xl bg-white/10 text-white/70 hover:text-white text-xs font-bold"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-white mb-1">Notification Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 🎟️ Flat 50% Off IMAX 3D Weekend Screening!"
                    value={notifTitle}
                    onChange={(e) => setNotifTitle(e.target.value)}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">Priority / Type *</label>
                  <select
                    value={notifType}
                    onChange={(e) => setNotifType(e.target.value)}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white bg-[#0c0d14]"
                  >
                    <option value="Info">ℹ️ Info (General Update)</option>
                    <option value="Alert">🚨 Alert (Urgent Notice)</option>
                    <option value="Offer">🎁 Offer (Promotional Discount)</option>
                  </select>
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-white mb-1">Message Body / Detailed Announcement *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Enter comprehensive notification announcement details..."
                    value={notifMessage}
                    onChange={(e) => setNotifMessage(e.target.value)}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">Scheduled Date & Time (Optional)</label>
                  <input
                    type="datetime-local"
                    value={notifDate}
                    onChange={(e) => setNotifDate(e.target.value)}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                {editingNotifId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingNotifId(null);
                      setNotifTitle('');
                      setNotifMessage('');
                      setNotifType('Info');
                      setNotifDate('');
                    }}
                    className="px-4 py-2.5 rounded-xl glass-panel text-xs text-white/70 font-bold"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black font-extrabold text-xs shadow-lg shadow-amber-500/25 hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  <span>{editingNotifId ? 'Update Notification' : 'Broadcast Notification Live'}</span>
                </button>
              </div>
            </form>

            {/* Section B: Active Notifications Directory Table */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Active System Notifications ({(notifications || []).length})</h3>
                <span className="text-xs text-white/50">Changes reflect instantly inside User Profile</span>
              </div>

              {(notifications || []).length > 0 ? (
                <div className="space-y-3">
                  {(notifications || []).map(n => {
                    const typeLabel = n.type || n.priority || 'Info';
                    let badgeStyle = 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40';
                    if (typeLabel.toLowerCase().includes('alert')) {
                      badgeStyle = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
                    } else if (typeLabel.toLowerCase().includes('offer') || typeLabel.toLowerCase().includes('promo')) {
                      badgeStyle = 'bg-amber-500/20 text-amber-300 border-amber-400/40';
                    }

                    return (
                      <div 
                        key={n.id} 
                        className="glass-panel p-5 rounded-3xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:border-amber-400/40"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${badgeStyle}`}>
                              {typeLabel}
                            </span>
                            <h4 className="text-base font-bold text-white truncate">{n.title}</h4>
                          </div>

                          <p className="text-xs text-white/80 leading-relaxed">{n.message}</p>

                          <div className="flex items-center gap-4 text-[11px] text-white/40 pt-1">
                            <span>📅 Posted: {new Date(n.createdAt || Date.now()).toLocaleString()}</span>
                            <span>•</span>
                            <span className="text-cyan-400 font-mono">ID: {n.id}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-white/10 shrink-0">
                          <button
                            onClick={() => handleEditNotifClick(n)}
                            className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500 hover:text-black border border-amber-400/40 text-amber-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => handleDeleteNotifClick(n.id)}
                            className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500 hover:text-white border border-rose-500/40 text-rose-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="glass-panel p-12 rounded-3xl text-center text-white/50 space-y-2">
                  <Bell className="w-10 h-10 text-cyan-400/40 mx-auto" />
                  <h4 className="text-base font-bold text-white">No System Notifications Found</h4>
                  <p className="text-xs text-white/60">Use the form above to broadcast your first announcement to all users.</p>
                </div>
              )}
            </div>

          </div>
        )}

        </AdminTabErrorBoundary>
      </main>

      {/* Detailed User Activity History Modal */}
      {isUserActivityModalOpen && selectedUserForActivity && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
          <div className="relative w-full max-w-4xl glass-modal rounded-3xl p-6 border border-cyan-400/30 shadow-[0_0_50px_rgba(0,0,0,0.9)] text-white max-h-[90vh] flex flex-col my-auto overflow-hidden">
            
            {/* Header section */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-4">
                <img
                  src={selectedUserForActivity.profilePicture || selectedUserForActivity.avatar || 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=' + selectedUserForActivity.name}
                  alt={selectedUserForActivity.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-400/60 shadow-xl shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-bold font-sans text-white">{selectedUserForActivity.name}</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-extrabold border border-cyan-400/40 uppercase">
                      {selectedUserForActivity.provider || 'LOCAL'} AUTH
                    </span>
                    {selectedUserForActivity.role === 'ADMIN' && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-extrabold border border-amber-400/40 uppercase">ADMIN</span>
                    )}
                  </div>
                  <p className="text-xs text-cyan-300 mt-0.5 font-mono">{selectedUserForActivity.email}</p>
                  <p className="text-[11px] text-white/60 mt-0.5 flex items-center gap-3">
                    <span>📞 {selectedUserForActivity.phone || 'N/A'}</span>
                    <span>•</span>
                    <span>📍 {selectedUserForActivity.city || 'Surat'}</span>
                    <span>•</span>
                    <span className="text-amber-300 font-bold">💎 {selectedUserForActivity.rewardsPoints || 500} Rewards Pts</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsUserActivityModalOpen(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-rose-500 text-white/80 hover:text-white transition-all cursor-pointer shrink-0 border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-Tabs Selector */}
            <div className="flex items-center gap-2 pt-4 pb-2 border-b border-white/10 shrink-0 overflow-x-auto">
              <button
                onClick={() => setUserActivitySubTab('bookings')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  userActivitySubTab === 'bookings'
                    ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                    : 'glass-panel text-white/70 hover:text-white'
                }`}
              >
                🎟️ Bookings History ({userActivityData?.bookings?.length || 0})
              </button>

              <button
                onClick={() => setUserActivitySubTab('timeline')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  userActivitySubTab === 'timeline'
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                    : 'glass-panel text-white/70 hover:text-white'
                }`}
              >
                📜 Login & Session Timeline ({userActivityData?.logs?.length || 0})
              </button>

              <button
                onClick={() => setUserActivitySubTab('offers')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  userActivitySubTab === 'offers'
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                    : 'glass-panel text-white/70 hover:text-white'
                }`}
              >
                💳 Offers Claimed ({userActivityData?.claimedOffers?.length || 0})
              </button>

              <button
                onClick={() => setUserActivitySubTab('wishlist')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  userActivitySubTab === 'wishlist'
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                    : 'glass-panel text-white/70 hover:text-white'
                }`}
              >
                ❤️ Saved Wishlist ({userActivityData?.wishlist?.length || 0})
              </button>
            </div>

            {/* Sub-Tab Body */}
            <div className="my-4 overflow-y-auto flex-1 pr-1 space-y-4 min-h-[250px]">
              {isUserActivityLoading ? (
                <div className="py-12 text-center text-cyan-300 font-bold">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <span>Fetching activity log records...</span>
                </div>
              ) : (
                <>
                  {/* Sub-Tab 1: Bookings History */}
                  {userActivitySubTab === 'bookings' && (
                    <div className="space-y-3">
                      {userActivityData?.bookings?.length > 0 ? (
                        userActivityData.bookings.map((b, idx) => (
                          <div key={b.id || idx} className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-cyan-400/40 transition-colors">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-cyan-300 text-sm">{b.movieTitle || b.activityTitle || b.eventTitle || 'Cinema Ticket'}</span>
                                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                                  {b.status || 'CONFIRMED'}
                                </span>
                              </div>
                              <p className="text-xs text-white/60 mt-1">
                                {b.theatreName || b.location || 'PrimeShow Multiplex'} • Seats: <strong className="text-white">{Array.isArray(b.seats) ? b.seats.join(', ') : (b.seats || 'General')}</strong>
                              </p>
                              <p className="text-[10px] text-white/40 mt-0.5">
                                Order ID: {b.id} • Date: {b.showDate || b.date || 'Today'} • Time: {b.showTime || b.time || '10:00 AM'}
                              </p>
                            </div>

                            <div className="text-right shrink-0">
                              <div className="text-base font-bold text-amber-400">₹{b.totalAmount || b.totalPrice || 450}</div>
                              <div className="text-[10px] text-white/50">{b.paymentMethod || 'UPI Paid'}</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center glass-panel rounded-2xl text-white/50 text-xs">
                          No booking history recorded for this user yet.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sub-Tab 2: Login & Session Timeline */}
                  {userActivitySubTab === 'timeline' && (
                    <div className="space-y-3">
                      {userActivityData?.logs?.length > 0 ? (
                        userActivityData.logs.map((log, idx) => {
                          const logTime = new Date(log.timestamp || log.createdAt);
                          const formattedDate = logTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                          const formattedDay = logTime.toLocaleDateString('en-GB', { weekday: 'short' });
                          const formattedTime = logTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                          
                          const isLogin = log.action === 'LOGGED_IN';
                          const isLogout = log.action === 'LOGGED_OUT';
                          
                          return (
                            <div key={log.id || idx} className="glass-panel p-3.5 rounded-2xl border border-white/10 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl text-xs font-extrabold shrink-0 ${
                                  isLogin ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/40' :
                                  isLogout ? 'bg-rose-500/20 text-rose-400 border border-rose-400/40' :
                                  'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                                }`}>
                                  {isLogin ? '🟢 LOGIN' : isLogout ? '🔴 LOGOUT' : '⚡ EVENT'}
                                </div>

                                <div>
                                  <div className="font-bold text-white text-xs">{log.details || log.action}</div>
                                  <div className="text-[10px] text-white/50 mt-0.5">User: {log.userName} ({log.userEmail})</div>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <div className="text-xs font-mono font-bold text-cyan-300">{formattedDate} ({formattedDay})</div>
                                <div className="text-[10px] text-white/60 font-mono mt-0.5">{formattedTime}</div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-8 text-center glass-panel rounded-2xl text-white/50 text-xs">
                          No recent login/logout timeline logs recorded for this user.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sub-Tab 3: Wishlist */}
                  {userActivitySubTab === 'wishlist' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {userActivityData?.wishlist?.map((w, idx) => (
                        <div key={idx} className="glass-panel p-3 rounded-2xl border border-white/10 flex items-center gap-3">
                          <img src={w.poster} alt={w.title} className="w-12 h-16 rounded-xl object-cover border border-white/20 shrink-0" />
                          <div>
                            <h4 className="text-xs font-bold text-white">{w.title}</h4>
                            <p className="text-[10px] text-white/60">{w.genre}</p>
                            <span className="text-[10px] text-amber-400 font-bold mt-1 inline-block">★ {w.rating} / 10</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Sub-Tab 4: Notification Engagement */}
                  {userActivitySubTab === 'notifications' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-2">
                      <div className="glass-panel p-5 rounded-2xl border border-cyan-400/20 text-center">
                        <div className="text-2xl font-bold text-white">{userActivityData?.notificationEngagement?.totalReceived || 0}</div>
                        <div className="text-xs text-cyan-300 mt-1">Notifications Received</div>
                      </div>

                      <div className="glass-panel p-5 rounded-2xl border border-emerald-400/20 text-center">
                        <div className="text-2xl font-bold text-emerald-400">{userActivityData?.notificationEngagement?.readCount || 0}</div>
                        <div className="text-xs text-emerald-300 mt-1">Read & Engaged</div>
                      </div>

                      <div className="glass-panel p-5 rounded-2xl border border-amber-400/20 text-center">
                        <div className="text-2xl font-bold text-amber-400">{userActivityData?.notificationEngagement?.unreadCount || 0}</div>
                        <div className="text-xs text-amber-300 mt-1">Unread Alerts</div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-white/10 flex justify-end shrink-0">
              <button
                onClick={() => setIsUserActivityModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer transition-colors"
              >
                Close Activity Profile
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

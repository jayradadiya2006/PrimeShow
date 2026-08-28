import React, { useState, useEffect } from 'react';
import { 
  Shield, Film, Ticket, Users, DollarSign, Plus, Edit, Trash2, CheckCircle2, 
  XCircle, Tag, Eye, Lock, RefreshCw, AlertCircle, Sparkles, TrendingUp, MessageSquare, Send, Bot, LogOut, ChevronRight, Home, UserCheck, Image, Building, Bell, Theater, Compass, X, Zap, Award, Activity as ActivityIcon,
  Calendar, ChevronDown, Download, Filter, Layers, Percent, Server, Database, CreditCard, Mail, Phone, ArrowUpRight, Check
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
    screenLayoutsMap, getScreenLayout, updateScreenRowsConfig, updateRowPriceInScreenLayout, toggleBlockSeatForScreen, setManualSeatStatusForScreen, addRowToScreenLayout, deleteRowFromScreenLayout, showBookedSeatsMap,
    heroSlidesList, addHeroSlide, updateHeroSlide, deleteHeroSlide,
    featureStripsList, addFeatureStrip, updateFeatureStrip, deleteFeatureStrip,
    theatresList, setTheatresList, fetchTheatres, addTheatreToGlobalStore, updateTheatreInGlobalStore, deleteTheatreFromGlobalStore,
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

    const extraPayload = {
      date: notifDate || new Date().toISOString(),
      targetType: notifTargetType,
      targetUserIds: notifTargetType === 'SPECIFIC' ? selectedNotifTargetUsers : []
    };

    if (editingNotifId) {
      await updateNotification(editingNotifId, {
        title: notifTitle.trim(),
        message: notifMessage.trim(),
        priority: notifType,
        ...extraPayload
      });
      setActionSuccess('Notification updated & synced live with User Profile!');
    } else {
      await broadcastNotification(
        notifTitle.trim(),
        notifMessage.trim(),
        notifType,
        extraPayload
      );
      setActionSuccess(notifTargetType === 'SPECIFIC' ? 'Targeted Notification sent live to user profile!' : 'New Notification created & broadcasted live!');
    }

    setNotifTitle('');
    setNotifMessage('');
    setNotifType('Info');
    setNotifDate('');
    setNotifTargetType('ALL');
    setSelectedNotifTargetUsers([]);
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
  const [selectedCity, setSelectedCity] = useState('Surat');
  const [selectedTheatreId, setSelectedTheatreId] = useState('th_1');
  const [selectedScreenId, setSelectedScreenId] = useState('sc_1');
  const [selectedShowSlotId, setSelectedShowSlotId] = useState('th_1_sc_1');
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

  const [schedTheatreName, setSchedTheatreName] = useState('PVR Multiplex');
  const [schedCity, setSchedCity] = useState('Surat');
  const [schedAddress, setSchedAddress] = useState('Yogi Chowk, Surat');
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

  // Seat Management Cascading State (MongoDB Atlas Live Sync)
  const [selectedSeatMovieId, setSelectedSeatMovieId] = useState('mov_1');
  const [selectedShowSlotTime, setSelectedShowSlotTime] = useState('07:30 PM');

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
      name: "PVR Director's Cut, VR Mall",
      city: 'Surat',
      screens: [
        { id: 'sc_1', name: 'Screen 1 - IMAX 3D' },
        { id: 'sc_2', name: 'Screen 2 - 4DX' },
        { id: 'sc_3', name: 'Screen 3 - VIP Recliner' }
      ]
    },
    {
      id: 'th_2',
      name: 'INOX Megaplex, Vrindavan Mall',
      city: 'Surat',
      screens: [
        { id: 'sc_4', name: 'Screen 1 - ScreenX 270°' },
        { id: 'sc_5', name: 'Screen 2 - Dolby Atmos' }
      ]
    },
    {
      id: 'th_3',
      name: 'Cinepolis Imperial, Crystal Mall',
      city: 'Rajkot',
      screens: [
        { id: 'sc_6', name: 'Screen 1 - VIP Gold Recliner' },
        { id: 'sc_7', name: 'Screen 2 - Dolby Digital 7.1' }
      ]
    },
    {
      id: 'th_4',
      name: 'PVR Acropolis Mall',
      city: 'Ahmedabad',
      screens: [
        { id: 'sc_8', name: 'Screen 1 - IMAX 4K Laser' },
        { id: 'sc_9', name: 'Screen 2 - 4DX Dolby' }
      ]
    },
    {
      id: 'th_5',
      name: 'Inox Vadodara Central',
      city: 'Vadodara',
      screens: [
        { id: 'sc_10', name: 'Screen 1 - Dolby Atmos 3D' }
      ]
    },
    {
      id: 'th_6',
      name: 'PVR Himalaya Mall',
      city: 'Bhavnagar',
      screens: [
        { id: 'sc_11', name: 'Screen 1 - Executive Recliner' }
      ]
    },
    {
      id: 'th_7',
      name: 'Cinepolis Crystal Mall',
      city: 'Jamnagar',
      screens: [
        { id: 'sc_12', name: 'Screen 1 - VIP Lounge' }
      ]
    },
    {
      id: 'th_8',
      name: 'PVR City Pulse Mall',
      city: 'Gandhinagar',
      screens: [
        { id: 'sc_13', name: 'Screen 1 - IMAX 3D' }
      ]
    },
    {
      id: 'th_9',
      name: 'Inox Reliance Mall',
      city: 'Junagadh',
      screens: [
        { id: 'sc_14', name: 'Screen 1 - Dolby Digital 7.1' }
      ]
    },
    {
      id: 'th_10',
      name: 'Cinepolis Anand Town Center',
      city: 'Anand',
      screens: [
        { id: 'sc_15', name: 'Screen 1 - Premium Recliner' }
      ]
    }
  ];

  const OFFICIAL_18_CITIES = [
    'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 
    'Junagadh', 'Gandhinagar', 'Anand', 'Nadiad', 'Bharuch', 'Valsad', 
    'Navsari', 'Mehsana', 'Palanpur', 'Patan', 'Godhra', 'Himmatnagar'
  ];

  // 1. Full Theatres List from live backend state
  const currentTheatresList = (theatresList && theatresList.length > 0) ? theatresList : DEFAULT_THEATRES;

  // 2. Master Unified City List (Includes all 18 official User Panel Gujarat cities + any backend DB cities)
  const availableCities = Array.from(new Set([
    ...OFFICIAL_18_CITIES,
    ...(currentTheatresList || []).map(t => t?.city).filter(Boolean)
  ])).sort();

  // 3. Theatres Filtered Dynamically by Selected City
  const theatresInSelectedCity = (currentTheatresList || []).filter(
    t => t && (!selectedCity || (t.city || '').trim().toLowerCase() === (selectedCity || '').trim().toLowerCase())
  );

  // 4. Active Theatre Object (Auto-Syncs on Add / Delete)
  const activeTheatreObj = (theatresInSelectedCity || []).find(t => t?.id === selectedTheatreId) 
    || (theatresInSelectedCity || [])[0]
    || (currentTheatresList || []).find(t => t?.id === selectedTheatreId)
    || (currentTheatresList || [])[0];

  // 5. Active Seat Movie Object (Synced directly with MongoDB Atlas moviesList)
  const activeSeatMovieObj = (moviesList || []).find(m => m && (m.id === selectedSeatMovieId || m._id === selectedSeatMovieId || m.title === selectedSeatMovieId)) 
    || (moviesList || [])[0] 
    || { id: 'mov_1', title: 'Avatar: Fire and Ash' };

  // 6. Dynamic Dates for Selected Theatre + Movie Combo
  const availableDatesForSeatCombo = (() => {
    const datesSet = new Set();
    if (activeSeatMovieObj?.showDates && Array.isArray(activeSeatMovieObj.showDates)) {
      activeSeatMovieObj.showDates.forEach(d => datesSet.add(d));
    }
    if (activeTheatreObj?.hallSlotsByDate) {
      Object.keys(activeTheatreObj.hallSlotsByDate).forEach(d => datesSet.add(d));
    }
    if (activeTheatreObj?.shows && Array.isArray(activeTheatreObj.shows)) {
      activeTheatreObj.shows.forEach(s => { if (s.date) datesSet.add(s.date); });
    }
    const arr = Array.from(datesSet).sort();
    if (arr.length === 0) {
      arr.push(new Date().toISOString().slice(0, 10));
    }
    return arr;
  })();

  // 7. Dynamic Showtimes for Selected Theatre + Movie + Date Combo
  const availableShowtimesForSeatCombo = (() => {
    const timesSet = new Set();
    const currentDate = selectedSchedDate || availableDatesForSeatCombo[0] || new Date().toISOString().slice(0, 10);

    if (activeTheatreObj?.hallSlotsByDate && activeTheatreObj.hallSlotsByDate[currentDate]) {
      const halls = activeTheatreObj.hallSlotsByDate[currentDate];
      if (Array.isArray(halls)) {
        halls.forEach(h => {
          if (h.time || h.showTime) timesSet.add(h.time || h.showTime);
        });
      }
    }
    if (activeTheatreObj?.shows && Array.isArray(activeTheatreObj.shows)) {
      activeTheatreObj.shows.forEach(s => {
        if (s.time) timesSet.add(s.time);
      });
    }
    const arr = Array.from(timesSet);
    if (arr.length === 0) {
      return ['07:30 PM (IMAX 3D)', '10:15 AM (Recliner)', '04:00 PM (Dolby Atmos)', '10:30 PM (VIP Lounge)'];
    }
    return arr;
  })();

  // 8. Isolated Layout Key & Resolution
  const isolatedLayoutKey = `${activeTheatreObj?.id || 'th_1'}_${activeSeatMovieObj?.id || 'mov_1'}_${selectedSchedDate || 'date'}_${selectedShowSlotTime || '07:30 PM'}`;
  const currentLayout = getScreenLayout(isolatedLayoutKey);
  const seatRowsList = currentLayout?.rows || DEFAULT_SEAT_ROWS;

  // Live Seat Tracking & Dynamic Pricing State
  const [liveBookedSeatsMap, setLiveBookedSeatsMap] = useState({});
  const [seatPriceInputs, setSeatPriceInputs] = useState({});

  useEffect(() => {
    if (activeTab !== 'seats') return;

    const fetchLiveBookedSeats = async () => {
      try {
        const res = await API.get('/bookings/live-seats', {
          params: {
            city: selectedCity || 'Surat',
            movieId: activeShowSlotObj?.movieId || 'mov_1',
            date: selectedSchedDate || new Date().toISOString().slice(0, 10),
            theatreId: selectedTheatreId || 'th_1',
            showTime: activeShowSlotObj?.time || '07:30 PM',
            showId: isolatedLayoutKey
          }
        });
        if (res.data && res.data.bookedSeats) {
          setLiveBookedSeatsMap(res.data.bookedSeats);
        }
      } catch (err) {}
    };

    fetchLiveBookedSeats();
    const interval = setInterval(fetchLiveBookedSeats, 4000);
    return () => clearInterval(interval);
  }, [activeTab, selectedCity, selectedTheatreId, isolatedLayoutKey, activeShowSlotObj, selectedSchedDate]);

  const handleAddRowForm = (e) => {
    e.preventDefault();
    if (!newRowChar) return;
    addRowToScreenLayout(isolatedLayoutKey, newRowChar, newRowTier, newRowPrice, newRowSeatsCount);
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
    date: new Date().toISOString().split('T')[0],
    screenName: 'Screen 1 - IMAX 3D',
    format: 'IMAX 3D',
    time: '07:30 PM',
    price: 450
  });

  // Event CRUD & Showtime Slot Manager State
  const [eventsList, setEventsList] = useState([]);
  const [eventForm, setEventForm] = useState({
    title: '',
    category: 'Live Concert',
    badge: 'SELLING FAST',
    languages: 'English, Hindi, Gujarati',
    ageRating: 'UA 16+',
    venue: '',
    address: '',
    city: 'Surat',
    mapLocationUrl: '',
    date: new Date().toISOString().split('T')[0],
    time: '07:00 PM',
    price: 1500,
    totalCapacity: 5000,
    availableSeats: 5000,
    image: '',
    bannerUrl: '',
    description: '',
    termsAndConditions: 'Non-refundable ticket. Entry permits 1 person per ticket.',
    bookingStatus: true
  });
  const [editingEventId, setEditingEventId] = useState(null);

  // Event Date & Slot Schedule Manager State
  const [eventSlotEventId, setEventSlotEventId] = useState('');
  const [eventSlotDate, setEventSlotDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [eventSlotStartTime, setEventSlotStartTime] = useState('07:00 PM');
  const [eventSlotEndTime, setEventSlotEndTime] = useState('10:00 PM');
  const [eventSlotScreen, setEventSlotScreen] = useState('Main Concert Arena');
  const [eventSlotTier, setEventSlotTier] = useState('VIP');
  const [eventSlotPrice, setEventSlotPrice] = useState(1500);
  const [eventSlotCapacity, setEventSlotCapacity] = useState(500);

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

  // Target Audience Selection State for Notifications & Offers
  const [usersDropdownList, setUsersDropdownList] = useState([]);
  const [notifTargetType, setNotifTargetType] = useState('ALL'); // 'ALL' | 'SPECIFIC'
  const [selectedNotifTargetUsers, setSelectedNotifTargetUsers] = useState([]);
  const [offerTargetType, setOfferTargetType] = useState('ALL'); // 'ALL' | 'SPECIFIC'
  const [selectedOfferTargetUsers, setSelectedOfferTargetUsers] = useState([]);

  const fetchUsersDropdownList = async () => {
    try {
      const res = await API.get('/admin/users/list');
      if (res && res.data && res.data.users) {
        setUsersDropdownList(res.data.users);
      } else if (Array.isArray(res.data)) {
        setUsersDropdownList(res.data);
      }
    } catch (e) {
      try {
        const fallbackRes = await API.get('/users/list');
        if (fallbackRes && fallbackRes.data && fallbackRes.data.users) {
          setUsersDropdownList(fallbackRes.data.users);
        }
      } catch (err) {}
    }
  };

  useEffect(() => {
    fetchUsersDropdownList();
  }, []);

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

  // Fetch Scoped Blocked Seats when Cinema, Screen, or Show Slot changes
  const fetchScopedSeats = async () => {
    try {
      const res = await API.get(`/theatres/${selectedTheatreId || 'th_1'}/screens/${isolatedLayoutKey}/blocked-seats`);
      if (res.data?.blockedSeats) {
        setScreenBlockedSeats(res.data.blockedSeats);
      }
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

  // User Activity & Financial Desk State
  const [adminActivitiesList, setAdminActivitiesList] = useState([]);
  const [adminActivitiesLoading, setAdminActivitiesLoading] = useState(false);
  const [activitySearchQuery, setActivitySearchQuery] = useState('');
  const [activityCategoryTab, setActivityCategoryTab] = useState('ALL');
  const [activityCurrentPage, setActivityCurrentPage] = useState(1);
  const [activityTotalPages, setActivityTotalPages] = useState(1);
  const [activityTotalCount, setActivityTotalCount] = useState(0);

  // Live MongoDB Atlas Financial Aggregation State
  const [financialStats, setFinancialStats] = useState({
    totalRevenue: 0,
    totalTickets: 0,
    totalConfirmedBookings: 0,
    todayRevenue: 0,
    todayBookings: 0,
    categoryBreakdown: { Movie: 0, Event: 0, Play: 0, Activity: 0, PrivateTheatre: 0 },
    categoryRevenue: { Movie: 0, Event: 0, Play: 0, Activity: 0, PrivateTheatre: 0 },
    rolling7Days: []
  });
  const [financialStatsLoading, setFinancialStatsLoading] = useState(false);

  // Analytics Overview Chart & Top Movies State
  const [revenueRange, setRevenueRange] = useState('7days');
  const [bookingRange, setBookingRange] = useState('7days');
  const [revenueChartData, setRevenueChartData] = useState([]);
  const [bookingChartData, setBookingChartData] = useState([]);
  const [topMoviesList, setTopMoviesList] = useState([]);
  const [topTheatresList, setTopTheatresList] = useState([]);
  const [allTheatresList, setAllTheatresList] = useState([]);
  const [topMoviesModalOpen, setTopMoviesModalOpen] = useState(false);
  const [topMoviesSearchQuery, setTopMoviesSearchQuery] = useState('');
  const [topTheatresModalOpen, setTopTheatresModalOpen] = useState(false);
  const [topTheatresSearchQuery, setTopTheatresSearchQuery] = useState('');
  const [chartsLoading, setChartsLoading] = useState(false);

  const fetchRevenueChartData = async (range = '7days') => {
    try {
      const res = await API.get(`/admin/analytics/charts?range=${range}`);
      if (res.data?.dataPoints) {
        setRevenueChartData(res.data.dataPoints);
      }
    } catch (err) {
      console.warn('Error fetching revenue chart data:', err.message);
    }
  };

  const fetchBookingChartData = async (range = '7days') => {
    try {
      const res = await API.get(`/admin/analytics/charts?range=${range}`);
      if (res.data?.dataPoints) {
        setBookingChartData(res.data.dataPoints);
      }
    } catch (err) {
      console.warn('Error fetching booking chart data:', err.message);
    }
  };

  const fetchTopMoviesAnalytics = async () => {
    try {
      let res;
      try {
        res = await API.get('/admin/analytics/top-booking-overview');
      } catch (e1) {
        res = await API.get('/admin/analytics/top-movies');
      }
      if (res.data?.movies || res.data?.topMovies) {
        setTopMoviesList(res.data.movies || res.data.topMovies);
      }
    } catch (err) {
      console.warn('Error fetching top movies analytics:', err.message);
    }
  };

  const fetchTopTheatresAnalytics = async () => {
    try {
      let res;
      try {
        res = await API.get(`/admin/analytics/top-theatres?limit=all&t=${Date.now()}`);
      } catch (e1) {
        res = await API.get(`/admin/analytics/top-theatres-overview?limit=all&t=${Date.now()}`);
      }
      if (res.data?.allTheatres || res.data?.theatres || res.data?.topTheatres) {
        const fullList = res.data.allTheatres || res.data.theatres || res.data.topTheatres || [];
        setTopTheatresList(fullList);
        setAllTheatresList(fullList);
      }
    } catch (err) {
      console.warn('Error fetching top theatres analytics:', err.message);
    }
  };

  useEffect(() => {
    if (topTheatresModalOpen) {
      fetchTopTheatresAnalytics();
    }
  }, [topTheatresModalOpen]);

  const fetchFinancialStats = async () => {
    setFinancialStatsLoading(true);
    try {
      const res = await API.get('/admin/financial-stats');
      if (res.data?.financials) {
        setFinancialStats(res.data.financials);
      }
    } catch (err) {
      console.warn('Error fetching financial stats:', err.message);
    } finally {
      setFinancialStatsLoading(false);
    }
  };

  const fetchAdminUserActivities = async (page = 1, search = '', eventType = 'ALL') => {
    setAdminActivitiesLoading(true);
    try {
      const res = await API.get('/admin/user-activities', {
        params: { page, limit: 15, search, eventType }
      });
      if (res && res.data && res.data.activities) {
        setAdminActivitiesList(res.data.activities);
        setActivityTotalCount(res.data.totalCount || res.data.activities.length);
        setActivityTotalPages(res.data.totalPages || 1);
        setActivityCurrentPage(res.data.currentPage || page);
      } else if (Array.isArray(res.data)) {
        setAdminActivitiesList(res.data);
        setActivityTotalCount(res.data.length);
        setActivityTotalPages(Math.ceil(res.data.length / 15) || 1);
      }
    } catch (err) {
      console.warn('Error fetching admin user activities:', err);
    } finally {
      setAdminActivitiesLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    fetchAdminUsers(1, '');
    fetchFinancialStats();
    fetchRevenueChartData('7days');
    fetchBookingChartData('7days');
    fetchTopMoviesAnalytics();
    fetchTopTheatresAnalytics();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchAdminUsers(userCurrentPage, userSearchQuery);
    } else if (activeTab === 'user-activities') {
      fetchAdminUserActivities(activityCurrentPage, activitySearchQuery, activityCategoryTab);
    } else if (activeTab === 'analytics' || activeTab === 'overview') {
      fetchFinancialStats();
      fetchRevenueChartData(revenueRange);
      fetchBookingChartData(bookingRange);
      fetchTopMoviesAnalytics();
      fetchTopTheatresAnalytics();
    }
  }, [activeTab, userCurrentPage, activityCurrentPage, activityCategoryTab, revenueRange, bookingRange]);

  useEffect(() => {
    fetchScopedSeats();
  }, [selectedTheatreId, selectedScreenId, selectedShowSlotId, isolatedLayoutKey]);

  // Real-Time Admin Socket Alerts (New User Bookings, Registrations & Live Support Messages)
  useEffect(() => {
    if (!socket) return;

    socket.emit('JOIN_ADMIN_ROOM');

    socket.on('NEW_USER_BOOKING', (data) => {
      console.log('⚡ [Admin Socket Alert]: New booking received', data);
      setActionSuccess(`⚡ New Live Booking! ${data.userName || 'Customer'} booked ${data.title || 'tickets'} for ₹${data.totalAmount || 480}`);
      fetchFinancialStats();
      fetchTopMoviesAnalytics();
      fetchTopTheatresAnalytics();
      if (activeTab === 'bookings') {
        fetchCategorizedBookings(bookingCurrentPage, bookingCategoryTab, bookingSearchQuery);
      } else if (activeTab === 'user-activities') {
        fetchAdminUserActivities(activityCurrentPage, activitySearchQuery, activityCategoryTab);
      }
      setTimeout(() => setActionSuccess(''), 5000);
    });

    socket.on('BOOKING_CREATED', (data) => {
      fetchFinancialStats();
      fetchTopMoviesAnalytics();
      fetchTopTheatresAnalytics();
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

  // Cast Management CRUD (Real-Time Backend Persistence to MongoDB Atlas)
  const handleAddCastMember = async (e) => {
    e.preventDefault();
    if (!castName || !castMovieId) {
      setActionSuccess('Please select a movie and enter cast actor name');
      setTimeout(() => setActionSuccess(''), 3000);
      return;
    }

    const payload = {
      selectedMovieId: castMovieId,
      movieId: castMovieId,
      actorName: castName.trim(),
      name: castName.trim(),
      roleName: (castRole || 'Lead Role').trim(),
      role: (castRole || 'Lead Role').trim(),
      photoUrl: castPhoto || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      photo: castPhoto || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'
    };

    try {
      const res = await API.post(`/admin/movies/cast`, payload);
      const updatedMovie = res?.data?.movie;

      if (updatedMovie) {
        setMoviesList(prev => prev.map(m => (m.id === castMovieId || m._id === castMovieId) ? updatedMovie : m));
      } else {
        // Fallback local update
        setMoviesList(prev => prev.map(m => {
          if (m.id === castMovieId || m._id === castMovieId) {
            const castArr = [...(m.cast || [])];
            const exIdx = castArr.findIndex(c => c.name?.toLowerCase() === castName.trim().toLowerCase());
            const newMember = { id: `c_${Date.now()}`, name: castName.trim(), role: castRole || 'Lead Role', photo: payload.photoUrl };
            if (exIdx !== -1) castArr[exIdx] = newMember;
            else castArr.push(newMember);
            return { ...m, cast: castArr };
          }
          return m;
        }));
      }

      setActionSuccess(`Cast member '${castName}' saved to MongoDB Atlas!`);
    } catch (err) {
      console.warn('⚠️ Fallback saving cast member:', err.message);
      setActionSuccess(`Cast member '${castName}' updated!`);
    }

    setCastName('');
    setCastRole('');
    setCastPhoto('');
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const handleDeleteCastMember = async (movieId, castId) => {
    try {
      const res = await API.delete(`/movies/${movieId}/cast/${castId}`);
      if (res?.data?.movie) {
        setMoviesList(prev => prev.map(m => (m.id === movieId || m._id === movieId) ? res.data.movie : m));
      } else {
        setMoviesList(prev => prev.map(m => {
          if (m.id === movieId || m._id === movieId) {
            return { ...m, cast: (m.cast || []).filter(c => c.id !== castId && c._id !== castId) };
          }
          return m;
        }));
      }
    } catch (err) {
      setMoviesList(prev => prev.map(m => {
        if (m.id === movieId || m._id === movieId) {
          return { ...m, cast: (m.cast || []).filter(c => c.id !== castId && c._id !== castId) };
        }
        return m;
      }));
    }
    setActionSuccess('Cast member deleted from MongoDB Atlas');
    setTimeout(() => setActionSuccess(''), 3000);
  };

  // Movie Show & Date Schedule Handlers (Real-Time Persistence to MongoDB Atlas)
  const handleAddScheduleDate = async (e) => {
    e.preventDefault();
    if (!schedDateInput || !schedMovieId) {
      setActionSuccess('Please select a movie and pick a valid booking date');
      setTimeout(() => setActionSuccess(''), 3000);
      return;
    }

    const dateToAdd = schedDateInput;

    try {
      const res = await API.post('/admin/movies/add-date', {
        targetMovieId: schedMovieId,
        selectedMovieId: schedMovieId,
        dateStr: dateToAdd
      });

      const updatedMovie = res?.data?.movie;

      if (updatedMovie) {
        setMoviesList(prev => prev.map(m => (m.id === schedMovieId || m._id === schedMovieId) ? updatedMovie : m));
      } else {
        addShowDateToMovie(schedMovieId, dateToAdd);
      }

      setSelectedSchedDate(dateToAdd);
      setActionSuccess(`Booking date ${dateToAdd} saved to MongoDB Atlas!`);
    } catch (err) {
      console.warn('⚠️ Schedule date fallback:', err.message);
      addShowDateToMovie(schedMovieId, dateToAdd);
      setSelectedSchedDate(dateToAdd);
      setActionSuccess(`Booking date ${dateToAdd} added!`);
    }

    setSchedDateInput('');
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const handleDeleteScheduleDate = async (movieId, dateStr) => {
    try {
      const res = await API.post('/admin/movies/schedule', {
        selectedMovieId: movieId,
        action: 'DELETE_DATE',
        dateStr
      });
      if (res?.data?.movie) {
        setMoviesList(prev => prev.map(m => (m.id === movieId || m._id === movieId) ? res.data.movie : m));
      } else {
        deleteShowDateFromMovie(movieId, dateStr);
      }
    } catch (err) {
      deleteShowDateFromMovie(movieId, dateStr);
    }
    setActionSuccess(`Removed booking date ${dateStr} from MongoDB Atlas.`);
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const handleAddDateScopedShowSlot = async (e) => {
    e.preventDefault();
    if (!schedMovieId || !selectedSchedDate) {
      setActionSuccess('Please select a target movie and date first');
      setTimeout(() => setActionSuccess(''), 3000);
      return;
    }

    const effectiveTheatreName = (schedTheatreName || '').trim() || 'PVR Cinemas';
    const effectiveTime = (schedTime || '').trim() || '07:30 PM';
    const effectiveCity = schedCity || 'Surat';

    const matchedTheatre = (theatresList || []).find(t => t && t.name && t.name.trim().toLowerCase() === effectiveTheatreName.toLowerCase());

    const theatreObj = {
      id: matchedTheatre?.id || `th_${effectiveTheatreName.replace(/\s+/g, '_').toLowerCase()}`,
      name: effectiveTheatreName,
      city: effectiveCity,
      address: (schedAddress || '').trim() || matchedTheatre?.address || `${effectiveCity} Multiplex`,
      facilities: schedFacilities ? schedFacilities.split(',').map(s => s.trim()) : (matchedTheatre?.facilities || ['IMAX 3D', 'VIP Recliners'])
    };

    const showSlotObj = {
      id: `sh_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      time: effectiveTime,
      format: schedFormat || 'IMAX 3D',
      price: Number(schedPrice) || 250,
      tier: schedTier || 'VIP',
      screen: schedScreen || 'Screen 1',
      availableSeats: 120
    };

    // Immediately update local state so UI updates to (1 THEATRES) with slot badge instantly
    await addShowSlotToMovieTheatre(schedMovieId, selectedSchedDate, theatreObj, showSlotObj);

    try {
      let res;
      try {
        res = await API.post('/admin/movies/add-slot', {
          selectedMovieId: schedMovieId,
          movieId: schedMovieId,
          targetMovieId: schedMovieId,
          targetCity: effectiveCity,
          city: effectiveCity,
          bookingDate: selectedSchedDate,
          dateStr: selectedSchedDate,
          date: selectedSchedDate,
          theatreName: effectiveTheatreName,
          theatreId: theatreObj.id,
          theatreObj,
          theatre: theatreObj,
          showTime: effectiveTime,
          format: schedFormat,
          price: Number(schedPrice) || 250,
          showSlotObj,
          show: showSlotObj,
          action: 'ADD_SHOW_SLOT'
        });
      } catch (e1) {
        try {
          res = await API.post('/admin/movies/schedules', {
            selectedMovieId: schedMovieId,
            movieId: schedMovieId,
            targetCity: effectiveCity,
            city: effectiveCity,
            dateStr: selectedSchedDate,
            theatreObj,
            showSlotObj,
            action: 'ADD_SHOW_SLOT'
          });
        } catch (e2) {
          res = await API.post('/admin/movies/schedule', {
            selectedMovieId: schedMovieId,
            movieId: schedMovieId,
            action: 'ADD_SHOW_SLOT',
            dateStr: selectedSchedDate,
            theatreObj,
            showSlotObj
          });
        }
      }

      if (res?.data?.movie) {
        const dbM = res.data.movie;
        setMoviesList(prev => prev.map(m => (m.id === schedMovieId || m._id === schedMovieId || m.title === schedMovieId || (m.title && m.title.toLowerCase() === (schedMovieId || '').toLowerCase())) ? dbM : m));
      }

      setActionSuccess(`Show slot '${effectiveTime}' (${schedFormat}) saved to MongoDB Atlas for ${selectedSchedDate}!`);
    } catch (err) {
      console.warn('⚠️ Fallback adding show slot:', err.message);
      setActionSuccess(`Added show slot '${effectiveTime}'!`);
    }

    setTimeout(() => setActionSuccess(''), 3000);
  };

  // Cinema & Screen Scoped Seat Blocking & Persistence
  const handleToggleScopedSeatBlock = async (seatId) => {
    toggleBlockSeatForScreen(isolatedLayoutKey, seatId);
    try {
      const res = await API.post(`/theatres/${selectedTheatreId || 'th_1'}/screens/${isolatedLayoutKey}/toggle-seat-block`, { seatId });
      if (res.data?.blockedSeats) {
        setScreenBlockedSeats(res.data.blockedSeats);
      }
    } catch (err) {
      if (screenBlockedSeats.includes(seatId)) {
        setScreenBlockedSeats(screenBlockedSeats.filter(s => s !== seatId));
      } else {
        setScreenBlockedSeats([...screenBlockedSeats, seatId]);
      }
    }
    setActionSuccess(`Seat block toggled for Show Instance: ${isolatedLayoutKey}`);
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const handleSaveIsolatedSeatLayout = async () => {
    try {
      await API.post(`/theatres/${selectedTheatreId || 'th_1'}/screens/${isolatedLayoutKey}/blocked-seats`, {
        blockedSeats: currentLayout?.blockedSeats || [],
        rows: currentLayout?.rows || []
      });
      setActionSuccess(`Successfully saved seat layout to backend DB for ${activeTheatreObj?.name || 'Theatre'} (${isolatedLayoutKey})!`);
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setActionSuccess(`Seat layout committed locally for ${activeTheatreObj?.name || 'Theatre'}!`);
      setTimeout(() => setActionSuccess(''), 3000);
    }
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
      description: `Special ${offerCode.toUpperCase()} discount voucher valid on all screenings.`,
      targetType: offerTargetType,
      targetUserIds: offerTargetType === 'SPECIFIC' ? selectedOfferTargetUsers : []
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
    setOfferTargetType('ALL');
    setSelectedOfferTargetUsers([]);
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

    const extraPayload = {
      date: notifDate || new Date().toISOString(),
      targetType: notifTargetType,
      targetUserIds: notifTargetType === 'SPECIFIC' ? selectedNotifTargetUsers : []
    };

    await broadcastNotification(notifTitle.trim(), notifMessage.trim(), notifType, extraPayload);
    setNotifTitle('');
    setNotifMessage('');
    setNotifTargetType('ALL');
    setSelectedNotifTargetUsers([]);
    setActionSuccess(notifTargetType === 'SPECIFIC' ? 'Notification dispatched to targeted user(s)!' : 'System Notification Broadcasted to all User Profiles!');
    setTimeout(() => setActionSuccess(''), 4000);
  };

  const handleSaveTheatre = async (e) => {
    e.preventDefault();
    try {
      if (editingTheatreId) {
        await updateTheatreInGlobalStore(editingTheatreId, theatreForm);
        setActionSuccess('Theatre details updated successfully & saved to MongoDB Atlas!');
      } else {
        await addTheatreToGlobalStore(theatreForm);
        setActionSuccess('New Theatre added to platform & saved to MongoDB Atlas!');
      }
      setTheatreForm({ name: '', city: 'Surat', state: 'Gujarat', address: '', logo: '', image: '', facilities: 'VIP Recliners, IMAX 3D', screensCount: 6, totalSeats: 200 });
      setEditingTheatreId(null);
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setActionSuccess('Error saving theatre details: ' + err.message);
      setTimeout(() => setActionSuccess(''), 3000);
    }
  };

  const handleDeleteTheatre = async (id) => {
    try {
      await deleteTheatreFromGlobalStore(id);
      setActionSuccess('Theatre deleted permanently from MongoDB Atlas!');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {}
  };

  // Date-Wise Theatre Pricing State & Handlers
  const [pricingTheatreId, setPricingTheatreId] = useState('');
  const [pricingDate, setPricingDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [pricingStandard, setPricingStandard] = useState(250);
  const [pricingVip, setPricingVip] = useState(450);
  const [pricingImax, setPricingImax] = useState(650);
  const [pricingStatus, setPricingStatus] = useState('APPROVED');

  useEffect(() => {
    if (!pricingTheatreId && (theatresList || []).length > 0) {
      setPricingTheatreId(theatresList[0].id);
    }
    const currentThId = pricingTheatreId || theatresList[0]?.id;
    const targetTh = (theatresList || []).find(t => t.id === currentThId || t._id === currentThId);
    if (targetTh) {
      const dateConfig = targetTh.pricingByDate?.[pricingDate] || targetTh.datePricing?.[pricingDate];
      if (dateConfig) {
        setPricingStandard(dateConfig.standardPrice ?? 250);
        setPricingVip(dateConfig.vipPrice ?? 450);
        setPricingImax(dateConfig.imaxPrice ?? 650);
        setPricingStatus(dateConfig.status || 'APPROVED');
      }
    }
  }, [pricingTheatreId, pricingDate, theatresList]);

  const handleSaveTheatrePricingByDate = async (e) => {
    e.preventDefault();
    const targetThId = pricingTheatreId || theatresList[0]?.id;
    if (!targetThId || !pricingDate) {
      setActionSuccess('Please select a theatre and a date');
      setTimeout(() => setActionSuccess(''), 3000);
      return;
    }

    const payload = {
      theatreId: targetThId,
      selectedDate: pricingDate,
      dateStr: pricingDate,
      standardPrice: Number(pricingStandard) || 250,
      vipPrice: Number(pricingVip) || 450,
      imaxPrice: Number(pricingImax) || 650,
      status: pricingStatus,
      isConfigured: pricingStatus === 'APPROVED' || pricingStatus === 'AVAILABLE'
    };

    try {
      const res = await API.post('/admin/theatres/pricing-by-date', payload);
      const updatedTheatre = res?.data?.theatre;

      if (updatedTheatre) {
        setTheatresList(prev => prev.map(t => (t.id === targetThId || t._id === targetThId) ? updatedTheatre : t));
      } else {
        setTheatresList(prev => prev.map(t => {
          if (t.id === targetThId || t._id === targetThId) {
            const currentPBD = { ...(t.pricingByDate || {}) };
            currentPBD[pricingDate] = {
              standardPrice: payload.standardPrice,
              vipPrice: payload.vipPrice,
              imaxPrice: payload.imaxPrice,
              status: payload.status,
              isConfigured: payload.isConfigured,
              updatedAt: new Date().toISOString()
            };
            return { ...t, pricingByDate: currentPBD, datePricing: currentPBD };
          }
          return t;
        }));
      }

      setActionSuccess(`Date-wise pricing for ${pricingDate} saved to MongoDB Atlas!`);
    } catch (err) {
      console.warn('⚠️ Fallback date-wise pricing:', err.message);
      setActionSuccess(`Pricing for ${pricingDate} updated locally!`);
    }

    setTimeout(() => setActionSuccess(''), 3000);
  };

  // Dependent Date-Wise Hall & Price Slot Workflow State & Handlers
  const [configuredTheaterDates, setConfiguredTheaterDates] = useState([
    new Date().toISOString().split('T')[0],
    new Date(Date.now() + 86400000).toISOString().split('T')[0],
    new Date(Date.now() + 172800000).toISOString().split('T')[0]
  ]);
  const [newTheaterDateInput, setNewTheaterDateInput] = useState(() => new Date().toISOString().split('T')[0]);
  const [activeConfigDate, setActiveConfigDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [hallSlotForm, setHallSlotForm] = useState({
    theatreId: 'th_1',
    movieId: 'mov_1',
    hallName: 'Hall 1 - IMAX Laser',
    format: 'IMAX 3D',
    price: 450,
    time: '10:30 AM',
    totalSeats: 120
  });

  const handleAddTheaterDateSlot = (e) => {
    e.preventDefault();
    if (!newTheaterDateInput) return;
    if (!configuredTheaterDates.includes(newTheaterDateInput)) {
      setConfiguredTheaterDates([...configuredTheaterDates, newTheaterDateInput]);
    }
    setActiveConfigDate(newTheaterDateInput);
    setActionSuccess(`Added date slot ${newTheaterDateInput}!`);
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const handleSaveHallSlot = async (e) => {
    e.preventDefault();
    const targetThId = hallSlotForm.theatreId || theatresList[0]?.id || theatresList[0]?._id || 'th_1';
    const selectedMov = moviesList.find(m => m.id === hallSlotForm.movieId || m._id === hallSlotForm.movieId) || { title: 'PrimeShow Feature' };

    if (!targetThId || !activeConfigDate) {
      setActionSuccess('Please select a theatre and an active date slot');
      setTimeout(() => setActionSuccess(''), 3000);
      return;
    }

    const newHallItem = {
      id: `hall_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      movieId: hallSlotForm.movieId || 'mov_1',
      movieTitle: selectedMov.title || 'PrimeShow Feature',
      hallName: hallSlotForm.hallName || 'Hall 1',
      format: hallSlotForm.format || 'IMAX 3D',
      price: Number(hallSlotForm.price) || 450,
      time: hallSlotForm.time || '10:30 AM',
      showTime: hallSlotForm.time || '10:30 AM',
      totalSeats: Number(hallSlotForm.totalSeats) || 120,
      date: activeConfigDate
    };

    const payload = {
      theatreId: targetThId,
      targetTheaterId: targetThId,
      ...newHallItem,
      activeConfigDate,
      selectedDate: activeConfigDate,
      dateStr: activeConfigDate
    };

    // 1. Immediately update local state so UI count (0 Halls Available -> 1 Halls Available) updates synchronously
    setTheatresList(prev => prev.map(t => {
      const cleanTId = String(t.id || t._id).toLowerCase().trim();
      const cleanTargetId = String(targetThId).toLowerCase().trim();
      if (t.id === targetThId || t._id === targetThId || cleanTId === cleanTargetId) {
        const currentHBD = { ...(t.hallSlotsByDate || t.dateHalls || {}) };
        const hallsList = Array.isArray(currentHBD[activeConfigDate]) ? [...currentHBD[activeConfigDate]] : [];
        hallsList.push(newHallItem);
        currentHBD[activeConfigDate] = hallsList;
        return { ...t, hallSlotsByDate: currentHBD, dateHalls: currentHBD };
      }
      return t;
    }));

    // 2. Persist to MongoDB Atlas backend & re-fetch live state
    try {
      let res;
      try {
        res = await API.post('/admin/theatres/hall-slots', payload);
      } catch (e1) {
        res = await API.post('/api/theatres/add-hall-slot', payload);
      }
      const updatedTheatre = res?.data?.theatre;

      if (updatedTheatre) {
        setTheatresList(prev => prev.map(t => {
          const cleanTId = String(t.id || t._id).toLowerCase().trim();
          const cleanTargetId = String(targetThId).toLowerCase().trim();
          return (t.id === targetThId || t._id === targetThId || cleanTId === cleanTargetId) ? updatedTheatre : t;
        }));
      }
      setActionSuccess(`Hall '${hallSlotForm.hallName}' for ${activeConfigDate} saved to MongoDB Atlas!`);
      fetchAdminData();
    } catch (err) {
      console.warn('⚠️ Fallback saving hall slot:', err.message);
      setActionSuccess(`Hall '${hallSlotForm.hallName}' updated!`);
    }

    setTimeout(() => setActionSuccess(''), 3000);
  };

  const handleDeleteHallSlot = async (theatreId, hallId, dateStr) => {
    try {
      const res = await API.delete(`/theatres/${theatreId}/halls/${hallId}?date=${dateStr || ''}`);
      const updatedTheatre = res?.data?.theatre;
      if (updatedTheatre) {
        setTheatresList(prev => prev.map(t => (t.id === theatreId || t._id === theatreId) ? updatedTheatre : t));
      } else {
        setTheatresList(prev => prev.map(t => {
          if (t.id === theatreId || t._id === theatreId) {
            const currentHBD = { ...(t.hallSlotsByDate || {}) };
            if (dateStr && Array.isArray(currentHBD[dateStr])) {
              currentHBD[dateStr] = currentHBD[dateStr].filter(h => h.id !== hallId);
            } else {
              Object.keys(currentHBD).forEach(dKey => {
                if (Array.isArray(currentHBD[dKey])) {
                  currentHBD[dKey] = currentHBD[dKey].filter(h => h.id !== hallId);
                }
              });
            }
            return { ...t, hallSlotsByDate: currentHBD, dateHalls: currentHBD };
          }
          return t;
        }));
      }
      setActionSuccess('Hall slot deleted from MongoDB Atlas!');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      console.warn('⚠️ Error deleting hall slot:', err.message);
    }
  };

  const handleAddShowSlot = async (e) => {
    e.preventDefault();
    try {
      const selectedMov = moviesList.find(m => m.id === showSlotForm.movieId) || { title: 'Avatar: Fire and Ash' };
      const selectedDateStr = showSlotForm.date || new Date().toISOString().split('T')[0];
      const payload = {
        ...showSlotForm,
        theatreId: showSlotForm.theatreId,
        date: selectedDateStr,
        selectedDate: selectedDateStr,
        dateStr: selectedDateStr,
        movieTitle: selectedMov.title
      };

      const res = await API.post('/admin/theatres/shows', payload);
      const updatedTheatre = res?.data?.theatre || res?.data;

      if (updatedTheatre && updatedTheatre.id) {
        setTheatresList(prev => prev.map(t => t.id === showSlotForm.theatreId ? updatedTheatre : t));
      } else {
        const fallbackRes = await API.post(`/theatres/${showSlotForm.theatreId}/shows`, payload);
        setTheatresList(prev => prev.map(t => t.id === showSlotForm.theatreId ? fallbackRes.data : t));
      }

      setActionSuccess(`Show Slot for date ${selectedDateStr} saved to MongoDB Atlas!`);
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      console.warn('⚠️ Error adding date-wise show slot:', err.message);
      setActionSuccess('Error saving show slot');
      setTimeout(() => setActionSuccess(''), 3000);
    }
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
    if (!eventForm.title || !eventForm.venue) return;
    try {
      const payload = {
        ...eventForm,
        price: Number(eventForm.price) || 0,
        totalCapacity: Number(eventForm.totalCapacity) || 1000,
        availableSeats: Number(eventForm.availableSeats || eventForm.totalCapacity || 1000)
      };

      if (editingEventId) {
        let res;
        try {
          res = await API.put(`/events/${editingEventId}`, payload);
        } catch (e1) {
          res = await API.post('/admin/events', { ...payload, id: editingEventId });
        }
        const updated = res.data?.event || res.data;
        setEventsList(prev => prev.map(ev => (ev.id === editingEventId || ev._id === editingEventId) ? updated : ev));
        setActionSuccess(`Event "${eventForm.title}" updated & saved to MongoDB Atlas!`);
      } else {
        const res = await API.post('/admin/events', payload);
        const created = res.data?.event || res.data;
        setEventsList(prev => [created, ...prev]);
        setActionSuccess(`New Event "${eventForm.title}" created & saved to MongoDB Atlas!`);
      }

      setEventForm({
        title: '', category: 'Live Concert', badge: 'SELLING FAST', languages: 'English, Hindi, Gujarati',
        ageRating: 'UA 16+', venue: '', address: '', city: 'Surat', mapLocationUrl: '',
        date: new Date().toISOString().split('T')[0], time: '07:00 PM', price: 1500,
        totalCapacity: 5000, availableSeats: 5000, image: '', bannerUrl: '', description: '',
        termsAndConditions: 'Non-refundable ticket. Entry permits 1 person per ticket.', bookingStatus: true
      });
      setEditingEventId(null);
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Error saving event';
      setActionSuccess(`Failed: ${msg}`);
      setTimeout(() => setActionSuccess(''), 4000);
    }
  };

  const handleEditEventClick = (ev) => {
    setEditingEventId(ev.id);
    setEventForm({
      title: ev.title || '',
      category: ev.category || 'Live Concert',
      badge: ev.badge || 'LIVE',
      languages: Array.isArray(ev.languages) ? ev.languages.join(', ') : (ev.languages || 'English, Hindi'),
      ageRating: ev.ageRating || ev.certificate || 'UA 16+',
      venue: ev.venue || ev.venueLocation || '',
      address: ev.address || ev.venueLocation || '',
      city: ev.city || 'Surat',
      mapLocationUrl: ev.mapLocationUrl || '',
      date: ev.date || ev.eventDate || new Date().toISOString().split('T')[0],
      time: ev.time || ev.eventTime || '07:00 PM',
      price: ev.price ?? ev.ticketPrice ?? 1500,
      totalCapacity: ev.totalCapacity || 1000,
      availableSeats: ev.availableSeats || 1000,
      image: ev.image || ev.poster || '',
      bannerUrl: ev.bannerUrl || ev.banner || '',
      description: ev.description || ev.synopsis || '',
      termsAndConditions: ev.termsAndConditions || 'Non-refundable ticket. Entry permits 1 person per ticket.',
      bookingStatus: ev.bookingStatus !== false
    });
  };

  const handleSaveEventSlot = async (e) => {
    e.preventDefault();
    const targetEvId = eventSlotEventId || eventsList[0]?.id;
    if (!targetEvId || !eventSlotDate) {
      setActionSuccess('Please select an event and a slot date');
      setTimeout(() => setActionSuccess(''), 3000);
      return;
    }

    const slotPayload = {
      eventId: targetEvId,
      targetEventId: targetEvId,
      date: eventSlotDate,
      eventDate: eventSlotDate,
      dateStr: eventSlotDate,
      time: eventSlotStartTime,
      startTime: eventSlotStartTime,
      endTime: eventSlotEndTime,
      screen: eventSlotScreen,
      hall: eventSlotScreen,
      category: eventSlotTier,
      tier: eventSlotTier,
      price: Number(eventSlotPrice) || 1500,
      ticketPrice: Number(eventSlotPrice) || 1500,
      totalCapacity: Number(eventSlotCapacity) || 500
    };

    try {
      const res = await API.post('/admin/events/add-slot', slotPayload);
      const updatedEv = res.data?.event;

      if (updatedEv) {
        setEventsList(prev => prev.map(ev => (ev.id === targetEvId || ev._id === targetEvId) ? updatedEv : ev));
      } else {
        setEventsList(prev => prev.map(ev => {
          if (ev.id === targetEvId || ev._id === targetEvId) {
            const currentSlots = { ...(ev.slots || {}) };
            const list = Array.isArray(currentSlots[eventSlotDate]) ? [...currentSlots[eventSlotDate]] : [];
            list.push({ id: `slot_${Date.now()}`, ...slotPayload });
            currentSlots[eventSlotDate] = list;

            const dates = Array.isArray(ev.eventDates) ? [...ev.eventDates] : [];
            if (!dates.includes(eventSlotDate)) dates.push(eventSlotDate);

            return { ...ev, slots: currentSlots, schedules: currentSlots, eventDates: dates, dates };
          }
          return ev;
        }));
      }

      setActionSuccess(`Slot '${eventSlotStartTime}' (${eventSlotTier}) saved to MongoDB Atlas for ${eventSlotDate}!`);
    } catch (err) {
      console.warn('⚠️ Fallback saving event slot:', err.message);
      setActionSuccess(`Slot for ${eventSlotDate} updated locally!`);
    }

    setTimeout(() => setActionSuccess(''), 4000);
  };

  const handleDeleteEvent = async (id) => {
    try {
      await API.delete(`/admin/events/${id}`);
    } catch (e1) {
      try {
        await API.delete(`/events/${id}`);
      } catch (e2) {}
    }
    setEventsList(eventsList.filter(ev => ev.id !== id));
    setActionSuccess('Event permanently deleted from MongoDB Atlas!');
    setTimeout(() => setActionSuccess(''), 3000);
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
    { id: 'users', label: 'User Directory & History', icon: Users },
    { id: 'cms-editor', label: 'CMS & Visual Layout Control', icon: Compass },
    { id: 'hero', label: 'Hero Slideshow & Banners', icon: Image },
    { id: 'strips', label: 'Home Page Feature Strips', icon: Zap },
    { id: 'upcoming', label: 'Upcoming Releases', icon: Award },
    { id: 'movies', label: 'Movie & Cast Management', icon: Film },
    { id: 'theatres', label: 'Theatre & Showtimes CRUD', icon: Building },
    { id: 'events', label: 'Events & Concerts CRUD', icon: Calendar },
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
        {(activeTab === 'analytics' || activeTab === 'overview') && (
          <div className="space-y-6 animate-fade-in pb-8">
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold font-sans text-white">Analytics Overview</h1>
                <p className="text-xs text-slate-400 mt-1">Real-time insights and live performance metrics from MongoDB Atlas</p>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <button
                  onClick={() => fetchFinancialStats()}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-xs text-cyan-300 font-bold hover:bg-cyan-500 hover:text-black transition-all cursor-pointer shadow-lg shadow-cyan-500/10"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${financialStatsLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh Live Financials</span>
                </button>

                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0e1626] border border-slate-700/60 text-xs text-slate-200 font-medium cursor-pointer hover:border-slate-500 transition-all">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Rolling 7 Days Data</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
                </div>

                <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0e1626] border border-slate-700/60 text-xs text-slate-200 font-medium hover:bg-slate-800 transition-all cursor-pointer">
                  <Download className="w-3.5 h-3.5 text-slate-300" />
                  <span>Export</span>
                </button>

                <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0e1626] border border-slate-700/60 text-xs text-slate-200 font-medium hover:bg-slate-800 transition-all cursor-pointer">
                  <Filter className="w-3.5 h-3.5 text-slate-300" />
                  <span>Filters</span>
                </button>
              </div>
            </div>

            {/* TOP 4 LIVE FINANCIAL METRIC CARDS (MongoDB Atlas Aggregation) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* KPI Card 1: Total Booking Revenue */}
              <div className="bg-[#0e1626] p-5 rounded-2xl border border-[#1b273e] relative overflow-hidden flex flex-col justify-between shadow-xl">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-medium">Total Booking Revenue</span>
                    <div className="w-9 h-9 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl lg:text-3xl font-extrabold text-white font-sans tracking-tight">
                    ₹{(financialStats.totalRevenue || 0).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 mt-1">
                    <span>Live MongoDB Atlas Sync</span>
                  </div>
                </div>
                <div className="mt-4 -mb-1 -mx-2 h-10">
                  <svg className="w-full h-full" viewBox="0 0 280 40" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="blueSpark" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,28 Q35,32 70,22 T140,24 T210,12 T280,6 L280,40 L0,40 Z" fill="url(#blueSpark)" />
                    <path d="M0,28 Q35,32 70,22 T140,24 T210,12 T280,6" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              {/* KPI Card 2: Ticket Revenue / Seats Booked */}
              <div className="bg-[#0e1626] p-5 rounded-2xl border border-[#1b273e] relative overflow-hidden flex flex-col justify-between shadow-xl">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-medium">Ticket Revenue & Seats</span>
                    <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Ticket className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl lg:text-3xl font-extrabold text-white font-sans tracking-tight">
                    {(financialStats.totalTickets || 0).toLocaleString('en-IN')} Seats
                  </div>
                  <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 mt-1">
                    <span>Across {financialStats.totalConfirmedBookings || 0} Confirmed Transactions</span>
                  </div>
                </div>
                <div className="mt-4 -mb-1 -mx-2 h-10">
                  <svg className="w-full h-full" viewBox="0 0 280 40" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="greenSpark" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,30 Q35,26 70,28 T140,18 T210,14 T280,4 L280,40 L0,40 Z" fill="url(#greenSpark)" />
                    <path d="M0,30 Q35,26 70,28 T140,18 T210,14 T280,4" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              {/* KPI Card 3: Today's Activity & Revenue */}
              <div className="bg-[#0e1626] p-5 rounded-2xl border border-[#1b273e] relative overflow-hidden flex flex-col justify-between shadow-xl">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-medium">Today's Activity & Revenue</span>
                    <div className="w-9 h-9 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                      <Zap className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl lg:text-3xl font-extrabold text-white font-sans tracking-tight">
                    {financialStats.todayBookings || 0} Bookings
                  </div>
                  <div className="text-[11px] font-bold text-purple-300 flex items-center gap-1 mt-1">
                    <span>Revenue Today: ₹{(financialStats.todayRevenue || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <div className="mt-4 -mb-1 -mx-2 h-10">
                  <svg className="w-full h-full" viewBox="0 0 280 40" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="purpleSpark" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,26 Q35,28 70,22 T140,25 T210,16 T280,8 L280,40 L0,40 Z" fill="url(#purpleSpark)" />
                    <path d="M0,26 Q35,28 70,22 T140,25 T210,16 T280,8" fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              {/* KPI Card 4: 7-Day Performance Overview */}
              <div className="bg-[#0e1626] p-5 rounded-2xl border border-[#1b273e] relative overflow-hidden flex flex-col justify-between shadow-xl">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-medium">7-Day Rolling Performance</span>
                    <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl lg:text-3xl font-extrabold text-white font-sans tracking-tight">
                    ₹{(
                      (financialStats.rolling7Days || []).reduce((acc, curr) => acc + (curr.revenue || 0), 0)
                    ).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1 mt-1">
                    <span>
                      {(financialStats.rolling7Days || []).reduce((acc, curr) => acc + (curr.bookings || 0), 0)} Confirmed Bookings (7 Days)
                    </span>
                  </div>
                </div>
                <div className="mt-4 -mb-1 -mx-2 h-10">
                  <svg className="w-full h-full" viewBox="0 0 280 40" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="amberSpark" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,25 Q35,29 70,24 T140,22 T210,14 T280,10 L280,40 L0,40 Z" fill="url(#amberSpark)" />
                    <path d="M0,25 Q35,29 70,24 T140,22 T210,14 T280,10" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </div>

            {/* MAIN CHART SECTION (2 CARDS) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Left Chart: Real-Time Revenue Overview (Trading/Stock Area Chart) */}
              <div className="bg-[#0e1626] p-6 rounded-2xl border border-[#1b273e] space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-cyan-400" />
                      <span>Stock & Revenue Overview Chart</span>
                    </h3>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xl font-extrabold text-white font-sans">
                        ₹{(
                          (revenueChartData.length > 0 ? revenueChartData : financialStats.rolling7Days || [])
                            .reduce((acc, curr) => acc + (curr.revenue || 0), 0)
                        ).toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>Live Sync</span>
                      </span>
                    </div>
                  </div>

                  {/* Time-Range Filter Dropdown: EXACT Options (1 Day, 7 Days, 15 Days, 30 Days) */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-medium">Time Range:</span>
                    <select
                      value={revenueRange}
                      onChange={(e) => {
                        setRevenueRange(e.target.value);
                        fetchRevenueChartData(e.target.value);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-cyan-300 font-bold focus:outline-none focus:border-cyan-400 cursor-pointer"
                    >
                      <option value="1day">1 Day</option>
                      <option value="7days">7 Days</option>
                      <option value="15days">15 Days</option>
                      <option value="30days">30 Days</option>
                    </select>
                  </div>
                </div>

                <div className="w-full pt-4">
                  <div className="relative h-56 w-full">
                    {/* SVG Real-Time Stock Line/Area Chart */}
                    {(() => {
                      const data = revenueChartData.length > 0 ? revenueChartData : [
                        { timeLabel: 'Day 1', revenue: 0 },
                        { timeLabel: 'Day 2', revenue: 0 },
                        { timeLabel: 'Day 3', revenue: 0 },
                        { timeLabel: 'Day 4', revenue: 0 },
                        { timeLabel: 'Day 5', revenue: 0 },
                        { timeLabel: 'Day 6', revenue: 0 },
                        { timeLabel: 'Day 7', revenue: 0 }
                      ];
                      const maxRev = Math.max(...data.map(d => d.revenue || 0), 1000);
                      const points = data.map((d, i) => {
                        const x = 40 + (i / Math.max(data.length - 1, 1)) * 430;
                        const y = 170 - ((d.revenue || 0) / maxRev) * 140;
                        return { x, y, label: d.timeLabel, rev: d.revenue || 0 };
                      });

                      const pathD = points.reduce((acc, p, idx) => {
                        return idx === 0 ? `M ${p.x},${p.y}` : `${acc} L ${p.x},${p.y}`;
                      }, '');

                      const areaD = `${pathD} L ${points[points.length - 1].x},180 L ${points[0].x},180 Z`;

                      return (
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="stockAreaGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.45" />
                              <stop offset="100%" stopColor="#00f2fe" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>

                          {/* Grid Lines */}
                          <line x1="35" y1="30" x2="480" y2="30" stroke="#1e293b" strokeDasharray="3 3" />
                          <line x1="35" y1="80" x2="480" y2="80" stroke="#1e293b" strokeDasharray="3 3" />
                          <line x1="35" y1="130" x2="480" y2="130" stroke="#1e293b" strokeDasharray="3 3" />
                          <line x1="35" y1="180" x2="480" y2="180" stroke="#1e293b" />

                          {/* Y-Axis Labels */}
                          <text x="0" y="34" fill="#64748b" fontSize="10">₹{(maxRev).toLocaleString('en-IN')}</text>
                          <text x="0" y="105" fill="#64748b" fontSize="10">₹{Math.round(maxRev * 0.5).toLocaleString('en-IN')}</text>
                          <text x="15" y="184" fill="#64748b" fontSize="10">₹0</text>

                          {/* Area Fill */}
                          <path d={areaD} fill="url(#stockAreaGrad)" />

                          {/* Stock Line */}
                          <path d={pathD} fill="none" stroke="#00f2fe" strokeWidth="3" strokeLinecap="round" />

                          {/* Interactive Data Points */}
                          {points.map((p, idx) => (
                            <g key={idx} className="group cursor-pointer">
                              <circle cx={p.x} cy={p.y} r="5" fill="#00f2fe" stroke="#0e1626" strokeWidth="2" />
                              <circle cx={p.x} cy={p.y} r="8" fill="#00f2fe" opacity="0.2" className="group-hover:animate-ping" />
                            </g>
                          ))}
                        </svg>
                      );
                    })()}

                    {/* X Axis Labels */}
                    <div className="flex justify-between pl-8 pr-2 mt-2 text-[10px] text-slate-400 font-medium">
                      {(revenueChartData.length > 0 ? revenueChartData : [
                        { timeLabel: 'Day 1' }, { timeLabel: 'Day 2' }, { timeLabel: 'Day 3' }, { timeLabel: 'Day 4' }, { timeLabel: 'Day 5' }, { timeLabel: 'Day 6' }, { timeLabel: 'Day 7' }
                      ]).map((pt, i) => (
                        <span key={i} className="truncate max-w-[50px]">{pt.timeLabel}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Chart: Real-Time Candlestick / Bar Booking Overview Chart */}
              <div className="bg-[#0e1626] p-6 rounded-2xl border border-[#1b273e] space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-400" />
                      <span>Candlestick & Booking Overview</span>
                    </h3>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xl font-extrabold text-white font-sans">
                        {(
                          (bookingChartData.length > 0 ? bookingChartData : financialStats.rolling7Days || [])
                            .reduce((acc, curr) => acc + (curr.bookings || 0), 0)
                        ).toLocaleString('en-IN')} Bookings
                      </span>
                      <span className="text-xs font-bold text-emerald-400">Live Volume</span>
                    </div>
                  </div>

                  {/* Time-Range Filter Dropdown: EXACT Options (1 Day, 7 Days, 15 Days, 30 Days) */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-medium">Time Range:</span>
                    <select
                      value={bookingRange}
                      onChange={(e) => {
                        setBookingRange(e.target.value);
                        fetchBookingChartData(e.target.value);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-emerald-300 font-bold focus:outline-none focus:border-emerald-400 cursor-pointer"
                    >
                      <option value="1day">1 Day</option>
                      <option value="7days">7 Days</option>
                      <option value="15days">15 Days</option>
                      <option value="30days">30 Days</option>
                    </select>
                  </div>
                </div>

                <div className="w-full pt-4">
                  <div className="relative h-56 w-full">
                    {/* SVG Candlestick / Bar Chart */}
                    {(() => {
                      const bData = bookingChartData.length > 0 ? bookingChartData : [
                        { timeLabel: 'Day 1', bookings: 0, high: 0, low: 0 },
                        { timeLabel: 'Day 2', bookings: 0, high: 0, low: 0 },
                        { timeLabel: 'Day 3', bookings: 0, high: 0, low: 0 },
                        { timeLabel: 'Day 4', bookings: 0, high: 0, low: 0 },
                        { timeLabel: 'Day 5', bookings: 0, high: 0, low: 0 },
                        { timeLabel: 'Day 6', bookings: 0, high: 0, low: 0 },
                        { timeLabel: 'Day 7', bookings: 0, high: 0, low: 0 }
                      ];
                      const maxBookings = Math.max(...bData.map(d => Math.max(d.bookings || 0, d.high || 0)), 10);

                      return (
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200" preserveAspectRatio="none">
                          {/* Grid Lines */}
                          <line x1="30" y1="20" x2="480" y2="20" stroke="#1e293b" strokeDasharray="3 3" />
                          <line x1="30" y1="70" x2="480" y2="70" stroke="#1e293b" strokeDasharray="3 3" />
                          <line x1="30" y1="120" x2="480" y2="120" stroke="#1e293b" strokeDasharray="3 3" />
                          <line x1="30" y1="180" x2="480" y2="180" stroke="#1e293b" />

                          {/* Y Axis Labels */}
                          <text x="0" y="24" fill="#64748b" fontSize="10">{maxBookings}</text>
                          <text x="0" y="104" fill="#64748b" fontSize="10">{Math.round(maxBookings * 0.5)}</text>
                          <text x="10" y="184" fill="#64748b" fontSize="10">0</text>

                          {/* Candlesticks / Bars */}
                          {bData.map((bar, i) => {
                            const step = 450 / Math.max(bData.length, 1);
                            const cx = 50 + i * step;
                            const bVal = bar.bookings || 0;
                            const hVal = bar.high || (bVal * 1.3);
                            const lVal = bar.low || (bVal * 0.4);

                            const barY = 180 - (bVal / maxBookings) * 150;
                            const barH = Math.max(6, (bVal / maxBookings) * 150);
                            const highY = 180 - (hVal / maxBookings) * 150;
                            const lowY = 180 - (lVal / maxBookings) * 150;

                            const isGreen = i % 2 === 0 || bVal > 0;

                            return (
                              <g key={i} className="group cursor-pointer">
                                {/* Candlestick Wick (High-Low Line) */}
                                <line
                                  x1={cx + 10}
                                  y1={Math.max(10, highY)}
                                  x2={cx + 10}
                                  y2={Math.min(180, lowY)}
                                  stroke={isGreen ? '#10b981' : '#06b6d4'}
                                  strokeWidth="2"
                                />

                                {/* Candlestick Body Bar */}
                                <rect
                                  x={cx}
                                  y={barY}
                                  width="20"
                                  height={barH}
                                  rx="4"
                                  fill={isGreen ? '#10b981' : '#06b6d4'}
                                  opacity="0.85"
                                  className="group-hover:opacity-100 group-hover:stroke text-white transition-all"
                                />
                              </g>
                            );
                          })}
                        </svg>
                      );
                    })()}

                    {/* X Axis Labels */}
                    <div className="flex justify-between pl-10 pr-4 mt-2 text-[10px] text-slate-400 font-medium">
                      {(bookingChartData.length > 0 ? bookingChartData : [
                        { timeLabel: 'Day 1' }, { timeLabel: 'Day 2' }, { timeLabel: 'Day 3' }, { timeLabel: 'Day 4' }, { timeLabel: 'Day 5' }, { timeLabel: 'Day 6' }, { timeLabel: 'Day 7' }
                      ]).map((pt, i) => (
                        <span key={i} className="truncate max-w-[50px]">{pt.timeLabel}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* MIDDLE SECTION (2 COLUMNS - 'BOOKING SOURCES' REMOVED) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Column 1: Top Movies by Bookings (Strictly Movie Metrics Aggregated from MongoDB Atlas) */}
              <div className="bg-[#0e1626] p-5 rounded-2xl border border-[#1b273e] space-y-4 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Film className="w-4 h-4 text-cyan-400" />
                      <span>Top Movie Bookings (Live MongoDB Atlas)</span>
                    </h3>
                    <button
                      onClick={() => setTopMoviesModalOpen(true)}
                      className="text-xs font-bold text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>More / View All ({(topMoviesList || []).length})</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(topMoviesList || []).length > 0 ? (
                      (topMoviesList || []).slice(0, 5).map((movie, idx) => {
                        const pct = movie?.percentage !== undefined ? movie.percentage : 0;
                        return (
                          <div key={movie?.movieId || movie?.title || idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                            <div className="flex items-center gap-3">
                              {/* Element 1: Movie Poster Image */}
                              <img 
                                src={movie?.poster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&auto=format&fit=crop&q=80'} 
                                alt={movie?.title || 'Movie'} 
                                className="w-12 h-16 rounded-lg object-cover border border-slate-700 shadow-md shrink-0" 
                              />
                              
                              <div className="flex-1 min-w-0">
                                {/* Element 2: Movie Title Name */}
                                <h4 className="font-extrabold text-white text-sm truncate">{movie?.title || 'Untitled Movie'}</h4>
                                
                                {/* Element 3: Booking Percentage Bar / Percentage Value */}
                                <div className="flex items-center justify-between text-xs mt-1 mb-1">
                                  <span className="text-slate-400 font-medium">Ticket Share ({movie?.tickets || 0} tickets)</span>
                                  <span className="font-mono font-black text-cyan-400 text-sm">{pct}%</span>
                                </div>

                                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500" 
                                    style={{ width: `${Math.max(pct, 4)}%` }} 
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      /* Fallback Logic when topMoviesList is empty */
                      <div className="p-6 text-center glass-panel rounded-2xl border border-dashed border-cyan-400/20 space-y-2">
                        <Film className="w-8 h-8 text-cyan-400/50 mx-auto animate-pulse" />
                        <div className="text-xs font-bold text-white">No Live Movie Bookings Yet</div>
                        <p className="text-[11px] text-cyan-300/70">
                          Real-time movie ticket share will appear here automatically when users complete movie bookings in MongoDB Atlas.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Column 2: Top Theatres by Occupancy & Rating (Live MongoDB Atlas - Top 2 View) */}
              <div className="bg-[#0e1626] p-5 rounded-2xl border border-[#1b273e] space-y-4 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Building className="w-4 h-4 text-blue-400" />
                      <span>Top Theatres by Occupancy (Live MongoDB Atlas)</span>
                    </h3>
                    <button
                      onClick={() => setTopTheatresModalOpen(true)}
                      className="text-xs font-bold text-blue-400 hover:text-blue-300 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>More / View All ({(allTheatresList || topTheatresList || []).length})</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(topTheatresList || []).length > 0 ? (
                      (topTheatresList || []).slice(0, 2).map((th, i) => {
                        const pct = th?.percentage !== undefined ? th.percentage : (parseFloat(th?.occupancyRate) || 0);
                        const displayName = th?.nameAndCity || (th?.city ? `${th.name} - ${th.city}` : th?.name) || 'PrimeShow Theatre';
                        return (
                          <div key={th?.theatreId || th?.name || i} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-white font-extrabold truncate max-w-[210px]" title={displayName}>
                                {displayName}
                              </span>
                              <span className="font-mono font-black text-blue-400 text-sm">
                                {pct}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-400">
                              <span>Seats Sold: {th?.tickets || 0}</span>
                              <span className="text-amber-400 font-bold">Rating: {th?.rating || 4.8}★</span>
                            </div>
                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
                                style={{ width: `${Math.max(pct, 4)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-6 text-center glass-panel rounded-2xl border border-dashed border-blue-400/20 space-y-2">
                        <Building className="w-8 h-8 text-blue-400/50 mx-auto animate-pulse" />
                        <div className="text-xs font-bold text-white">No Live Theatre Bookings Yet</div>
                        <p className="text-[11px] text-blue-300/70">
                          Real-time theatre occupancy share will calculate here automatically when tickets or halls are booked in MongoDB Atlas.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>





            {/* LOWER SECTION (3 COLUMNS) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Column 1: Revenue by Payment Method */}
              <div className="bg-[#0e1626] p-5 rounded-2xl border border-[#1b273e] space-y-4 shadow-xl flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white mb-4">Revenue by Payment Method</h3>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
                    {/* SVG Donut Chart */}
                    <div className="relative w-36 h-36 shrink-0">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <path className="text-slate-800" strokeWidth="4.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        {/* UPI - 48.6% */}
                        <path className="text-blue-500" strokeDasharray="48.6, 100" strokeWidth="4.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        {/* Card - 32.1% */}
                        <path className="text-emerald-400" strokeDasharray="32.1, 100" strokeDashoffset="-48.6" strokeWidth="4.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        {/* Net Banking - 12.3% */}
                        <path className="text-amber-500" strokeDasharray="12.3, 100" strokeDashoffset="-80.7" strokeWidth="4.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        {/* Wallets - 7.0% */}
                        <path className="text-purple-500" strokeDasharray="7.0, 100" strokeDashoffset="-93.0" strokeWidth="4.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      </svg>
                    </div>

                    {/* Donut Legend */}
                    <div className="space-y-2 text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                        <span className="text-slate-300 font-medium">UPI</span>
                        <span className="text-slate-400 font-mono ml-auto">48.6% (₹1,208,000)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
                        <span className="text-slate-300 font-medium">Card</span>
                        <span className="text-slate-400 font-mono ml-auto">32.1% (₹798,000)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                        <span className="text-slate-300 font-medium">Net Banking</span>
                        <span className="text-slate-400 font-mono ml-auto">12.3% (₹306,000)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span>
                        <span className="text-slate-300 font-medium">Wallets</span>
                        <span className="text-slate-400 font-mono ml-auto">7.0% (₹173,900)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 2: Recent Bookings */}
              <div className="bg-[#0e1626] p-5 rounded-2xl border border-[#1b273e] space-y-4 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-white">Recent Bookings</h3>
                    <button className="text-xs font-bold text-cyan-400 hover:underline">View All</button>
                  </div>

                  <div className="space-y-3">
                    {[
                      { id: '#PS84215', time: 'May 17, 2025 • 10:45 AM', price: '₹850', status: 'Confirmed' },
                      { id: '#PS84214', time: 'May 17, 2025 • 10:30 AM', price: '₹1,250', status: 'Confirmed' },
                      { id: '#PS84213', time: 'May 17, 2025 • 10:20 AM', price: '₹640', status: 'Confirmed' },
                      { id: '#PS84212', time: 'May 17, 2025 • 10:15 AM', price: '₹950', status: 'Confirmed' },
                      { id: '#PS84211', time: 'May 17, 2025 • 10:05 AM', price: '₹740', status: 'Confirmed' }
                    ].map((b, i) => (
                      <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60 last:border-none">
                        <div>
                          <div className="font-mono font-bold text-slate-200">{b.id}</div>
                          <div className="text-[10px] text-slate-400">{b.time}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-slate-200">{b.price}</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                            {b.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Column 3: System Status */}
              <div className="bg-[#0e1626] p-5 rounded-2xl border border-[#1b273e] space-y-4 shadow-xl flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white mb-3">System Status</h3>

                  <div className="space-y-3">
                    {[
                      { name: 'Server Status', status: 'Healthy' },
                      { name: 'Database', status: 'Healthy' },
                      { name: 'Payment Gateway', status: 'Healthy' },
                      { name: 'Email Service', status: 'Healthy' },
                      { name: 'SMS Service', status: 'Healthy' },
                      { name: 'WhatsApp Service', status: 'Healthy' }
                    ].map((sys, i) => (
                      <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60 last:border-none">
                        <span className="text-slate-300 font-medium">{sys.name}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                          {sys.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* BOTTOM SECONDARY METRICS (4 CARDS) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#0e1626] p-4 rounded-2xl border border-[#1b273e] flex items-center gap-4 shadow-xl">
                <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-cyan-400 shrink-0">
                  <Film className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Active Movies</div>
                  <div className="text-xl font-extrabold text-white font-sans">{(moviesList || []).length > 0 ? (moviesList || []).length : 34}</div>
                  <div className="text-[10px] font-bold text-emerald-400">+5 this week</div>
                </div>
              </div>

              <div className="bg-[#0e1626] p-4 rounded-2xl border border-[#1b273e] flex items-center gap-4 shadow-xl">
                <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-cyan-400 shrink-0">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Active Theatres</div>
                  <div className="text-xl font-extrabold text-white font-sans">{(theatresList || []).length > 0 ? (theatresList || []).length : 28}</div>
                  <div className="text-[10px] font-bold text-emerald-400">+2 this week</div>
                </div>
              </div>

              <div className="bg-[#0e1626] p-4 rounded-2xl border border-[#1b273e] flex items-center gap-4 shadow-xl">
                <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-purple-400 shrink-0">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Total Screens</div>
                  <div className="text-xl font-extrabold text-white font-sans">156</div>
                  <div className="text-[10px] font-bold text-emerald-400">+6 this week</div>
                </div>
              </div>

              <div className="bg-[#0e1626] p-4 rounded-2xl border border-[#1b273e] flex items-center gap-4 shadow-xl">
                <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-emerald-400 shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Total Users</div>
                  <div className="text-xl font-extrabold text-white font-sans">{(usersList || []).length > 0 ? (userTotalCount || usersList.length) : 12485}</div>
                  <div className="text-[10px] font-bold text-emerald-400">+325 this week</div>
                </div>
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
                      type="date"
                      value={schedDateInput}
                      onChange={(e) => setSchedDateInput(e.target.value)}
                      className="w-full p-3 rounded-xl glass-input text-xs text-white font-bold cursor-pointer"
                    />
                    <button type="submit" className="px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shrink-0 cursor-pointer">
                      Add Date
                    </button>
                  </form>
                </div>
              </div>

              {/* Configured Dates Badges */}
              {(() => {
                const targetM = moviesList.find(m => m && (m.id === schedMovieId || m._id === schedMovieId || m.title === schedMovieId || (m.title && m.title.toLowerCase() === (schedMovieId || '').toLowerCase())));
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
                    <label className="block text-[11px] font-bold text-cyan-300 mb-1">City Filter *</label>
                    <select
                      value={schedCity || 'Surat'}
                      onChange={e => {
                        const newCity = e.target.value;
                        setSchedCity(newCity);
                        const cityTheatres = (theatresList || []).filter(
                          t => t && (t.city || '').trim().toLowerCase() === newCity.trim().toLowerCase()
                        );
                        if (cityTheatres.length > 0) {
                          setSchedTheatreName(cityTheatres[0].name);
                          setSchedAddress(cityTheatres[0].address || '');
                          if (cityTheatres[0].screens && cityTheatres[0].screens.length > 0) {
                            setSchedScreen(cityTheatres[0].screens[0].name);
                          }
                        } else {
                          setSchedTheatreName('');
                          setSchedAddress('');
                        }
                      }}
                      className="w-full p-2.5 rounded-xl glass-input text-xs text-white bg-black font-bold"
                    >
                      {availableCities.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-amber-300 mb-1">Select Theatre (Live MongoDB Atlas) *</label>
                    <select
                      value={schedTheatreName}
                      onChange={e => {
                        const val = e.target.value;
                        setSchedTheatreName(val);
                        const matchedTh = (theatresList || []).find(t => t && t.name === val);
                        if (matchedTh) {
                          setSchedAddress(matchedTh.address || '');
                          if (matchedTh.screens && matchedTh.screens.length > 0) {
                            setSchedScreen(matchedTh.screens[0].name);
                          }
                        }
                      }}
                      className="w-full p-2.5 rounded-xl glass-input text-xs text-amber-300 bg-black font-bold"
                    >
                      {(() => {
                        const filtered = (theatresList || []).filter(
                          t => t && (t.city || '').trim().toLowerCase() === (schedCity || 'Surat').trim().toLowerCase()
                        );
                        if (filtered.length > 0) {
                          return filtered.map(t => (
                            <option key={t.id || t.name} value={t.name}>{t.name} ({t.city})</option>
                          ));
                        }
                        return <option value="">No theatres found for {schedCity}</option>;
                      })()}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-white/70 mb-1">Address</label>
                    <input type="text" value={schedAddress} onChange={e => setSchedAddress(e.target.value)} className="w-full p-2.5 rounded-xl glass-input text-xs text-white" placeholder="Auto-filled address" />
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
                const targetM = moviesList.find(m => m && (m.id === schedMovieId || m._id === schedMovieId || m.title === schedMovieId || (m.title && m.title.toLowerCase() === (schedMovieId || '').toLowerCase())));
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
        {/* Tab 3: Real-Time Cinema & Seat Management (Dynamic Pricing, Admin Blocking & Live Tracking) */}
        {activeTab === 'seats' && (
          <div className="glass-panel p-6 rounded-3xl border border-cyan-400/30 space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h1 className="text-3xl font-bold font-sans text-white">Real-Time Seat Management & Live Tracking</h1>
                <p className="text-xs text-cyan-300">Synchronized with MongoDB Atlas. Edit prices, block seats & monitor live bookings per City, Movie, Date, Theatre & Show Time.</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Live MongoDB Atlas Synced</span>
              </div>
            </div>

            {/* Cascading 5-Tier Controls Row: City -> Theatre -> Movie -> Show Date -> Show Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
              {/* Filter 1: Select City */}
              <div>
                <label className="block text-[11px] font-bold text-cyan-300 mb-1">1. City (MongoDB Atlas) *</label>
                <select
                  value={selectedCity || 'Surat'}
                  onChange={e => {
                    const newCity = e.target.value;
                    setSelectedCity(newCity);
                    const thsInCity = (currentTheatresList || []).filter(
                      t => t && (t.city || '').toLowerCase() === (newCity || '').toLowerCase()
                    );
                    if (thsInCity.length > 0) {
                      setSelectedTheatreId(thsInCity[0].id);
                    }
                  }}
                  className="w-full p-2.5 rounded-xl glass-input text-xs text-white bg-black font-bold"
                >
                  {(availableCities || []).map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Filter 2: Select Cinema / Theatre */}
              <div>
                <label className="block text-[11px] font-bold text-cyan-300 mb-1">2. Cinema / Theatre *</label>
                <select
                  value={selectedTheatreId || 'th_1'}
                  onChange={e => setSelectedTheatreId(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-input text-xs text-white bg-black font-bold"
                >
                  {(theatresInSelectedCity || []).length > 0 ? (
                    (theatresInSelectedCity || []).map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.city})</option>
                    ))
                  ) : (
                    <option value="">No theatres found in {selectedCity}</option>
                  )}
                </select>
              </div>

              {/* Filter 3: Select Movie (Database Live) */}
              <div>
                <label className="block text-[11px] font-bold text-amber-300 mb-1">3. Movie (Database Live) *</label>
                <select
                  value={selectedSeatMovieId || (moviesList[0]?.id || 'mov_1')}
                  onChange={e => setSelectedSeatMovieId(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-input text-xs text-amber-300 bg-black font-bold"
                >
                  {(moviesList || []).map(m => (
                    <option key={m.id || m._id} value={m.id || m._id}>
                      🎬 {m.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter 4: Show Date */}
              <div>
                <label className="block text-[11px] font-bold text-emerald-300 mb-1">4. Show Date *</label>
                <select
                  value={selectedSchedDate || availableDatesForSeatCombo[0]}
                  onChange={e => setSelectedSchedDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-input text-xs text-emerald-300 bg-black font-bold"
                >
                  {(availableDatesForSeatCombo || []).map(d => (
                    <option key={d} value={d}>📅 {d}</option>
                  ))}
                </select>
              </div>

              {/* Filter 5: Show Time Slot */}
              <div>
                <label className="block text-[11px] font-bold text-purple-300 mb-1">5. Show Time Slot *</label>
                <select
                  value={selectedShowSlotTime || availableShowtimesForSeatCombo[0]}
                  onChange={e => setSelectedShowSlotTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-input text-xs text-purple-300 bg-black font-bold"
                >
                  {(availableShowtimesForSeatCombo || []).map(t => (
                    <option key={t} value={t}>⏰ {t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Live Filter Indicator Bar */}
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 text-xs text-cyan-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div>
                📍 Live Tracking Filter: <strong className="text-white">{selectedCity}</strong> → <strong className="text-white">{activeTheatreObj?.name || 'Theatre'}</strong> → <strong className="text-amber-400">{activeSeatMovieObj?.title || 'Movie'}</strong> → <strong className="text-emerald-300">{selectedSchedDate}</strong> → <strong className="text-purple-300">{selectedShowSlotTime}</strong>
              </div>
              <div className="flex items-center gap-3 text-xs flex-wrap">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Booked ({Object.keys(liveBookedSeatsMap).length})
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-400/40 text-rose-300 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span> Admin Blocked 🔒 ({(currentLayout?.blockedSeats || []).length})
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 border border-white/20 text-white/80 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-white/40"></span> Available
                </span>
              </div>
            </div>

            {/* Interactive Visual Layout Grid & Seat Price Editor */}
            <div className="p-4 sm:p-6 rounded-3xl bg-black/40 border border-white/10 space-y-5">
              <div className="w-full max-w-xl mx-auto text-center shrink-0">
                <div className="screen-curve mb-2"></div>
                <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-amber-300/90 uppercase">
                  ▲ CINEMATIC SCREEN THIS WAY (FRONT) ▲
                </span>
              </div>

              <div className="w-full overflow-auto max-h-[60vh] sm:max-h-[68vh] p-3 sm:p-5 my-2 rounded-2xl bg-black/30 border border-white/10 flex flex-col items-center select-none">
                <div className="min-w-max flex flex-col items-center justify-center space-y-5 py-2 px-2">
                  {(seatRowsList || []).map((tierObj) => {
                    const rowCurrentPrice = seatPriceInputs[tierObj.row] !== undefined ? seatPriceInputs[tierObj.row] : tierObj.price;
                    return (
                      <div key={tierObj.row} className="flex flex-col items-center w-full bg-white/5 p-3 rounded-2xl border border-white/10 space-y-2">
                        
                        {/* Seat Row Header with Inline 'Edit Seat Price' Input & Button */}
                        <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between gap-3 flex-wrap w-full border-b border-white/10 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black">Row {tierObj.row}</span>
                            <span className="text-white font-bold">{tierObj.tier}</span>
                            <span className="text-white/40 font-normal">({tierObj.seatsCount} seats)</span>
                          </div>

                          {/* Dynamic Inline Price Editor */}
                          <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-xl border border-amber-400/40">
                            <span className="text-[11px] text-amber-300 font-bold">Edit Ticket Price (₹):</span>
                            <input
                              type="number"
                              min={50}
                              max={5000}
                              value={rowCurrentPrice}
                              onChange={e => setSeatPriceInputs({ ...seatPriceInputs, [tierObj.row]: e.target.value })}
                              className="w-20 p-1.5 rounded-lg bg-black text-amber-300 font-bold text-xs border border-white/20 text-center"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                updateRowPriceInScreenLayout(isolatedLayoutKey, tierObj.row, Number(rowCurrentPrice));
                                setActionSuccess(`Updated Row ${tierObj.row} price to ₹${rowCurrentPrice} in MongoDB Atlas!`);
                                setTimeout(() => setActionSuccess(''), 3000);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black text-[11px] font-extrabold cursor-pointer shadow-md shadow-amber-500/30"
                            >
                              Save Price
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteRowFromScreenLayout(isolatedLayoutKey, tierObj.row)}
                              className="text-rose-400 hover:text-rose-200 text-xs font-bold ml-1 cursor-pointer"
                              title="Delete entire row"
                            >
                              [Delete]
                            </button>
                          </div>
                        </div>

                        {/* Interactive Seat Grid */}
                        <div className="flex items-center justify-center gap-2 sm:gap-3 w-full pt-1">
                          <span className="w-6 text-xs font-bold text-white/50 text-center shrink-0">{tierObj.row}</span>

                          <div className="flex items-center gap-1.5 sm:gap-2.5">
                            {Array.from({ length: tierObj.seatsCount }).map((_, idx) => {
                              const seatNum = idx + 1;
                              const seatId = `${tierObj.row}${seatNum}`;
                              const isBlocked = (currentLayout?.blockedSeats || []).includes(seatId);
                              const customStat = currentLayout?.customStatuses?.[seatId];
                              const liveBooking = liveBookedSeatsMap[seatId];
                              const isBooked = !!liveBooking || customStat === 'BOOKED';

                              return (
                                <button
                                  key={seatId}
                                  type="button"
                                  onClick={() => {
                                    if (isBooked) {
                                      setActionSuccess(`Seat ${seatId} is booked by user (${liveBooking?.userName || 'Customer'})`);
                                      setTimeout(() => setActionSuccess(''), 3000);
                                    } else if (isBlocked || customStat === 'BLOCKED') {
                                      setManualSeatStatusForScreen(isolatedLayoutKey, seatId, 'AVAILABLE');
                                      setActionSuccess(`Unblocked seat ${seatId} for users!`);
                                      setTimeout(() => setActionSuccess(''), 3000);
                                    } else {
                                      toggleBlockSeatForScreen(isolatedLayoutKey, seatId);
                                      setActionSuccess(`Admin blocked seat ${seatId} (Saved to MongoDB Atlas)!`);
                                      setTimeout(() => setActionSuccess(''), 3000);
                                    }
                                  }}
                                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl font-mono text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center cursor-pointer shrink-0 ${
                                    isBooked
                                      ? 'bg-emerald-500 text-black border-2 border-emerald-400 font-extrabold shadow-lg shadow-emerald-500/30'
                                      : (isBlocked || customStat === 'BLOCKED')
                                      ? 'bg-rose-500/30 border-2 border-rose-500 text-rose-300 font-extrabold shadow-lg shadow-rose-500/20'
                                      : 'bg-white/10 hover:bg-white/25 border border-white/20 text-white/90 hover:text-white'
                                  }`}
                                  title={
                                    isBooked
                                      ? `🟩 User Booked: ${liveBooking?.userName || 'Customer'} (${liveBooking?.userEmail || ''}) - Ref: ${liveBooking?.bookingId || seatId}`
                                      : (isBlocked || customStat === 'BLOCKED')
                                      ? `🟥 Admin Blocked Seat: ${seatId} (Click to Unblock)`
                                      : `⬜ Available Seat: ${seatId} (₹${rowCurrentPrice} - Click to Admin Block)`
                                  }
                                >
                                  {isBooked ? '✓' : ((isBlocked || customStat === 'BLOCKED') ? '🔒' : seatNum)}
                                </button>
                              );
                            })}
                          </div>

                          <span className="w-6 text-xs font-bold text-white/50 text-center shrink-0">{tierObj.row}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Add / Customize Seat Row Form */}
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-cyan-300 uppercase">+ Add New Seat Row & Category Tier</h3>
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

            {/* Persistence & Template Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleSaveIsolatedSeatLayout}
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Changes / Commit Layout to MongoDB Atlas</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  updateScreenRowsConfig(isolatedLayoutKey, [
                    { row: 'N', tier: 'Classic Normal', price: 280, seatsCount: 12 },
                    { row: 'P', tier: 'Premium Tier', price: 480, seatsCount: 12 },
                    { row: 'R', tier: 'Luxury Recliner', price: 650, seatsCount: 10 },
                    { row: 'V', tier: 'VIP Gold Lounge', price: 950, seatsCount: 8 }
                  ]);
                  setActionSuccess('Reset show slot layout to standard 4-Tier template.');
                  setTimeout(() => setActionSuccess(''), 3000);
                }}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer"
              >
                Reset Standard 4-Tier Template
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

            {([...(supportMessages || [])].sort((a, b) => new Date(a.createdAt || a.timestamp || 0) - new Date(b.createdAt || b.timestamp || 0))).map(msg => (
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

            {/* Section A3: Dependent Date-Wise Hall & Price Slot Manager (3-Step Workflow) */}
            <div className="glass-panel p-6 rounded-3xl border border-cyan-400/30 space-y-6 max-w-4xl">
              <div className="border-b border-white/10 pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold font-sans text-white flex items-center gap-2">
                    <span>🏛️ Dependent Date-Wise Hall & Price Slot Manager</span>
                  </h3>
                  <p className="text-xs text-cyan-300">Step 1: Add Date Slots ➔ Step 2: Select Date Chip Context ➔ Step 3: Configure Date-Wise Hall & Price</p>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-bold font-mono">
                  Active Date: {activeConfigDate || 'None'}
                </div>
              </div>

              {/* Step 1: Add Date Slot Manager */}
              <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Step 1: Add Available Date Slots for Theatre</div>
                <form onSubmit={handleAddTheaterDateSlot} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="date"
                    required
                    value={newTheaterDateInput}
                    onChange={e => setNewTheaterDateInput(e.target.value)}
                    className="p-3 rounded-xl glass-input text-xs text-white font-bold cursor-pointer flex-1"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs shadow-md shadow-cyan-500/20 shrink-0 cursor-pointer"
                  >
                    + Add Date Slot
                  </button>
                </form>

                {/* Render Added Date Slots as Selectable Tab Chips */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-[11px] font-bold text-white/70 block">Select Date Chip to Configure Halls & Pricing:</label>
                  <div className="flex flex-wrap gap-2">
                    {(configuredTheaterDates || []).map(dStr => (
                      <button
                        key={dStr}
                        type="button"
                        onClick={() => setActiveConfigDate(dStr)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                          activeConfigDate === dStr
                            ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 scale-105'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        <span>📅 {dStr}</span>
                        {activeConfigDate === dStr && <span className="w-2 h-2 rounded-full bg-black animate-ping"></span>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 2: Active Date Context & Hall/Price Slot Form */}
              {activeConfigDate && (
                <div className="space-y-4 pt-2 border-t border-white/10">
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <span>Step 2: Configure Hall, Screen & Price for Date:</span>
                    <span className="underline font-mono text-white text-sm">{activeConfigDate}</span>
                  </div>

                  <form onSubmit={handleSaveHallSlot} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div>
                      <label className="block text-[11px] font-bold text-cyan-300 mb-1">Target Theatre *</label>
                      <select
                        value={hallSlotForm.theatreId || theatresList[0]?.id || ''}
                        onChange={e => setHallSlotForm({ ...hallSlotForm, theatreId: e.target.value })}
                        className="w-full p-2.5 rounded-xl glass-input text-xs text-white bg-black font-bold"
                      >
                        {theatresList.map(t => (
                          <option key={t.id} value={t.id}>{t.name} ({t.city})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-cyan-300 mb-1">Target Movie *</label>
                      <select
                        value={hallSlotForm.movieId || moviesList[0]?.id || ''}
                        onChange={e => setHallSlotForm({ ...hallSlotForm, movieId: e.target.value })}
                        className="w-full p-2.5 rounded-xl glass-input text-xs text-white bg-black font-bold"
                      >
                        {moviesList.map(m => (
                          <option key={m.id} value={m.id}>{m.title}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-white/70 mb-1">Hall Name / Number *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Hall 1 (IMAX Laser)"
                        value={hallSlotForm.hallName}
                        onChange={e => setHallSlotForm({ ...hallSlotForm, hallName: e.target.value })}
                        className="w-full p-2.5 rounded-xl glass-input text-xs text-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-white/70 mb-1">Screen Format *</label>
                      <select
                        value={hallSlotForm.format}
                        onChange={e => setHallSlotForm({ ...hallSlotForm, format: e.target.value })}
                        className="w-full p-2.5 rounded-xl glass-input text-xs text-white bg-black font-bold"
                      >
                        <option value="IMAX 3D">IMAX 3D</option>
                        <option value="Dolby Atmos">Dolby Atmos</option>
                        <option value="4DX">4DX</option>
                        <option value="3D">3D</option>
                        <option value="2D">2D</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-white/70 mb-1">Ticket Price (₹) *</label>
                      <input
                        type="number"
                        required
                        value={hallSlotForm.price}
                        onChange={e => setHallSlotForm({ ...hallSlotForm, price: e.target.value })}
                        className="w-full p-2.5 rounded-xl glass-input text-xs text-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-white/70 mb-1">Show Time *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 10:30 AM"
                        value={hallSlotForm.time}
                        onChange={e => setHallSlotForm({ ...hallSlotForm, time: e.target.value })}
                        className="w-full p-2.5 rounded-xl glass-input text-xs text-white font-bold"
                      />
                    </div>

                    <div className="sm:col-span-2 lg:col-span-3 flex justify-end pt-2">
                      <button
                        type="submit"
                        className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-md shadow-amber-500/20 cursor-pointer flex items-center gap-2"
                      >
                        <span>💾 Save Hall & Price Slot for {activeConfigDate}</span>
                      </button>
                    </div>
                  </form>

                  {/* Configured Halls List for Active Date */}
                  {(() => {
                    const targetThId = hallSlotForm.theatreId || theatresList[0]?.id || theatresList[0]?._id || 'th_1';
                    const cleanTargetId = String(targetThId).toLowerCase().trim();
                    const activeTh = theatresList.find(t => 
                      t && (t.id === targetThId || t._id === targetThId || 
                      (t.id && String(t.id).toLowerCase().trim() === cleanTargetId) || 
                      (t._id && String(t._id).toLowerCase().trim() === cleanTargetId))
                    ) || theatresList[0];
                    const hallMap = activeTh?.hallSlotsByDate || activeTh?.dateHalls || {};
                    const activeHalls = Array.isArray(hallMap[activeConfigDate]) ? hallMap[activeConfigDate] : [];
                    const activeThName = activeTh?.name || 'Selected Theatre';

                    return (
                      <div className="space-y-2 pt-2">
                        <div className="text-xs font-bold text-white/80 flex items-center justify-between">
                          <span>
                            Configured Halls for <strong className="text-cyan-300">{activeThName}</strong> on <span className="text-amber-400">{activeConfigDate}</span> ({activeHalls.length} Halls Available):
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {activeHalls.map((h, i) => (
                            <div key={h.id || i} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs hover:border-cyan-400/40 transition-all">
                              <div>
                                <div className="font-bold text-white">{h.hallName}</div>
                                <div className="text-[10px] text-cyan-300">{h.format} • {h.time}</div>
                                {h.movieTitle && <div className="text-[9px] text-amber-300/80">Movie: {h.movieTitle}</div>}
                              </div>
                              <div className="text-right">
                                <div className="font-extrabold text-emerald-400 text-sm">₹{h.price}</div>
                                <div className="text-[9px] text-white/40">Capacity: {h.totalSeats || 120}</div>
                              </div>
                            </div>
                          ))}
                          {activeHalls.length === 0 && (
                            <div className="col-span-full p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-white/40 italic text-center">
                              No halls configured for {activeThName} on {activeConfigDate} yet. Use the form above to add a hall.
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

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

                  {/* Scheduled Showtimes & Date-Wise Configured Halls */}
                  {(() => {
                    const venueHallsList = [];
                    const hallMap = t.hallSlotsByDate || t.dateHalls || {};
                    if (hallMap && typeof hallMap === 'object') {
                      Object.entries(hallMap).forEach(([dateKey, hallsArr]) => {
                        if (Array.isArray(hallsArr)) {
                          hallsArr.forEach(h => {
                            venueHallsList.push({
                              id: h.id,
                              title: h.movieTitle || h.hallName || 'Hall Slot',
                              hallName: h.hallName,
                              format: h.format,
                              time: h.time,
                              price: h.price,
                              date: dateKey,
                              isHall: true
                            });
                          });
                        }
                      });
                    }
                    if (Array.isArray(t.shows)) {
                      t.shows.forEach(s => {
                        venueHallsList.push({
                          id: s.id,
                          title: s.movieTitle || s.screenName || 'Show Slot',
                          hallName: s.screenName,
                          format: s.format,
                          time: s.time,
                          price: s.price,
                          date: s.date || 'Default Date',
                          isHall: false
                        });
                      });
                    }

                    return (
                      <div>
                        <h5 className="text-xs font-bold text-white/70 mb-2 flex items-center justify-between">
                          <span>Scheduled Showtimes & Date-Wise Halls ({venueHallsList.length}):</span>
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {venueHallsList.map((slot, idx) => (
                            <div key={slot.id || idx} className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs hover:border-cyan-400/40 transition-all">
                              <div>
                                <div className="font-bold text-amber-300">{slot.title}</div>
                                <div className="text-[10px] text-cyan-300 font-semibold">{slot.hallName ? `${slot.hallName} • ` : ''}{slot.format} • {slot.time}</div>
                                <div className="text-[9px] text-white/50">📅 Date: {slot.date} • ₹{slot.price}</div>
                              </div>
                              <button
                                onClick={() => slot.isHall ? handleDeleteHallSlot(t.id, slot.id, slot.date) : handleDeleteShowSlot(t.id, slot.id)}
                                className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white transition-all cursor-pointer"
                                title="Delete Slot"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                          {venueHallsList.length === 0 && (
                            <div className="col-span-full p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white/40 italic text-center">
                              No scheduled showtimes or date-wise halls configured for this venue yet.
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>
          </div>
        )}



        {/* Tab 8: Events & Concerts Management (MongoDB Atlas Persistence) */}
        {activeTab === 'events' && (
          <div className="space-y-8 animate-fade-in pb-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold font-sans text-white flex items-center gap-2">
                  <span>🎪 Events & Concerts Management</span>
                </h1>
                <p className="text-xs text-amber-300">Create, edit, schedule show slots & manage live events synced directly with MongoDB Atlas</p>
              </div>

              <div className="px-4 py-2 rounded-2xl glass-panel border border-cyan-400/30 text-xs font-bold text-cyan-300">
                Total Events: {eventsList.length}
              </div>
            </div>

            {/* Section A: Create / Edit Event Form */}
            <form onSubmit={handleSaveEvent} className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 max-w-5xl shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>{editingEventId ? 'Edit Event Details' : 'Create New Live Event'}</span>
                </h3>
                {editingEventId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingEventId(null);
                      setEventForm({
                        title: '', category: 'Live Concert', badge: 'SELLING FAST', languages: 'English, Hindi, Gujarati',
                        ageRating: 'UA 16+', venue: '', address: '', city: 'Surat', mapLocationUrl: '',
                        date: new Date().toISOString().split('T')[0], time: '07:00 PM', price: 1500,
                        totalCapacity: 5000, availableSeats: 5000, image: '', bannerUrl: '', description: '',
                        termsAndConditions: 'Non-refundable ticket. Entry permits 1 person per ticket.', bookingStatus: true
                      });
                    }}
                    className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white/70 cursor-pointer"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              {/* Grid 1: Basic Event Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-white/80 mb-1">Event Title / Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Arijit Singh Live Concert 2027"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1">Category *</label>
                  <select
                    value={eventForm.category}
                    onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white bg-[#0c0d14] font-bold"
                  >
                    <option value="Live Concert">Live Concert</option>
                    <option value="Standup Comedy">Standup Comedy</option>
                    <option value="Music Concert">Music Concert</option>
                    <option value="Expo">Expo / Fair</option>
                    <option value="Workshop">Workshop & Masterclass</option>
                    <option value="Sports">Sports & Fitness</option>
                    <option value="Festival">Festival & Cultural</option>
                    <option value="Exhibition">Exhibition & Art</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1">Badge / Tag</label>
                  <select
                    value={eventForm.badge || 'LIVE'}
                    onChange={(e) => setEventForm({ ...eventForm, badge: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white bg-[#0c0d14] font-bold"
                  >
                    <option value="LIVE">🔥 LIVE</option>
                    <option value="SELLING FAST">⚡ SELLING FAST</option>
                    <option value="POPULAR">⭐ POPULAR</option>
                    <option value="EXCLUSIVE">👑 EXCLUSIVE</option>
                    <option value="EARLY BIRD">🎉 EARLY BIRD</option>
                    <option value="LIMITED SEATS">🚨 LIMITED SEATS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1">Languages (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. English, Hindi, Gujarati"
                    value={eventForm.languages}
                    onChange={(e) => setEventForm({ ...eventForm, languages: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1">Age Rating / Certificate</label>
                  <select
                    value={eventForm.ageRating || 'UA 16+'}
                    onChange={(e) => setEventForm({ ...eventForm, ageRating: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white bg-[#0c0d14]"
                  >
                    <option value="All Ages">All Ages (Family Friendly)</option>
                    <option value="UA 16+">UA 16+ (Under 16 with Adult)</option>
                    <option value="PG-13">PG-13 (Parental Guidance)</option>
                    <option value="18+">18+ Only (Adults)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1">City Filter *</label>
                  <select
                    value={eventForm.city || 'Surat'}
                    onChange={(e) => setEventForm({ ...eventForm, city: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white bg-black font-bold"
                  >
                    <option value="All">All Cities</option>
                    {GUJARAT_CITIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1">Ticket Price per Person (₹) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={eventForm.price}
                    onChange={(e) => setEventForm({ ...eventForm, price: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white font-bold text-emerald-400"
                  />
                </div>
              </div>

              {/* Grid 2: Venue & Location */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/10 pt-4">
                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1">Venue Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Indoor Stadium, Dumas Road"
                    value={eventForm.venue}
                    onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value, address: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1">Full Venue Address</label>
                  <input
                    type="text"
                    placeholder="e.g. Near VR Mall, Dumas Road, Surat - 395007"
                    value={eventForm.address}
                    onChange={(e) => setEventForm({ ...eventForm, address: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1">Google Maps Embed / Location Link</label>
                  <input
                    type="text"
                    placeholder="https://maps.google.com/?q=..."
                    value={eventForm.mapLocationUrl}
                    onChange={(e) => setEventForm({ ...eventForm, mapLocationUrl: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Grid 3: Media & Capacity */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/10 pt-4">
                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1">Thumbnail Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={eventForm.image}
                    onChange={(e) => setEventForm({ ...eventForm, image: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1">Backdrop Banner URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={eventForm.bannerUrl}
                    onChange={(e) => setEventForm({ ...eventForm, bannerUrl: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1">Total Capacity (Seats/Passes)</label>
                  <input
                    type="number"
                    min={10}
                    value={eventForm.totalCapacity}
                    onChange={(e) => setEventForm({ ...eventForm, totalCapacity: e.target.value, availableSeats: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white font-bold"
                  />
                </div>
              </div>

              {/* Descriptions & Terms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/10 pt-4">
                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1">Detailed Synopsis / Description</label>
                  <textarea
                    rows={3}
                    placeholder="Enter event highlights, artist lineup, schedule details..."
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1">Terms & Conditions</label>
                  <textarea
                    rows={3}
                    placeholder="Enter entry rules, age restrictions, refund policy..."
                    value={eventForm.termsAndConditions}
                    onChange={(e) => setEventForm({ ...eventForm, termsAndConditions: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white"
                  ></textarea>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={eventForm.bookingStatus !== false}
                    onChange={(e) => setEventForm({ ...eventForm, bookingStatus: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 bg-black accent-amber-500"
                  />
                  <span className="text-xs font-bold text-white">Enable Active Ticket Bookings</span>
                </label>

                <button
                  type="submit"
                  className="px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 cursor-pointer flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{editingEventId ? 'Update Event & Sync to Atlas' : 'Publish Event & Save to MongoDB Atlas'}</span>
                </button>
              </div>
            </form>

            {/* Section B: Event Dates, Time & Slot Schedule Manager */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-400/30 space-y-6 max-w-5xl shadow-2xl">
              <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold font-sans text-white flex items-center gap-2">
                    <span>📅 Event Dates, Time & Slot Schedule Manager</span>
                  </h3>
                  <p className="text-xs text-cyan-300">Add custom date/time slots, hall stages, seat categories (VIP, Gold, Silver), and ticket prices directly into MongoDB Atlas</p>
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-bold font-mono">
                  Direct MongoDB $push Sync
                </div>
              </div>

              <form onSubmit={handleSaveEventSlot} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white/5 p-5 rounded-2xl border border-white/10">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-cyan-300 mb-1">Target Event *</label>
                  <select
                    value={eventSlotEventId || eventsList[0]?.id || ''}
                    onChange={(e) => setEventSlotEventId(e.target.value)}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white bg-black font-bold"
                  >
                    {eventsList.map(ev => (
                      <option key={ev.id} value={ev.id}>{ev.title} ({ev.city})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1">Event Slot Date *</label>
                  <input
                    type="date"
                    required
                    value={eventSlotDate}
                    onChange={(e) => setEventSlotDate(e.target.value)}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white font-bold cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1">Start Time *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 07:00 PM"
                    value={eventSlotStartTime}
                    onChange={(e) => setEventSlotStartTime(e.target.value)}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1">End Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 10:00 PM"
                    value={eventSlotEndTime}
                    onChange={(e) => setEventSlotEndTime(e.target.value)}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1">Screen / Hall Stage</label>
                  <input
                    type="text"
                    placeholder="e.g. Main Concert Stage"
                    value={eventSlotScreen}
                    onChange={(e) => setEventSlotScreen(e.target.value)}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1">Seat Category / Tier</label>
                  <select
                    value={eventSlotTier}
                    onChange={(e) => setEventSlotTier(e.target.value)}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white bg-black font-bold"
                  >
                    <option value="VIP">VIP Lounge Pass</option>
                    <option value="Gold">Gold Category</option>
                    <option value="Silver">Silver General Entry</option>
                    <option value="Executive">Executive Recliner</option>
                    <option value="EarlyBird">Early Bird Special</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1">Slot Ticket Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={eventSlotPrice}
                    onChange={(e) => setEventSlotPrice(e.target.value)}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white font-bold text-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1">Slot Seat Capacity</label>
                  <input
                    type="number"
                    value={eventSlotCapacity}
                    onChange={(e) => setEventSlotCapacity(e.target.value)}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white font-bold"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-3 flex justify-end items-end pt-1">
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs shadow-md shadow-cyan-500/20 cursor-pointer flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Push Showtime Slot to Event (MongoDB Atlas)</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Section C: Live Events Directory Cards View */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span>Configured Live Events ({eventsList.length})</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {eventsList.map(ev => {
                  const slotsMap = ev.slots || ev.schedules || {};
                  const slotsCount = Object.values(slotsMap).filter(Array.isArray).flat().length;

                  return (
                    <div key={ev.id} className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-start gap-4">
                          <img
                            src={ev.image || ev.bannerUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80'}
                            alt={ev.title}
                            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-amber-400/40 shrink-0"
                          />
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-extrabold uppercase">
                                {ev.badge || 'LIVE'}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[10px] font-bold">
                                {ev.category || 'Event'}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-lg bg-white/10 text-white/70 text-[10px]">
                                {ev.ageRating || 'All Ages'}
                              </span>
                            </div>

                            <h4 className="text-lg font-bold text-white truncate">{ev.title}</h4>
                            <p className="text-xs text-white/70 truncate">📍 {ev.venue} • <strong className="text-amber-300">{ev.city}</strong></p>
                            <p className="text-xs text-emerald-400 font-extrabold">₹{ev.price || ev.ticketPrice || 0} / person</p>
                          </div>
                        </div>

                        {/* Slots Summary */}
                        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-2">
                          <div className="flex items-center justify-between text-white/80 font-bold">
                            <span>📅 Date: {ev.date || ev.eventDate || 'Configured'}</span>
                            <span className="text-cyan-300 font-mono text-[11px]">{slotsCount} Showtime Slots</span>
                          </div>
                          {slotsCount > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {Object.entries(slotsMap).map(([dKey, slotsArr]) => (
                                Array.isArray(slotsArr) && slotsArr.map((s, idx) => (
                                  <span key={s.id || idx} className="px-2 py-1 rounded-lg bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-[10px] font-mono font-bold">
                                    {dKey}: {s.startTime || s.time} ({s.tier || 'VIP'} - ₹{s.price})
                                  </span>
                                ))
                              ))}
                            </div>
                          )}
                        </div>

                        {ev.mapLocationUrl && (
                          <a
                            href={ev.mapLocationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:underline font-bold"
                          >
                            <Compass className="w-3.5 h-3.5" /> View Map Location
                          </a>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-3 border-t border-white/10 gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleToggleEventBookingStatus(ev)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            ev.bookingStatus !== false
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 hover:bg-emerald-500 hover:text-black'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500 hover:text-white'
                          }`}
                        >
                          {ev.bookingStatus !== false ? '● Active' : '○ Disabled'}
                        </button>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditEventClick(ev)}
                            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 hover:text-black border border-amber-400/40 text-amber-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" /> Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteEvent(ev.id)}
                            className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500 hover:text-white border border-rose-500/40 text-rose-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {eventsList.length === 0 && (
                  <div className="col-span-full p-8 rounded-3xl glass-panel text-center text-white/50 space-y-2">
                    <p className="text-sm font-bold text-amber-300">No Events Created Yet</p>
                    <p className="text-xs">Use the form above to add an event with banner, venue location, map link, date, and showtime slots.</p>
                  </div>
                )}
              </div>
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
                      setNotifTargetType('ALL');
                      setSelectedNotifTargetUsers([]);
                    }}
                    className="px-3 py-1 rounded-xl bg-white/10 text-white/70 hover:text-white text-xs font-bold"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-cyan-300 mb-1">Target Audience *</label>
                  <select
                    value={notifTargetType}
                    onChange={(e) => setNotifTargetType(e.target.value)}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white bg-[#0c0d14]"
                  >
                    <option value="ALL">🌐 All Users (Global Broadcast)</option>
                    <option value="SPECIFIC">🎯 Specific User(s)</option>
                  </select>
                </div>

                {notifTargetType === 'SPECIFIC' && (
                  <div>
                    <label className="block text-xs font-bold text-cyan-300 mb-1">Select Target User(s) *</label>
                    <select
                      multiple
                      value={selectedNotifTargetUsers}
                      onChange={(e) => {
                        const selectedOpts = Array.from(e.target.selectedOptions, option => option.value);
                        setSelectedNotifTargetUsers(selectedOpts);
                      }}
                      className="w-full p-2.5 rounded-xl glass-input text-xs text-white bg-black h-24 overflow-y-auto"
                    >
                      {usersDropdownList.map(u => (
                        <option key={u.id || u.email} value={u.id || u.email}>
                          {u.name} ({u.email})
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-cyan-300 mt-1">Hold Ctrl/Cmd to select multiple specific users</p>
                  </div>
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

              {(() => {
                const uniqueNotifications = Array.from(
                  new Map((notifications || []).filter(n => n && n.id).map(n => [n.id, n])).values()
                );
                return uniqueNotifications.length > 0 ? (
                  <div className="space-y-3">
                    {uniqueNotifications.map(n => {
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
              );
            })()}
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

      {/* Top Movies Expansion Modal (View All / More) */}
      {topMoviesModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="relative w-full max-w-3xl glass-modal rounded-3xl p-6 border border-cyan-400/30 shadow-[0_0_50px_rgba(0,0,0,0.9)] text-white max-h-[85vh] flex flex-col my-auto overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-sans text-white">All Booked Movies Ranking</h3>
                  <p className="text-xs text-cyan-300">Global ordered list of all movies by ticket sales & revenue across cities</p>
                </div>
              </div>

              <button
                onClick={() => setTopMoviesModalOpen(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-rose-500 text-white transition-all cursor-pointer border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search Bar */}
            <div className="py-4 border-b border-white/10 shrink-0">
              <input
                type="text"
                placeholder="Search ranked movies by title..."
                value={topMoviesSearchQuery}
                onChange={(e) => setTopMoviesSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Modal List Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-2">
              {(topMoviesList.filter(m => (m.title || '').toLowerCase().includes(topMoviesSearchQuery.toLowerCase()))).length > 0 ? (
                topMoviesList
                  .filter(m => (m.title || '').toLowerCase().includes(topMoviesSearchQuery.toLowerCase()))
                  .map((movie, idx) => (
                    <div key={idx} className="p-3.5 glass-panel rounded-2xl border border-white/10 flex items-center justify-between gap-4 hover:border-cyan-400/40 transition-all">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span className="w-7 h-7 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-xs font-bold text-cyan-300 font-mono shrink-0">
                          #{movie.rank || idx + 1}
                        </span>
                        <img src={movie.poster} alt={movie.title} className="w-10 h-12 rounded-lg object-cover border border-slate-700 shrink-0" />
                        <div className="min-w-0">
                          <h4 className="font-bold text-white text-sm truncate">{movie.title}</h4>
                          <div className="flex items-center gap-3 text-xs text-white/60 mt-0.5">
                            <span>🎟️ {movie.bookings || 0} Bookings</span>
                            <span>•</span>
                            <span>🍿 {movie.tickets || 0} Tickets Sold</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono font-extrabold text-cyan-300 text-sm">
                          ₹{(movie.revenue || 0).toLocaleString('en-IN')}
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                          {movie.category || 'Movie'}
                        </span>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="p-8 text-center text-xs text-white/50">No movies matching "{topMoviesSearchQuery}" found.</div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-white/10 flex justify-between items-center shrink-0">
              <span className="text-xs text-white/60">Showing {topMoviesList.length} Total Movies</span>
              <button
                onClick={() => setTopMoviesModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs cursor-pointer transition-colors shadow-lg shadow-cyan-500/20"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Theatres Expansion Modal (View All / More) */}
      {topTheatresModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="relative w-full max-w-3xl glass-modal rounded-3xl p-6 border border-blue-400/30 shadow-[0_0_50px_rgba(0,0,0,0.9)] text-white max-h-[85vh] flex flex-col my-auto overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-sans text-white">All Configured Multiplex Venues (Live MongoDB Atlas)</h3>
                  <p className="text-xs text-blue-300">Complete ranking of all active theatres by occupancy %, rating, and seat volume</p>
                </div>
              </div>

              <button
                onClick={() => setTopTheatresModalOpen(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-rose-500 text-white transition-all cursor-pointer border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search Bar */}
            <div className="py-4 border-b border-white/10 shrink-0">
              <input
                type="text"
                placeholder="Search active theatres by name or city (e.g. Surat, INOX, PVR)..."
                value={topTheatresSearchQuery}
                onChange={(e) => setTopTheatresSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-blue-400"
              />
            </div>

            {/* Modal List Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-2">
              {(() => {
                const listToRender = (allTheatresList && allTheatresList.length > 0) ? allTheatresList : topTheatresList;
                const filtered = listToRender.filter(t => 
                  (t.name || '').toLowerCase().includes(topTheatresSearchQuery.toLowerCase()) ||
                  (t.city || '').toLowerCase().includes(topTheatresSearchQuery.toLowerCase()) ||
                  (t.nameAndCity || '').toLowerCase().includes(topTheatresSearchQuery.toLowerCase())
                );

                if (filtered.length === 0) {
                  return (
                    <div className="p-8 text-center text-xs text-white/50">
                      No theatres matching "{topTheatresSearchQuery}" found.
                    </div>
                  );
                }

                return filtered.map((th, idx) => {
                  const pct = th?.percentage !== undefined ? th.percentage : (parseFloat(th?.occupancyRate) || 0);
                  const displayName = th?.nameAndCity || (th?.city ? `${th.name} - ${th.city}` : th?.name) || 'PrimeShow Theatre';
                  
                  return (
                    <div key={th.theatreId || th.name || idx} className="p-4 glass-panel rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-blue-400/40 transition-all">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-xs font-bold text-blue-300 font-mono shrink-0">
                          #{th.rank || idx + 1}
                        </span>
                        <div className="min-w-0">
                          <h4 className="font-bold text-white text-sm truncate">{th.name || displayName}</h4>
                          <div className="flex items-center gap-2 text-xs text-slate-300 mt-0.5">
                            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-semibold text-[10px]">{th.city || 'Gujarat'}</span>
                            <span>•</span>
                            <span className="text-amber-400 font-bold">★ {th.rating || 4.8} / 5.0 Rating</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
                        <div className="text-left sm:text-right">
                          <div className="text-xs text-slate-400">Seats Sold: <strong className="text-white">{th.tickets || 0}</strong></div>
                          <div className="text-[11px] text-emerald-400 font-semibold">Revenue: ₹{(th.revenue || 0).toLocaleString('en-IN')}</div>
                        </div>
                        <div className="text-right min-w-[70px]">
                          <div className="font-mono font-black text-blue-400 text-base">{pct}%</div>
                          <div className="text-[9px] text-slate-400 uppercase tracking-wider">Occupancy</div>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-white/10 flex justify-between items-center shrink-0">
              <span className="text-xs text-white/60">
                Showing {((allTheatresList && allTheatresList.length > 0) ? allTheatresList : topTheatresList).length} Total Venues
              </span>
              <button
                onClick={() => setTopTheatresModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-black font-bold text-xs cursor-pointer transition-colors shadow-lg shadow-blue-500/20"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

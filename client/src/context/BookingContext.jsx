import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const BookingContext = createContext();
const API_BASE = import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://primeshow-backend.onrender.com/api');
const SOCKET_BASE = API_BASE.replace('/api', '');

const DEFAULT_HERO_SLIDES = [
  {
    id: 'hero_1',
    movieId: 'mov_1',
    title: 'Avatar: Fire and Ash',
    tagline: 'Enter the Uncharted Regions of Pandora in Native IMAX 3D',
    badge: 'BLOCKBUSTER',
    rating: 9.4,
    votesCount: 42800,
    duration: '3h 12m',
    genres: ['Sci-Fi', 'Action', 'Adventure'],
    languages: ['English', 'Hindi', 'Tamil', 'Telugu'],
    price: 480,
    banner: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80',
    synopsis: 'Jake Sully and Neytiri encounter the Ash People, a volcanic Na\'vi clan whose aggressive nature challenges their perception of Pandora.'
  },
  {
    id: 'hero_2',
    movieId: 'mov_3',
    title: 'Kalki 2898 AD: Chapter II',
    tagline: 'The Epic Battle of the Millennia Unleashed',
    badge: 'TRENDING',
    rating: 9.1,
    votesCount: 65200,
    duration: '3h 05m',
    genres: ['Action', 'Sci-Fi', 'Mythology'],
    languages: ['Hindi', 'Telugu', 'Tamil'],
    price: 420,
    banner: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1920&q=80',
    synopsis: 'Set in a post-apocalyptic world in the year 2898 AD, the modern avatar of Vishnu descends to protect humanity from dark forces.'
  },
  {
    id: 'hero_3',
    movieId: 'mov_2',
    title: 'Dune: Part Two',
    tagline: 'Long Live The Fighters of Arrakis',
    badge: 'CRITICS CHOICE',
    rating: 9.3,
    votesCount: 89400,
    duration: '2h 46m',
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    languages: ['English', 'Hindi'],
    price: 380,
    banner: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80',
    synopsis: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.'
  }
];

const DEFAULT_FEATURE_STRIPS = [
  {
    id: 'feat_1',
    title: 'Instant UPI Ticket Pass',
    subtitle: 'Scan Jay Hiralal Radadiya QR for instant pass generation',
    icon: 'Zap',
    color: 'amber',
    badge: 'INSTANT'
  },
  {
    id: 'feat_2',
    title: 'Private Cinema Screen',
    subtitle: 'Book full theatre lounge for private birthday parties',
    icon: 'Film',
    color: 'purple',
    badge: 'LUXURY'
  },
  {
    id: 'feat_3',
    title: 'Exclusive Promo Vouchers',
    subtitle: 'Flat 50% discount on IMAX 3D recliners using PRIMESHOW50',
    icon: 'Gift',
    color: 'emerald',
    badge: 'OFFER'
  },
  {
    id: 'feat_4',
    title: 'Expert VIP Concierge',
    subtitle: 'Dedicated lounge assistance & gourmet dining booking',
    icon: 'Sparkles',
    color: 'cyan',
    badge: 'VIP'
  }
];

const DEFAULT_UPCOMING_MOVIES = [
  {
    id: 'up_1',
    title: 'Avengers: Secret Wars',
    release: 'Dec 2026',
    poster: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
    genres: ['Action', 'Superhero'],
    synopsis: 'The multiverse collapses as heroes assemble for the ultimate cosmic showdown.'
  },
  {
    id: 'up_2',
    title: 'The Dark Knight: Legacy',
    release: 'Nov 2026',
    poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    genres: ['Action', 'Crime'],
    synopsis: 'A new vigilante emerges in Gotham City to honor the shadow of Batman.'
  },
  {
    id: 'up_3',
    title: 'Interstellar II: Beyond Horizon',
    release: 'Jan 2027',
    poster: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80',
    genres: ['Sci-Fi', 'Adventure'],
    synopsis: 'Explorers venture through an uncharted wormhole in search of human salvation.'
  },
  {
    id: 'up_4',
    title: 'Gladiator: Rise of Empires',
    release: 'Oct 2026',
    poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
    genres: ['Action', 'Drama'],
    synopsis: 'Colosseum legends collide in ancient Rome for supreme honor.'
  }
];

const MOCK_MOVIES = [
  {
    id: 'mov_1',
    title: 'Avatar: Fire and Ash',
    tagline: 'Enter the Uncharted Regions of Pandora',
    synopsis: 'Jake Sully and Neytiri encounter the Ash People, a volcanic Na\'vi clan whose aggressive nature challenges their perception of Pandora. A visually breathtaking cinematic masterpiece in native IMAX 3D.',
    duration: '3h 12m',
    rating: 9.4,
    votesCount: 42800,
    parentalRating: 'UA 16+',
    releaseDate: '2026-12-18',
    showDates: ['2026-07-31', '2026-08-01', '2026-08-02'],
    genres: ['Sci-Fi', 'Action', 'Adventure', 'Fantasy'],
    languages: ['English', 'Hindi', 'Tamil', 'Telugu'],
    formats: ['IMAX 3D', '4DX', 'Dolby Atmos', '3D', '2D'],
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    banner: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=d9MyW72ELq0',
    director: 'James Cameron',
    producer: 'Jon Landau & James Cameron',
    cast: [
      { id: 'c_1', name: 'Sam Worthington', role: 'Jake Sully', character: 'Jake Sully', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80' },
      { id: 'c_2', name: 'Zoe Saldana', role: 'Neytiri', character: 'Neytiri', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' },
      { id: 'c_3', name: 'Sigourney Weaver', role: 'Kiri', character: 'Kiri', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80' }
    ],
    theatres: [
      {
        id: 'th_1',
        name: 'PVR Director\'s Cut, Palladium Mall',
        city: 'Mumbai',
        address: 'Lower Parel, Mumbai',
        facilities: ['VIP Recliners', 'Dolby Atmos', 'Gourmet In-Seat Dining'],
        shows: [
          { id: 'sh_101', time: '10:00 AM', format: 'IMAX 3D', price: 650, tier: 'Recliner', screen: 'Screen 1', availableSeats: 80 },
          { id: 'sh_102', time: '01:30 PM', format: 'IMAX 3D', price: 780, tier: 'Recliner', screen: 'Screen 1', availableSeats: 65 },
          { id: 'sh_103', time: '07:00 PM', format: 'IMAX 3D', price: 950, tier: 'Recliner', screen: 'Screen 1', availableSeats: 90 }
        ]
      },
      {
        id: 'th_2',
        name: 'INOX Megaplex, Inorbit Mall',
        city: 'Mumbai',
        address: 'Malad West, Mumbai',
        facilities: ['IMAX 3D', 'ScreenX 270°', 'MX4D'],
        shows: [
          { id: 'sh_201', time: '11:15 AM', format: '4DX', price: 480, tier: 'Premium', screen: 'Screen 2', availableSeats: 110 },
          { id: 'sh_202', time: '04:30 PM', format: '4DX', price: 580, tier: 'Premium', screen: 'Screen 2', availableSeats: 45 },
          { id: 'sh_203', time: '09:45 PM', format: 'Dolby Atmos', price: 620, tier: 'Premium', screen: 'Screen 3', availableSeats: 120 }
        ]
      }
    ],
    schedules: {
      '2026-07-31': [
        {
          id: 'th_1',
          name: 'PVR Director\'s Cut, Palladium Mall',
          city: 'Mumbai',
          address: 'Lower Parel, Mumbai',
          facilities: ['VIP Recliners', 'Dolby Atmos', 'Gourmet In-Seat Dining'],
          shows: [
            { id: 'sh_101', time: '10:00 AM', format: 'IMAX 3D', price: 650, tier: 'Recliner', screen: 'Screen 1', availableSeats: 80 },
            { id: 'sh_102', time: '01:30 PM', format: 'IMAX 3D', price: 780, tier: 'Recliner', screen: 'Screen 1', availableSeats: 65 },
            { id: 'sh_103', time: '07:00 PM', format: 'IMAX 3D', price: 950, tier: 'Recliner', screen: 'Screen 1', availableSeats: 90 }
          ]
        },
        {
          id: 'th_2',
          name: 'INOX Megaplex, Inorbit Mall',
          city: 'Mumbai',
          address: 'Malad West, Mumbai',
          facilities: ['IMAX 3D', 'ScreenX 270°', 'MX4D'],
          shows: [
            { id: 'sh_201', time: '11:15 AM', format: '4DX', price: 480, tier: 'Premium', screen: 'Screen 2', availableSeats: 110 },
            { id: 'sh_202', time: '04:30 PM', format: '4DX', price: 580, tier: 'Premium', screen: 'Screen 2', availableSeats: 45 }
          ]
        }
      ],
      '2026-08-01': [
        {
          id: 'th_1',
          name: 'PVR Director\'s Cut, Palladium Mall',
          city: 'Mumbai',
          address: 'Lower Parel, Mumbai',
          facilities: ['VIP Recliners', 'Dolby Atmos'],
          shows: [
            { id: 'sh_104', time: '02:00 PM', format: 'IMAX 3D', price: 700, tier: 'Recliner', screen: 'Screen 1', availableSeats: 100 }
          ]
        }
      ]
    },
    status: 'Now Showing',
    featured: true
  },
  {
    id: 'mov_2',
    title: 'Dune: Part Two',
    tagline: 'Long Live The Fighters',
    synopsis: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    duration: '2h 46m',
    rating: 9.3,
    votesCount: 89400,
    parentalRating: 'UA',
    releaseDate: '2026-03-01',
    showDates: ['2026-07-31', '2026-08-01'],
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    languages: ['English', 'Hindi'],
    formats: ['IMAX 3D', 'Dolby Atmos', '2D'],
    poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    banner: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
    director: 'Denis Villeneuve',
    producer: 'Mary Parent & Cale Boyter',
    cast: [
      { id: 'c_201', name: 'Timothée Chalamet', role: 'Paul Atreides', character: 'Paul Atreides', photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80' },
      { id: 'c_202', name: 'Zendaya', role: 'Chani', character: 'Chani', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80' }
    ],
    theatres: [
      {
        id: 'th_1',
        name: 'PVR Director\'s Cut, Palladium Mall',
        city: 'Mumbai',
        address: 'Lower Parel, Mumbai',
        facilities: ['VIP Recliners', 'Dolby Atmos'],
        shows: [
          { id: 'sh_301', time: '12:00 PM', format: 'IMAX 3D', price: 600, tier: 'Recliner', screen: 'Screen 1', availableSeats: 100 },
          { id: 'sh_302', time: '06:00 PM', format: 'Dolby Atmos', price: 700, tier: 'Recliner', screen: 'Screen 2', availableSeats: 85 }
        ]
      }
    ],
    status: 'Now Showing',
    featured: true
  },
  {
    id: 'mov_3',
    title: 'Kalki 2898 AD: Chapter II',
    tagline: 'The Epic Battle of the Millennia',
    synopsis: 'Set in a post-apocalyptic world in the year 2898 AD, the modern avatar of Vishnu descends to protect humanity.',
    duration: '3h 05m',
    rating: 9.1,
    votesCount: 65200,
    parentalRating: 'UA',
    releaseDate: '2026-06-27',
    showDates: ['2026-07-31'],
    genres: ['Action', 'Sci-Fi'],
    languages: ['Hindi', 'Telugu', 'Tamil'],
    formats: ['IMAX 3D', '3D', 'Dolby Atmos'],
    poster: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
    banner: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1920&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=kQDd1AhGIHk',
    director: 'Nag Ashwin',
    producer: 'C. Ashwini Dutt',
    cast: [
      { id: 'c_301', name: 'Prabhas', role: 'Bhairava', character: 'Bhairava', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80' }
    ],
    theatres: [
      {
        id: 'th_2',
        name: 'INOX Megaplex, Inorbit Mall',
        city: 'Mumbai',
        address: 'Malad West, Mumbai',
        facilities: ['IMAX 3D', '3D'],
        shows: [
          { id: 'sh_401', time: '02:00 PM', format: '3D', price: 400, tier: 'Premium', screen: 'Screen 1', availableSeats: 95 },
          { id: 'sh_402', time: '08:30 PM', format: 'IMAX 3D', price: 650, tier: 'Premium', screen: 'Screen 1', availableSeats: 110 }
        ]
      }
    ],
    status: 'Now Showing',
    featured: true
  }
];

export const BookingProvider = ({ children }) => {
  const [moviesList, setMoviesList] = useState(MOCK_MOVIES);
  
  const fetchMovies = async () => {
    try {
      const res = await axios.get(`${API_BASE}/movies`);
      if (res.data && res.data.length > 0) {
        setMoviesList(res.data);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  // Master Dynamic Screen Seat Configuration Store
  const DEFAULT_SEAT_ROWS = [
    { row: 'N', tier: 'Classic Normal (Screen Front)', price: 280, seatsCount: 12 },
    { row: 'P', tier: 'Premium Tier', price: 480, seatsCount: 12 },
    { row: 'R', tier: 'Luxury Recliner', price: 650, seatsCount: 10 },
    { row: 'V', tier: 'VIP Gold Lounge (Back Tier)', price: 950, seatsCount: 8 }
  ];

  const [screenLayoutsMap, setScreenLayoutsMap] = useState(() => {
    const saved = localStorage.getItem('primeshow_screen_layouts_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      'sc_1': {
        screenId: 'sc_1',
        screenName: 'Screen 1 - IMAX 3D',
        rows: DEFAULT_SEAT_ROWS,
        blockedSeats: ['V1', 'V2'],
        customStatuses: {}
      },
      'sc_2': {
        screenId: 'sc_2',
        screenName: 'Screen 2 - 4DX',
        rows: [
          { row: 'N', tier: 'Classic Normal', price: 300, seatsCount: 10 },
          { row: 'P', tier: '4DX Motion Tier', price: 550, seatsCount: 10 },
          { row: 'V', tier: 'VIP Recliner', price: 850, seatsCount: 8 }
        ],
        blockedSeats: ['V1'],
        customStatuses: {}
      }
    };
  });

  useEffect(() => {
    localStorage.setItem('primeshow_screen_layouts_v1', JSON.stringify(screenLayoutsMap));
  }, [screenLayoutsMap]);

  const getScreenLayout = (screenId = 'sc_1') => {
    return screenLayoutsMap[screenId] || {
      screenId,
      screenName: 'Screen 1',
      rows: DEFAULT_SEAT_ROWS,
      blockedSeats: ['V1', 'V2'],
      customStatuses: {}
    };
  };

  const updateScreenRowsConfig = (screenId = 'sc_1', updatedRows) => {
    setScreenLayoutsMap(prev => {
      const current = prev[screenId] || { screenId, rows: DEFAULT_SEAT_ROWS, blockedSeats: [], customStatuses: {} };
      return {
        ...prev,
        [screenId]: { ...current, rows: updatedRows }
      };
    });
  };

  const toggleBlockSeatForScreen = (screenId = 'sc_1', seatId) => {
    setScreenLayoutsMap(prev => {
      const current = prev[screenId] || { screenId, rows: DEFAULT_SEAT_ROWS, blockedSeats: [], customStatuses: {} };
      const blocked = current.blockedSeats || [];
      const isBlocked = blocked.includes(seatId);
      const updatedBlocked = isBlocked
        ? blocked.filter(s => s !== seatId)
        : [...blocked, seatId];
      
      const custom = { ...(current.customStatuses || {}) };
      if (!isBlocked) {
        custom[seatId] = 'BLOCKED';
      } else {
        delete custom[seatId];
      }

      return {
        ...prev,
        [screenId]: { ...current, blockedSeats: updatedBlocked, customStatuses: custom }
      };
    });
  };

  const setManualSeatStatusForScreen = (screenId = 'sc_1', seatId, newStatus) => {
    setScreenLayoutsMap(prev => {
      const current = prev[screenId] || { screenId, rows: DEFAULT_SEAT_ROWS, blockedSeats: [], customStatuses: {} };
      const custom = { ...(current.customStatuses || {}) };
      let blocked = [...(current.blockedSeats || [])];

      if (newStatus === 'BLOCKED') {
        if (!blocked.includes(seatId)) blocked.push(seatId);
        custom[seatId] = 'BLOCKED';
      } else if (newStatus === 'AVAILABLE') {
        blocked = blocked.filter(s => s !== seatId);
        delete custom[seatId];
      } else {
        custom[seatId] = newStatus;
      }

      return {
        ...prev,
        [screenId]: { ...current, blockedSeats: blocked, customStatuses: custom }
      };
    });
  };

  const addRowToScreenLayout = (screenId = 'sc_1', rowChar, tierName, price, seatsCount) => {
    setScreenLayoutsMap(prev => {
      const current = prev[screenId] || { screenId, rows: DEFAULT_SEAT_ROWS, blockedSeats: [], customStatuses: {} };
      const existingRows = current.rows || [];
      const updatedRows = [...existingRows.filter(r => r.row !== rowChar), {
        row: rowChar.toUpperCase(),
        tier: tierName,
        price: Number(price),
        seatsCount: Number(seatsCount)
      }];
      return {
        ...prev,
        [screenId]: { ...current, rows: updatedRows }
      };
    });
  };

  const deleteRowFromScreenLayout = (screenId = 'sc_1', rowChar) => {
    setScreenLayoutsMap(prev => {
      const current = prev[screenId] || { screenId, rows: DEFAULT_SEAT_ROWS, blockedSeats: [], customStatuses: {} };
      const updatedRows = (current.rows || []).filter(r => r.row !== rowChar);
      return {
        ...prev,
        [screenId]: { ...current, rows: updatedRows }
      };
    });
  };

  const [activeBooking, setActiveBooking] = useState({
    movie: null,
    theatre: null,
    show: null,
    selectedSeats: [],
    selectedTier: 'Recliner',
    appliedCoupon: null,
    discountAmount: 0,
    paymentMethod: 'UPI'
  });

  // Dynamic User Bookings Store
  const [myBookings, setMyBookings] = useState(() => {
    const saved = localStorage.getItem('primeshow_my_bookings_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('primeshow_my_bookings_v2', JSON.stringify(myBookings));
  }, [myBookings]);

  // Global Tracked Booked Seats Map
  const [showBookedSeatsMap, setShowBookedSeatsMap] = useState({
    sh_101: ['C4', 'C5', 'D6', 'D7'],
    sh_102: ['E1', 'E2']
  });

  const selectShowForBooking = (movieObj, theatreObj, showObj) => {
    setActiveBooking({
      movie: movieObj,
      theatre: theatreObj,
      show: showObj,
      selectedSeats: [],
      selectedTier: 'Recliner',
      appliedCoupon: null,
      discountAmount: 0,
      paymentMethod: 'UPI'
    });
  };

  const toggleSeatSelection = (seatId, tierPrice, tierName) => {
    setActiveBooking(prev => {
      const exists = prev.selectedSeats.includes(seatId);
      const updatedSeats = exists
        ? prev.selectedSeats.filter(s => s !== seatId)
        : [...prev.selectedSeats, seatId];
      
      return {
        ...prev,
        selectedSeats: updatedSeats,
        selectedTier: tierName || prev.selectedTier
      };
    });
  };

  const applyCoupon = async (code, totalAmount) => {
    try {
      const token = localStorage.getItem('primeshow_token');
      const res = await axios.post(`${API_BASE}/coupons/verify`, 
        { code, amount: totalAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setActiveBooking(prev => ({
        ...prev,
        appliedCoupon: res.data.code,
        discountAmount: res.data.discountAmount
      }));

      return { success: true, description: res.data.description, discountAmount: res.data.discountAmount };
    } catch (err) {
      const cleanCode = code.toUpperCase().trim();
      if (cleanCode === 'PRIMESHOW50') {
        const disc = Math.min(Math.round(totalAmount * 0.5), 250);
        setActiveBooking(prev => ({ ...prev, appliedCoupon: 'PRIMESHOW50', discountAmount: disc }));
        return { success: true, description: '50% Flat Discount applied!', discountAmount: disc };
      } else if (cleanCode === 'LUXURY200') {
        const disc = 200;
        setActiveBooking(prev => ({ ...prev, appliedCoupon: 'LUXURY200', discountAmount: disc }));
        return { success: true, description: 'Flat ₹200 Cashback applied!', discountAmount: disc };
      } else if (cleanCode === 'ADMINVIP') {
        const disc = 500;
        setActiveBooking(prev => ({ ...prev, appliedCoupon: 'ADMINVIP', discountAmount: disc }));
        return { success: true, description: 'VIP Admin ₹500 Pass applied!', discountAmount: disc };
      }

      return { success: false, error: err.response?.data?.error || 'Invalid or non-eligible coupon code' };
    }
  };

  const removeCoupon = () => {
    setActiveBooking(prev => ({ ...prev, appliedCoupon: null, discountAmount: 0 }));
  };

  const confirmBooking = async (bookingDetails) => {
    const bookingId = `bk_${Math.floor(100000 + Math.random() * 900000)}`;
    
    const targetMovie = activeBooking.movie || {};
    const movieTitle = bookingDetails.movieTitle || targetMovie.title || 'Movie';
    const poster = bookingDetails.poster || targetMovie.poster || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80';
    const theatreName = bookingDetails.theatreName || activeBooking.theatre?.name || 'Multiplex';

    const newBooking = {
      id: bookingId,
      ...bookingDetails,
      movieTitle,
      poster,
      theatreName,
      bookingDate: new Date().toISOString(),
      status: 'CONFIRMED',
      qrCodeData: `PRIMESHOW-${bookingId}-${movieTitle.replace(/\s+/g, '')}-${bookingDetails.seats.join('')}`
    };

    setMyBookings(prev => [newBooking, ...prev]);

    if (activeBooking.show?.id) {
      const showId = activeBooking.show.id;
      setShowBookedSeatsMap(prev => ({
        ...prev,
        [showId]: [...(prev[showId] || []), ...bookingDetails.seats]
      }));
    }

    try {
      const token = localStorage.getItem('primeshow_token');
      await axios.post(`${API_BASE}/bookings/create`, {
        showId: activeBooking.show?.id || 'sh_101',
        seats: bookingDetails.seats,
        tier: bookingDetails.tier,
        totalAmount: bookingDetails.totalAmount,
        couponCode: bookingDetails.couponCode,
        paymentMethod: bookingDetails.paymentMethod,
        basePrice: bookingDetails.basePrice,
        convenienceFee: bookingDetails.convenienceFee,
        tax: bookingDetails.tax,
        discount: bookingDetails.discount
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {}

    return newBooking;
  };

  const lockSeatsForShow = async (showId, seats) => {
    if (!showId || !seats || seats.length === 0) return;
    
    // Immediately lock seats in global state map so Admin and user view them as booked/held
    setShowBookedSeatsMap(prev => ({
      ...prev,
      [showId]: Array.from(new Set([...(prev[showId] || []), ...seats]))
    }));

    try {
      const token = localStorage.getItem('primeshow_token');
      await axios.post(`${API_BASE}/bookings/hold-seats`, {
        showId,
        seats
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {}
  };

  const addMovieToGlobalStore = async (newMovieData) => {
    const moviePayload = {
      id: newMovieData.id || `mov_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      ...newMovieData,
      duration: newMovieData.duration || '2h 30m',
      rating: newMovieData.rating || 9.0,
      votesCount: newMovieData.votesCount || 100,
      parentalRating: newMovieData.parentalRating || 'UA',
      releaseDate: newMovieData.releaseDate || new Date().toISOString().split('T')[0],
      showDates: newMovieData.showDates || ['2026-07-31', '2026-08-01'],
      genres: Array.isArray(newMovieData.genres) ? newMovieData.genres : (newMovieData.genres ? String(newMovieData.genres).split(',').map(s=>s.trim()) : ['Action']),
      languages: Array.isArray(newMovieData.languages) ? newMovieData.languages : (newMovieData.languages ? String(newMovieData.languages).split(',').map(s=>s.trim()) : ['English', 'Hindi']),
      formats: Array.isArray(newMovieData.formats) ? newMovieData.formats : (newMovieData.formats ? String(newMovieData.formats).split(',').map(s=>s.trim()) : ['IMAX 3D', 'Dolby Atmos']),
      poster: newMovieData.poster || 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
      banner: newMovieData.banner || newMovieData.poster || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80',
      trailerUrl: newMovieData.trailerUrl || 'https://www.youtube.com/watch?v=d9MyW72ELq0',
      director: newMovieData.director || 'Famous Director',
      producer: newMovieData.producer || 'PrimeShow Studios',
      cast: newMovieData.cast || [],
      theatres: newMovieData.theatres || [],
      status: newMovieData.status || 'Now Showing',
      featured: newMovieData.featured !== undefined ? newMovieData.featured : true,
      city: newMovieData.city || 'All',
      cities: newMovieData.cities || ['All', 'Surat', 'Mumbai', 'Ahmedabad', 'Delhi', 'Bengaluru']
    };

    try {
      const token = localStorage.getItem('primeshow_token');
      const res = await axios.post(`${API_BASE}/movies`, moviePayload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const returnedMovie = res.data || moviePayload;
      setMoviesList(prev => {
        const filtered = prev.filter(m => m.id !== returnedMovie.id);
        return [returnedMovie, ...filtered];
      });
    } catch (err) {
      console.warn('⚠️ API movie create error, applying local fallback:', err.message);
      setMoviesList(prev => {
        const filtered = prev.filter(m => m.id !== moviePayload.id);
        return [moviePayload, ...filtered];
      });
    }
  };

  const updateMovieInGlobalStore = async (movieId, updatedFields) => {
    setMoviesList(prev => prev.map(m => m.id === movieId ? { ...m, ...updatedFields } : m));
    try {
      const token = localStorage.getItem('primeshow_token');
      await axios.put(`${API_BASE}/movies/${movieId}`, updatedFields, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {}
  };

  const deleteMovieFromGlobalStore = async (movieId) => {
    try {
      const token = localStorage.getItem('primeshow_token');
      await axios.delete(`${API_BASE}/movies/${movieId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {}
    setMoviesList(prev => prev.filter(m => m.id !== movieId));
  };

  // Show Management Helpers
  const addShowDateToMovie = (movieId, dateStr) => {
    setMoviesList(prev => prev.map(m => {
      if (m.id === movieId) {
        const existingDates = m.showDates || [];
        if (!existingDates.includes(dateStr)) {
          return { ...m, showDates: [...existingDates, dateStr] };
        }
      }
      return m;
    }));
  };

  const deleteShowDateFromMovie = (movieId, dateStr) => {
    setMoviesList(prev => prev.map(m => {
      if (m.id === movieId) {
        const existingDates = m.showDates || [];
        const updatedDates = existingDates.filter(d => d !== dateStr);
        const updatedSchedules = { ...(m.schedules || {}) };
        delete updatedSchedules[dateStr];
        return { ...m, showDates: updatedDates, schedules: updatedSchedules };
      }
      return m;
    }));
  };

  const addShowSlotToMovieTheatre = (movieId, dateStr, theatreObj, showSlotObj) => {
    setMoviesList(prev => prev.map(m => {
      if (m.id === movieId) {
        const schedules = { ...(m.schedules || {}) };
        const dateTheatres = schedules[dateStr] ? JSON.parse(JSON.stringify(schedules[dateStr])) : (m.theatres ? JSON.parse(JSON.stringify(m.theatres)) : []);
        const theatreIndex = dateTheatres.findIndex(t => t.id === theatreObj.id || t.name === theatreObj.name);

        if (theatreIndex > -1) {
          const targetTheatre = dateTheatres[theatreIndex];
          targetTheatre.shows = [...(targetTheatre.shows || []), showSlotObj];
        } else {
          dateTheatres.push({
            id: theatreObj.id || `th_${Date.now()}`,
            name: theatreObj.name || 'PVR Cinemas',
            city: theatreObj.city || 'Mumbai',
            address: theatreObj.address || 'Central City Mall',
            facilities: theatreObj.facilities || ['IMAX 3D', 'VIP Recliners'],
            shows: [showSlotObj]
          });
        }
        schedules[dateStr] = dateTheatres;
        const existingDates = m.showDates || [];
        const updatedDates = existingDates.includes(dateStr) ? existingDates : [...existingDates, dateStr];
        return { ...m, showDates: updatedDates, schedules };
      }
      return m;
    }));
  };

  const deleteShowSlotFromMovieTheatre = (movieId, dateStr, theatreId, showId) => {
    setMoviesList(prev => prev.map(m => {
      if (m.id === movieId) {
        const schedules = { ...(m.schedules || {}) };
        if (schedules[dateStr]) {
          schedules[dateStr] = schedules[dateStr].map(t => {
            if (t.id === theatreId) {
              return { ...t, shows: t.shows.filter(s => s.id !== showId) };
            }
            return t;
          }).filter(t => t.shows.length > 0);
        } else if (m.theatres) {
          const updatedTheatres = m.theatres.map(t => {
            if (t.id === theatreId) {
              return { ...t, shows: t.shows.filter(s => s.id !== showId) };
            }
            return t;
          }).filter(t => t.shows.length > 0);
          return { ...m, theatres: updatedTheatres };
        }
        return { ...m, schedules };
      }
      return m;
    }));
  };

  const deleteTheatreFromMovieDate = (movieId, dateStr, theatreId) => {
    setMoviesList(prev => prev.map(m => {
      if (m.id === movieId) {
        const schedules = { ...(m.schedules || {}) };
        if (schedules[dateStr]) {
          schedules[dateStr] = schedules[dateStr].filter(t => t.id !== theatreId);
        } else if (m.theatres) {
          return { ...m, theatres: m.theatres.filter(t => t.id !== theatreId) };
        }
        return { ...m, schedules };
      }
      return m;
    }));
  };

  // Hero Section Slideshow Dynamic Store & Persistent LocalStorage
  const [heroSlidesList, setHeroSlidesList] = useState(() => {
    const saved = localStorage.getItem('primeshow_hero_slides_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_HERO_SLIDES;
  });

  useEffect(() => {
    localStorage.setItem('primeshow_hero_slides_v1', JSON.stringify(heroSlidesList));
  }, [heroSlidesList]);

  const addHeroSlide = async (slideObj) => {
    const newSlide = {
      id: `hero_${Date.now()}`,
      ...slideObj
    };
    setHeroSlidesList(prev => [newSlide, ...prev]);
    try {
      const res = await axios.post(`${API_BASE}/hero-slides`, newSlide);
      if (res.data && Array.isArray(res.data)) {
        setHeroSlidesList(res.data);
      }
    } catch (err) {}
    return newSlide;
  };

  const updateHeroSlide = async (slideId, updatedFields) => {
    setHeroSlidesList(prev => prev.map(s => s.id === slideId ? { ...s, ...updatedFields } : s));
  };

  const deleteHeroSlide = async (slideId) => {
    setHeroSlidesList(prev => prev.filter(s => s.id !== slideId));
    try {
      const res = await axios.delete(`${API_BASE}/hero-slides/${slideId}`);
      if (res.data && Array.isArray(res.data)) {
        setHeroSlidesList(res.data);
      }
    } catch (err) {}
  };

  // Feature Strips Dynamic Store & Central API Synchronization
  const [featureStripsList, setFeatureStripsList] = useState(DEFAULT_FEATURE_STRIPS);

  const fetchFeatureStrips = async () => {
    try {
      const res = await axios.get(`${API_BASE}/feature-chips?t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setFeatureStripsList(res.data);
      }
    } catch (err) {}
  };

  const fetchHeroSlides = async () => {
    try {
      const res = await axios.get(`${API_BASE}/hero-slides?t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setHeroSlidesList(res.data);
      }
    } catch (err) {}
  };

  const fetchUpcomingMovies = async () => {
    try {
      const res = await axios.get(`${API_BASE}/upcoming-movies?t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setUpcomingMoviesList(res.data);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchMovies();
    fetchFeatureStrips();
    fetchHeroSlides();
    fetchUpcomingMovies();

    const interval = setInterval(() => {
      fetchMovies();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Real-Time Socket.io Synchronization across ALL active User Panels & Sessions
  useEffect(() => {
    let cmsSocket = null;
    try {
      cmsSocket = io(SOCKET_BASE, { transports: ['websocket', 'polling'] });

      cmsSocket.on('MOVIE_UPDATED', (movie) => {
        console.log('⚡ [BookingContext] Real-time MOVIE_UPDATED received:', movie);
        if (movie && movie.id) {
          setMoviesList(prev => {
            const exists = prev.some(m => m.id === movie.id);
            if (exists) {
              return prev.map(m => m.id === movie.id ? { ...m, ...movie } : m);
            } else {
              return [movie, ...prev];
            }
          });
        } else {
          fetchMovies();
        }
      });

      cmsSocket.on('MOVIE_DELETED', (data) => {
        console.log('⚡ [BookingContext] Real-time MOVIE_DELETED received:', data);
        if (data && data.id) {
          setMoviesList(prev => prev.filter(m => m.id !== data.id));
        } else {
          fetchMovies();
        }
      });

      cmsSocket.on('FEATURE_CHIPS_UPDATED', (chips) => {
        console.log('⚡ [BookingContext] Real-time FEATURE_CHIPS_UPDATED received:', chips);
        if (Array.isArray(chips)) {
          setFeatureStripsList(chips);
        }
      });

      cmsSocket.on('HERO_SLIDES_UPDATED', (slides) => {
        if (Array.isArray(slides)) {
          setHeroSlidesList(slides);
        }
      });

      cmsSocket.on('UPCOMING_MOVIES_UPDATED', (movies) => {
        if (Array.isArray(movies)) {
          setUpcomingMoviesList(movies);
        }
      });

      cmsSocket.on('LAYOUT_DATA_UPDATED', (payload) => {
        console.log('⚡ [BookingContext] Real-time LAYOUT_DATA_UPDATED received:', payload);
        fetchMovies();
        if (payload && payload.featureStripsList && Array.isArray(payload.featureStripsList)) {
          setFeatureStripsList(payload.featureStripsList);
        }
        if (payload && payload.heroSlidesList && Array.isArray(payload.heroSlidesList)) {
          setHeroSlidesList(payload.heroSlidesList);
        }
        if (payload && payload.upcomingMoviesList && Array.isArray(payload.upcomingMoviesList)) {
          setUpcomingMoviesList(payload.upcomingMoviesList);
        }
      });

      cmsSocket.on('GLOBAL_ADMIN_UPDATE', (payload) => {
        console.log('⚡ [BookingContext] Real-time GLOBAL_ADMIN_UPDATE received:', payload);
        fetchMovies();
        if (payload && payload.featureStripsList && Array.isArray(payload.featureStripsList)) {
          setFeatureStripsList(payload.featureStripsList);
        }
        if (payload && payload.heroSlidesList && Array.isArray(payload.heroSlidesList)) {
          setHeroSlidesList(payload.heroSlidesList);
        }
        if (payload && payload.upcomingMoviesList && Array.isArray(payload.upcomingMoviesList)) {
          setUpcomingMoviesList(payload.upcomingMoviesList);
        }
      });
    } catch (e) {
      console.warn('Socket connection note in BookingContext:', e.message);
    }

    return () => {
      if (cmsSocket) cmsSocket.disconnect();
    };
  }, []);

  const addFeatureStrip = async (stripObj) => {
    const newStrip = { id: `feat_${Date.now()}`, ...stripObj };
    setFeatureStripsList(prev => [newStrip, ...prev]);
    try {
      const res = await axios.post(`${API_BASE}/feature-chips`, newStrip);
      if (res.data && Array.isArray(res.data)) {
        setFeatureStripsList(res.data);
      }
    } catch (err) {}
    return newStrip;
  };

  const updateFeatureStrip = async (stripId, updatedFields) => {
    setFeatureStripsList(prev => prev.map(s => s.id === stripId ? { ...s, ...updatedFields } : s));
    try {
      const res = await axios.put(`${API_BASE}/feature-chips/${stripId}`, updatedFields);
      if (res.data && Array.isArray(res.data)) {
        setFeatureStripsList(res.data);
      }
    } catch (err) {}
  };

  const deleteFeatureStrip = async (stripId) => {
    setFeatureStripsList(prev => prev.filter(s => s.id !== stripId));
    try {
      const res = await axios.delete(`${API_BASE}/feature-chips/${stripId}`);
      if (res.data && Array.isArray(res.data)) {
        setFeatureStripsList(res.data);
      }
    } catch (err) {}
  };

  // Upcoming Movies Dynamic Store & Persistent LocalStorage
  const [upcomingMoviesList, setUpcomingMoviesList] = useState(() => {
    const saved = localStorage.getItem('primeshow_upcoming_movies_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_UPCOMING_MOVIES;
  });

  useEffect(() => {
    localStorage.setItem('primeshow_upcoming_movies_v1', JSON.stringify(upcomingMoviesList));
  }, [upcomingMoviesList]);

  const addUpcomingMovie = async (movieObj) => {
    const newMovie = { id: `up_${Date.now()}`, ...movieObj };
    setUpcomingMoviesList(prev => [newMovie, ...prev]);
    try {
      const res = await axios.post(`${API_BASE}/upcoming-movies`, newMovie);
      if (res.data && Array.isArray(res.data)) {
        setUpcomingMoviesList(res.data);
      }
    } catch (err) {}
    return newMovie;
  };

  const updateUpcomingMovie = async (movieId, updatedFields) => {
    setUpcomingMoviesList(prev => prev.map(m => m.id === movieId ? { ...m, ...updatedFields } : m));
  };

  const deleteUpcomingMovie = async (movieId) => {
    setUpcomingMoviesList(prev => prev.filter(m => m.id !== movieId));
    try {
      const res = await axios.delete(`${API_BASE}/upcoming-movies/${movieId}`);
      if (res.data && Array.isArray(res.data)) {
        setUpcomingMoviesList(res.data);
      }
    } catch (err) {}
  };

  return (
    <BookingContext.Provider value={{
      moviesList,
      fetchMovies,
      addMovieToGlobalStore,
      updateMovieInGlobalStore,
      deleteMovieFromGlobalStore,
      addShowDateToMovie,
      deleteShowDateFromMovie,
      addShowSlotToMovieTheatre,
      deleteShowSlotFromMovieTheatre,
      deleteTheatreFromMovieDate,
      screenLayoutsMap,
      getScreenLayout,
      updateScreenRowsConfig,
      toggleBlockSeatForScreen,
      setManualSeatStatusForScreen,
      addRowToScreenLayout,
      deleteRowFromScreenLayout,
      activeBooking,
      selectShowForBooking,
      toggleSeatSelection,
      applyCoupon,
      removeCoupon,
      confirmBooking,
      myBookings,
      setMyBookings,
      showBookedSeatsMap,
      lockSeatsForShow,
      heroSlidesList,
      addHeroSlide,
      updateHeroSlide,
      deleteHeroSlide,
      featureStripsList,
      addFeatureStrip,
      updateFeatureStrip,
      deleteFeatureStrip,
      upcomingMoviesList,
      addUpcomingMovie,
      updateUpcomingMovie,
      deleteUpcomingMovie
    }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);

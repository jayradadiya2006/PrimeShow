require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { connectDB, movies, theatres, events, eventBookings, plays, playBookings, activities, activityBookings, offers, offerBanners, supportMessages, notifications, bookings, privateTheatreBookings, cinemaScreenBlockedSeatsMap } = require('./db');
const { User, Movie, Theatre, Booking, PrivateTheatreBooking, Event, Play, Activity, Offer, OfferBanner, SupportMessage, Notification, BlockedSeat } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'primeshow_ultra_secret_key_2026';

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// Health check endpoint for Render deployment
app.get(['/', '/api/health'], (req, res) => {
  res.json({
    status: 'ok',
    service: 'PrimeShow Node.js REST API Backend',
    timestamp: new Date().toISOString(),
    database: 'MongoDB Atlas'
  });
});

// -------------------------------------------------------------
// AUTHENTICATION ENDPOINTS
// -------------------------------------------------------------

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  // Demo Admin Login
  if (email === 'admin@primeshow.com' && password === 'admin123') {
    const adminUser = {
      id: 'admin_1',
      name: 'Admin Command Desk',
      username: 'admin',
      email: 'admin@primeshow.com',
      phone: '+91 9999999999',
      altPhone: '+91 8888888888',
      whatsappPhone: '+91 9999999999',
      gender: 'Male',
      city: 'Mumbai',
      dob: '1990-01-01',
      role: 'ADMIN',
      rewardsPoints: 99999,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
    };
    const token = jwt.sign(adminUser, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: adminUser });
  }

  // Regular Customer Login
  const customerName = email.split('@')[0].toUpperCase();
  const customerUser = {
    id: `usr_${Math.floor(1000 + Math.random() * 9000)}`,
    name: customerName,
    username: email.split('@')[0].toLowerCase(),
    email,
    phone: '+91 9876543210',
    altPhone: '+91 9123456789',
    whatsappPhone: '+91 9876543210',
    gender: 'Male',
    city: 'Mumbai',
    dob: '1998-05-15',
    role: 'CUSTOMER',
    rewardsPoints: 1250,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'
  };
  const token = jwt.sign(customerUser, JWT_SECRET, { expiresIn: '7d' });
  return res.json({ token, user: customerUser });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }

  const username = email.split('@')[0].toLowerCase();
  const newUser = {
    id: `usr_${Date.now()}`,
    name,
    username,
    email,
    phone: phone || '+91 9876543210',
    altPhone: '',
    whatsappPhone: phone || '',
    gender: 'Male',
    city: 'Mumbai',
    dob: '1998-05-15',
    role: 'CUSTOMER',
    rewardsPoints: 500,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'
  };

  const token = jwt.sign(newUser, JWT_SECRET, { expiresIn: '7d' });
  return res.json({ token, user: newUser });
});

// -------------------------------------------------------------
// NOTIFICATION SYSTEM ENDPOINTS
// -------------------------------------------------------------

app.get('/api/notifications', (req, res) => {
  res.json(notifications);
});

app.post('/api/notifications', (req, res) => {
  const { title, message, type } = req.body;
  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message required' });
  }

  const newNotif = {
    id: `notif_${Date.now()}`,
    title,
    message,
    type: type || 'SYSTEM',
    read: false,
    createdAt: new Date().toISOString()
  };

  notifications.unshift(newNotif);
  res.status(201).json(newNotif);
});

app.put('/api/notifications/:id/read', (req, res) => {
  const notif = notifications.find(n => n.id === req.params.id);
  if (!notif) return res.status(404).json({ error: 'Notification not found' });
  notif.read = true;
  res.json(notif);
});

// -------------------------------------------------------------
// MOVIE & CAST CRUD ENDPOINTS
// -------------------------------------------------------------

app.get('/api/movies', (req, res) => {
  res.json(movies);
});

app.get('/api/movies/:id', (req, res) => {
  const movie = movies.find(m => m.id === req.params.id);
  if (!movie) return res.status(404).json({ error: 'Movie not found' });
  res.json(movie);
});

app.post('/api/movies', (req, res) => {
  const newMovie = {
    id: `mov_${Date.now()}`,
    title: req.body.title || 'Untitled Movie',
    tagline: req.body.tagline || 'Experience Cinema',
    synopsis: req.body.synopsis || 'Comprehensive movie description.',
    duration: req.body.duration || '2h 30m',
    rating: req.body.rating || 9.0,
    votesCount: req.body.votesCount || 100,
    parentalRating: req.body.parentalRating || 'UA',
    releaseDate: req.body.releaseDate || '2026-08-01',
    genres: req.body.genres || ['Action', 'Thriller'],
    languages: req.body.languages || ['English', 'Hindi'],
    formats: req.body.formats || ['IMAX 3D', 'Dolby Atmos'],
    poster: req.body.poster || 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
    banner: req.body.banner || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80',
    trailerUrl: req.body.trailerUrl || 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081127_0992a171-d3c6-4978-8213-0ec5df8b6d63.mp4',
    director: req.body.director || 'Famous Director',
    cast: req.body.cast || [
      { id: 'c_default', name: 'Lead Actor', role: 'Hero', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80' }
    ],
    status: req.body.status || 'Now Showing',
    featured: req.body.featured !== undefined ? req.body.featured : true
  };

  movies.unshift(newMovie);
  res.status(201).json(newMovie);
});

app.put('/api/movies/:id', (req, res) => {
  const index = movies.findIndex(m => m.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Movie not found' });

  movies[index] = {
    ...movies[index],
    ...req.body
  };

  res.json(movies[index]);
});

app.delete('/api/movies/:id', (req, res) => {
  const index = movies.findIndex(m => m.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Movie not found' });
  const deleted = movies.splice(index, 1);
  res.json({ message: 'Movie deleted', movie: deleted[0] });
});

// -------------------------------------------------------------
// THEATRE & SHOWTIMES MANAGEMENT CRUD ENDPOINTS
// -------------------------------------------------------------

app.get('/api/theatres', (req, res) => {
  res.json(theatres);
});

app.get('/api/theatres/:id', (req, res) => {
  const theatre = theatres.find(t => t.id === req.params.id);
  if (!theatre) return res.status(404).json({ error: 'Theatre not found' });
  res.json(theatre);
});

// Admin Add Theatre
app.post('/api/theatres', (req, res) => {
  const { name, city, state, address, logo, image, facilities, screensCount, totalSeats } = req.body;
  if (!name || !city || !address) {
    return res.status(400).json({ error: 'Name, city, and address are required' });
  }

  const facilitiesArray = typeof facilities === 'string' 
    ? facilities.split(',').map(f => f.trim()).filter(Boolean) 
    : (facilities || ['IMAX 3D', 'VIP Recliners']);

  const newTheatre = {
    id: `th_${Date.now()}`,
    name,
    city,
    state: state || 'Maharashtra',
    address,
    logo: logo || 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=150&q=80',
    image: image || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
    facilities: facilitiesArray,
    screensCount: Number(screensCount || 6),
    totalSeats: Number(totalSeats || 200),
    screens: [
      { id: `sc_${Date.now()}_1`, name: 'Screen 1 - Director\'s Cut IMAX', formats: ['IMAX 3D', 'Dolby Atmos'], totalSeats: 120 },
      { id: `sc_${Date.now()}_2`, name: 'Screen 2 - Luxe Lounge', formats: ['Dolby Atmos', '2D'], totalSeats: 80 }
    ],
    shows: [
      { id: `sh_${Date.now()}_1`, movieId: 'mov_1', movieTitle: 'Avatar: Fire and Ash', screenId: `sc_${Date.now()}_1`, screenName: 'Screen 1 - IMAX 3D', format: 'IMAX 3D', time: '10:30 AM', price: 450 },
      { id: `sh_${Date.now()}_2`, movieId: 'mov_2', movieTitle: 'Dune: Part Two', screenId: `sc_${Date.now()}_2`, screenName: 'Screen 2 - Luxe Lounge', format: 'Dolby Atmos', time: '04:15 PM', price: 380 }
    ]
  };

  theatres.unshift(newTheatre);
  res.status(201).json(newTheatre);
});

// Admin Update Theatre
app.put('/api/theatres/:id', (req, res) => {
  const index = theatres.findIndex(t => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Theatre not found' });

  if (typeof req.body.facilities === 'string') {
    req.body.facilities = req.body.facilities.split(',').map(f => f.trim()).filter(Boolean);
  }

  theatres[index] = {
    ...theatres[index],
    ...req.body
  };

  res.json(theatres[index]);
});

// Admin Delete Theatre
app.delete('/api/theatres/:id', (req, res) => {
  const index = theatres.findIndex(t => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Theatre not found' });
  const deleted = theatres.splice(index, 1);
  res.json({ message: 'Theatre deleted', theatre: deleted[0] });
});

// Admin Add Show Slot to a Theatre
app.post('/api/theatres/:id/shows', (req, res) => {
  const theatre = theatres.find(t => t.id === req.params.id);
  if (!theatre) return res.status(404).json({ error: 'Theatre not found' });

  const { movieId, movieTitle, screenId, screenName, format, time, price } = req.body;
  const newShow = {
    id: `sh_${Date.now()}`,
    movieId: movieId || 'mov_1',
    movieTitle: movieTitle || 'Avatar: Fire and Ash',
    screenId: screenId || 'sc_1',
    screenName: screenName || 'Screen 1',
    format: format || 'IMAX 3D',
    time: time || '07:30 PM',
    price: Number(price || 400)
  };

  if (!theatre.shows) theatre.shows = [];
  theatre.shows.unshift(newShow);
  res.status(201).json(theatre);
});

// Admin Delete Show Slot from a Theatre
app.delete('/api/theatres/:id/shows/:showId', (req, res) => {
  const theatre = theatres.find(t => t.id === req.params.id);
  if (!theatre) return res.status(404).json({ error: 'Theatre not found' });

  if (theatre.shows) {
    theatre.shows = theatre.shows.filter(s => s.id !== req.params.showId);
  }
  res.json(theatre);
});

// Scoped Seat Block/Unblock
app.get('/api/theatres/:theatreId/screens/:screenId/blocked-seats', (req, res) => {
  const key = `${req.params.theatreId}_${req.params.screenId}`;
  const blockedSeats = cinemaScreenBlockedSeatsMap[key] || [];
  res.json({ theatreId: req.params.theatreId, screenId: req.params.screenId, blockedSeats });
});

app.post('/api/theatres/:theatreId/screens/:screenId/toggle-seat-block', (req, res) => {
  const { seatId } = req.body;
  if (!seatId) return res.status(400).json({ error: 'Seat ID required' });

  const key = `${req.params.theatreId}_${req.params.screenId}`;
  if (!cinemaScreenBlockedSeatsMap[key]) {
    cinemaScreenBlockedSeatsMap[key] = [];
  }

  const list = cinemaScreenBlockedSeatsMap[key];
  const exists = list.includes(seatId);
  if (exists) {
    cinemaScreenBlockedSeatsMap[key] = list.filter(s => s !== seatId);
  } else {
    cinemaScreenBlockedSeatsMap[key].push(seatId);
  }

  res.json({
    key,
    theatreId: req.params.theatreId,
    screenId: req.params.screenId,
    blockedSeats: cinemaScreenBlockedSeatsMap[key]
  });
});

// -------------------------------------------------------------
// PRIVATE THEATRE BOOKING & DOUBLE-BOOKING PREVENTION ENDPOINTS
// -------------------------------------------------------------

app.get('/api/private-theatre/bookings', (req, res) => {
  res.json(privateTheatreBookings);
});

app.get('/api/private-theatre/check-availability', (req, res) => {
  const { theatreId, showId, date } = req.query;
  if (!theatreId || !showId) {
    return res.status(400).json({ error: 'Theatre ID and Show ID are required' });
  }

  const dateMatch = date || '28 Jul';
  const existing = privateTheatreBookings.find(b => 
    b.theatreId === theatreId && 
    b.showId === showId && 
    (b.date === dateMatch || !date)
  );

  if (existing) {
    return res.json({ isBooked: true, booking: existing });
  }
  return res.json({ isBooked: false, booking: null });
});

app.post('/api/private-theatre/book', (req, res) => {
  const { 
    theatreId, theatreName, showId, movieId, movieTitle, 
    format, date, time, duration, screenName, price, paymentMethod, 
    userEmail, userName 
  } = req.body;

  if (!theatreId || !showId) {
    return res.status(400).json({ error: 'Theatre ID and Show ID required' });
  }

  const dateMatch = date || '28 Jul';
  // Double-booking check
  const alreadyBooked = privateTheatreBookings.find(b => 
    b.theatreId === theatreId && 
    b.showId === showId && 
    b.date === dateMatch
  );

  if (alreadyBooked) {
    return res.status(409).json({ 
      error: 'Double booking error: This theatre show slot is already reserved for a private screening!',
      booking: alreadyBooked
    });
  }

  const bookingId = `PRIV-TH-${Math.floor(100000 + Math.random() * 900000)}`;
  const transactionId = `TXN-PAY-${Math.floor(1000000 + Math.random() * 9000000)}`;

  const newPrivateBooking = {
    id: bookingId,
    transactionId,
    theatreId,
    theatreName: theatreName || 'PVR Ultra Luxury',
    showId,
    movieId: movieId || 'mov_1',
    movieTitle: movieTitle || 'Avatar: Fire and Ash',
    format: format || 'IMAX 3D',
    date: dateMatch,
    time: time || '10:30 AM',
    duration: duration || '3h 12m',
    screenName: screenName || 'Screen 1 - VIP IMAX',
    totalPrice: Number(price || 15000),
    paymentMethod: paymentMethod || 'UPI (Instant)',
    status: 'CONFIRMED',
    userEmail: userEmail || 'guest@primeshow.com',
    userName: userName || 'VIP Guest',
    createdAt: new Date().toISOString()
  };

  privateTheatreBookings.unshift(newPrivateBooking);
  bookings.unshift(newPrivateBooking);

  res.status(201).json(newPrivateBooking);
});

// -------------------------------------------------------------
// EVENTS & FESTIVALS CRUD ENDPOINTS
// -------------------------------------------------------------

app.get('/api/events', (req, res) => {
  res.json(events);
});

app.get('/api/events/:id', (req, res) => {
  const event = events.find(e => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json(event);
});

app.post('/api/events', (req, res) => {
  const { title, category, badge, venue, city, date, time, price, totalCapacity, availableSeats, image, description } = req.body;
  if (!title || !venue || !price) {
    return res.status(400).json({ error: 'Title, venue and ticket price are required' });
  }

  const newEvent = {
    id: `ev_${Date.now()}`,
    title,
    category: category || 'Live Concert',
    badge: badge || 'SELLING FAST',
    venue,
    city: city || 'Mumbai',
    date: date || '18 JAN 2027',
    time: time || '07:00 PM',
    price: Number(price || 1500),
    totalCapacity: Number(totalCapacity || 5000),
    availableSeats: Number(availableSeats || totalCapacity || 5000),
    image: image || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
    description: description || 'Exclusive live event experience hosted on PrimeShow.'
  };

  events.unshift(newEvent);
  res.status(201).json(newEvent);
});

app.put('/api/events/:id', (req, res) => {
  const index = events.findIndex(e => e.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Event not found' });

  events[index] = {
    ...events[index],
    ...req.body
  };

  res.json(events[index]);
});

app.delete('/api/events/:id', (req, res) => {
  const index = events.findIndex(e => e.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Event not found' });
  const deleted = events.splice(index, 1);
  res.json({ message: 'Event deleted', event: deleted[0] });
});

app.post('/api/events/book', (req, res) => {
  const { eventId, ticketCount, paymentMethod, userEmail, userName } = req.body;
  const event = events.find(e => e.id === eventId);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const count = Number(ticketCount || 1);
  if (event.availableSeats < count) {
    return res.status(400).json({ error: 'Insufficient seats available for this event' });
  }

  // Deduct available seats
  event.availableSeats -= count;

  const bookingId = `EV-PASS-${Math.floor(100000 + Math.random() * 900000)}`;
  const transactionId = `TXN-PAY-${Math.floor(1000000 + Math.random() * 9000000)}`;
  const totalPrice = event.price * count;

  const newBooking = {
    id: bookingId,
    transactionId,
    eventId: event.id,
    eventTitle: event.title,
    category: event.category,
    venue: event.venue,
    city: event.city,
    date: event.date,
    time: event.time,
    ticketCount: count,
    pricePerTicket: event.price,
    totalAmount: totalPrice,
    paymentMethod: paymentMethod || 'UPI (Jay Hiralal Radadiya)',
    userEmail: userEmail || 'guest@primeshow.com',
    userName: userName || 'VIP Guest',
    status: 'CONFIRMED',
    createdAt: new Date().toISOString()
  };

  eventBookings.unshift(newBooking);
  bookings.unshift(newBooking);

  res.status(201).json(newBooking);
});

// -------------------------------------------------------------
// PLAYS & THEATER SHOWS CRUD ENDPOINTS
// -------------------------------------------------------------

app.get('/api/plays', (req, res) => {
  res.json(plays);
});

app.get('/api/plays/:id', (req, res) => {
  const play = plays.find(p => p.id === req.params.id);
  if (!play) return res.status(404).json({ error: 'Play not found' });
  res.json(play);
});

app.post('/api/plays', (req, res) => {
  const { title, language, category, badge, venue, city, date, time, price, totalCapacity, availableSeats, image, description } = req.body;
  if (!title || !venue || !price) {
    return res.status(400).json({ error: 'Title, venue and ticket price are required' });
  }

  const newPlay = {
    id: `pl_${Date.now()}`,
    title,
    language: language || 'Hindi',
    category: category || 'Drama',
    badge: badge || 'HOT SELLER',
    venue,
    city: city || 'Mumbai',
    date: date || '14 FEB 2027',
    time: time || '08:00 PM',
    price: Number(price || 500),
    totalCapacity: Number(totalCapacity || 1000),
    availableSeats: Number(availableSeats || totalCapacity || 1000),
    image: image || 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80',
    description: description || 'Exclusive theatrical play performance on PrimeShow.'
  };

  plays.unshift(newPlay);
  res.status(201).json(newPlay);
});

app.put('/api/plays/:id', (req, res) => {
  const index = plays.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Play not found' });

  plays[index] = {
    ...plays[index],
    ...req.body
  };

  res.json(plays[index]);
});

app.delete('/api/plays/:id', (req, res) => {
  const index = plays.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Play not found' });
  const deleted = plays.splice(index, 1);
  res.json({ message: 'Play deleted', play: deleted[0] });
});

app.post('/api/plays/book', (req, res) => {
  const { playId, ticketCount, paymentMethod, userEmail, userName } = req.body;
  const play = plays.find(p => p.id === playId);
  if (!play) return res.status(404).json({ error: 'Play not found' });

  const count = Number(ticketCount || 1);
  if (play.availableSeats < count) {
    return res.status(400).json({ error: 'Insufficient seats available for this play' });
  }

  // Deduct available seats in real-time
  play.availableSeats -= count;

  const bookingId = `PLAY-PASS-${Math.floor(100000 + Math.random() * 900000)}`;
  const transactionId = `TXN-PAY-${Math.floor(1000000 + Math.random() * 9000000)}`;
  const totalPrice = play.price * count;

  const newBooking = {
    id: bookingId,
    transactionId,
    playId: play.id,
    playTitle: play.title,
    language: play.language,
    category: play.category,
    venue: play.venue,
    city: play.city,
    date: play.date,
    time: play.time,
    ticketCount: count,
    pricePerTicket: play.price,
    totalAmount: totalPrice,
    paymentMethod: paymentMethod || 'UPI (Jay Hiralal Radadiya)',
    userEmail: userEmail || 'guest@primeshow.com',
    userName: userName || 'VIP Guest',
    status: 'CONFIRMED',
    createdAt: new Date().toISOString()
  };

  playBookings.unshift(newBooking);
  bookings.unshift(newBooking);

  res.status(201).json(newBooking);
});

// -------------------------------------------------------------
// OFFERS ENDPOINTS
// -------------------------------------------------------------

app.get('/api/offers', (req, res) => {
  res.json(offers);
});

app.post('/api/offers', (req, res) => {
  const newOffer = {
    id: `off_${Date.now()}`,
    code: (req.body.code || 'OFFER50').toUpperCase(),
    title: req.body.title || 'Special Discount',
    description: req.body.description || 'Special promo voucher.',
    bank: req.body.bank || 'All Cards',
    discountValue: Number(req.body.discountValue || 150),
    expiryDate: req.body.expiryDate || '2026-12-31'
  };
  offers.unshift(newOffer);
  res.status(201).json(newOffer);
});

app.put('/api/offers/:id', (req, res) => {
  const index = offers.findIndex(o => o.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Offer not found' });
  offers[index] = { ...offers[index], ...req.body };
  res.json(offers[index]);
});

app.delete('/api/offers/:id', (req, res) => {
  const index = offers.findIndex(o => o.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Offer not found' });
  offers.splice(index, 1);
  res.json({ message: 'Offer deleted' });
});

// -------------------------------------------------------------
// OFFER SLIDE SHOW BANNERS CRUD ENDPOINTS
// -------------------------------------------------------------

app.get('/api/offers/banners', (req, res) => {
  res.json(offerBanners);
});

app.post('/api/offers/banners', (req, res) => {
  const { title, tagline, code, category, categoryBadge, image, expiryDate, ctaText, ctaLink } = req.body;
  if (!title || !code) {
    return res.status(400).json({ error: 'Title and promo code are required' });
  }

  const newBanner = {
    id: `ban_${Date.now()}`,
    title,
    tagline: tagline || 'Exclusive promotional discount on PrimeShow.',
    code: code.toUpperCase(),
    category: category || 'Movies',
    categoryBadge: categoryBadge || `🎬 ${category || 'MOVIES'} SPECIAL`,
    image: image || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80',
    expiryDate: expiryDate || '2026-12-31',
    ctaText: ctaText || 'Claim Offer',
    ctaLink: ctaLink || 'movies'
  };

  offerBanners.unshift(newBanner);
  res.status(201).json(newBanner);
});

app.put('/api/offers/banners/:id', (req, res) => {
  const index = offerBanners.findIndex(b => b.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Offer banner slide not found' });
  offerBanners[index] = { ...offerBanners[index], ...req.body };
  res.json(offerBanners[index]);
});

app.delete('/api/offers/banners/:id', (req, res) => {
  const index = offerBanners.findIndex(b => b.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Offer banner slide not found' });
  const deleted = offerBanners.splice(index, 1);
  res.json({ message: 'Banner slide deleted', banner: deleted[0] });
});

// -------------------------------------------------------------
// WHATSAPP SUPPORT & BOOKINGS
// -------------------------------------------------------------

app.get('/api/support/messages', (req, res) => {
  res.json(supportMessages);
});

app.post('/api/support/messages', (req, res) => {
  const { subject, message, userName, userEmail } = req.body;
  const newMsg = {
    id: `msg_${Date.now()}`,
    userId: req.body.userId || 'usr_1',
    userName: userName || 'Customer',
    userEmail: userEmail || 'customer@primeshow.com',
    subject: subject || 'General Query',
    message: message || 'Hello Admin Support!',
    reply: null,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  supportMessages.unshift(newMsg);
  res.status(201).json(newMsg);
});

app.put('/api/support/messages/:id/reply', (req, res) => {
  const msg = supportMessages.find(m => m.id === req.params.id);
  if (!msg) return res.status(404).json({ error: 'Message not found' });
  msg.reply = req.body.reply;
  msg.status = 'replied';
  res.json(msg);
});

app.post('/api/bookings/create', (req, res) => {
  const { showId, seats, tier, totalAmount, paymentMethod } = req.body;

  const orderId = `ORD-${Date.now()}`;
  const transactionId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;

  const newBooking = {
    id: orderId,
    transactionId,
    showId: showId || 'sh_101',
    seats: seats || ['C4'],
    tier: tier || 'Recliner',
    totalAmount: totalAmount || 480,
    paymentMethod: paymentMethod || 'UPI (Instant)',
    status: 'CONFIRMED',
    createdAt: new Date().toISOString()
  };

  bookings.unshift(newBooking);
  res.status(201).json(newBooking);
});

// -------------------------------------------------------------
// ACTIVITIES & THEME PARKS CRUD ENDPOINTS
// -------------------------------------------------------------

app.get('/api/activities', (req, res) => {
  res.json(activities);
});

app.get('/api/activities/:id', (req, res) => {
  const activity = activities.find(a => a.id === req.params.id);
  if (!activity) return res.status(404).json({ error: 'Activity pass not found' });
  res.json(activity);
});

app.post('/api/activities', (req, res) => {
  const { title, category, badge, location, city, validity, price, totalCapacity, availableSeats, benefits, image, description } = req.body;
  if (!title || !location || !price) {
    return res.status(400).json({ error: 'Title, location and pass price are required' });
  }

  const newActivity = {
    id: `act_${Date.now()}`,
    title,
    category: category || 'Water Park',
    badge: badge || 'UNLIMITED ACCESS',
    location,
    city: city || 'Mumbai',
    validity: validity || 'Full Day Pass (10:00 AM - 07:00 PM)',
    price: Number(price || 999),
    totalCapacity: Number(totalCapacity || 1000),
    availableSeats: Number(availableSeats || totalCapacity || 1000),
    benefits: Array.isArray(benefits) ? benefits : (benefits ? benefits.split(',').map(b => b.trim()) : ['Unlimited Rides', 'Free Entry']),
    image: image || 'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?auto=format&fit=crop&w=800&q=80',
    description: description || 'Exclusive activity adventure pass on PrimeShow.'
  };

  activities.unshift(newActivity);
  res.status(201).json(newActivity);
});

app.put('/api/activities/:id', (req, res) => {
  const index = activities.findIndex(a => a.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Activity pass not found' });

  const updated = {
    ...activities[index],
    ...req.body
  };

  if (typeof req.body.benefits === 'string') {
    updated.benefits = req.body.benefits.split(',').map(b => b.trim());
  }

  activities[index] = updated;
  res.json(activities[index]);
});

app.delete('/api/activities/:id', (req, res) => {
  const index = activities.findIndex(a => a.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Activity pass not found' });
  const deleted = activities.splice(index, 1);
  res.json({ message: 'Activity pass deleted', activity: deleted[0] });
});

app.post('/api/activities/book', (req, res) => {
  const { activityId, ticketCount, paymentMethod, userEmail, userName } = req.body;
  const activity = activities.find(a => a.id === activityId);
  if (!activity) return res.status(404).json({ error: 'Activity pass not found' });

  const count = Number(ticketCount || 1);
  if (activity.availableSeats < count) {
    return res.status(400).json({ error: 'Insufficient passes available for this activity' });
  }

  // Deduct available seats in real-time
  activity.availableSeats -= count;

  const bookingId = `ACT-PASS-${Math.floor(100000 + Math.random() * 900000)}`;
  const transactionId = `TXN-PAY-${Math.floor(1000000 + Math.random() * 9000000)}`;
  const totalPrice = activity.price * count;

  const newBooking = {
    id: bookingId,
    transactionId,
    activityId: activity.id,
    activityTitle: activity.title,
    category: activity.category,
    location: activity.location,
    city: activity.city,
    validity: activity.validity,
    benefits: activity.benefits || [],
    ticketCount: count,
    pricePerTicket: activity.price,
    totalAmount: totalPrice,
    paymentMethod: paymentMethod || 'UPI (Jay Hiralal Radadiya)',
    userEmail: userEmail || 'guest@primeshow.com',
    userName: userName || 'VIP Guest',
    status: 'CONFIRMED',
    createdAt: new Date().toISOString()
  };

  activityBookings.unshift(newBooking);
  bookings.unshift(newBooking);

  res.status(201).json(newBooking);
});

app.listen(PORT, async () => {
  console.log(`🚀 PrimeShow REST API Backend running on http://localhost:${PORT}`);
  await connectDB();
});

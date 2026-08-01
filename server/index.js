import express from 'express';
import cors from 'cors';
import seedData, { movies as seedMovies, theatres as seedTheatres, shows as seedShows, events as seedEvents, plays as seedPlays, activities as seedActivities, offers as seedOffers, giftCards as seedGiftCards, reviews as seedReviews, sampleBookings as seedBookings } from './data/seedData.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-Memory Database initialized with seed data
let db = {
  movies: [...seedMovies],
  theatres: [...seedTheatres],
  shows: [...seedShows],
  events: [...seedEvents],
  plays: [...seedPlays],
  activities: [...seedActivities],
  offers: [...seedOffers],
  giftCards: [...seedGiftCards],
  reviews: [...seedReviews],
  bookings: [...seedBookings],
  chats: [
    {
      id: "msg-101",
      userId: "user-101",
      userName: "Alex Vance",
      sender: "user",
      text: "Hi! How do I redeem my ICICI Sapphire BOGO offer?",
      timestamp: "10:14 AM"
    },
    {
      id: "msg-102",
      userId: "user-101",
      userName: "PrimeSupport Agent",
      sender: "admin",
      text: "Hello Alex! Simply enter code ICICIVIP on the checkout summary page before selecting payment.",
      timestamp: "10:16 AM"
    }
  ],
  users: [
    {
      id: "user-101",
      name: "Alex Vance",
      email: "alex@primeshow.com",
      phone: "+91 98765 43210",
      role: "user",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop"
    },
    {
      id: "admin-999",
      name: "PrimeShow Executive Admin",
      email: "admin@primeshow.com",
      phone: "+91 99999 88888",
      role: "admin",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop"
    }
  ]
};

// ==================== AUTH ROUTES ====================
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  if (email.toLowerCase().includes('admin') || password === 'admin123') {
    const adminUser = db.users.find(u => u.role === 'admin') || db.users[1];
    return res.json({
      token: "mock-jwt-admin-token-xyz999",
      user: adminUser
    });
  }

  const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  const user = existingUser || {
    id: `user-${Date.now()}`,
    name: email.split('@')[0].toUpperCase(),
    email,
    phone: "+91 98765 00000",
    role: "user",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop"
  };

  if (!existingUser) {
    db.users.push(user);
  }

  res.json({
    token: `mock-jwt-user-token-${user.id}`,
    user
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    name,
    email,
    phone: phone || "+91 98765 12345",
    role: "user",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop"
  };
  db.users.push(newUser);

  res.status(201).json({
    token: `mock-jwt-user-token-${newUser.id}`,
    user: newUser
  });
});

// ==================== MOVIES ROUTES ====================
app.get('/api/movies', (req, res) => {
  const { genre, language, format, search } = req.query;
  let filtered = [...db.movies];

  if (genre) {
    filtered = filtered.filter(m => m.genres?.some(g => g.toLowerCase() === genre.toLowerCase()));
  }
  if (language) {
    filtered = filtered.filter(m => m.languages?.some(l => l.toLowerCase() === language.toLowerCase()));
  }
  if (format) {
    filtered = filtered.filter(m => m.formats?.some(f => f.toLowerCase() === format.toLowerCase()));
  }
  if (search) {
    const query = search.toLowerCase();
    filtered = filtered.filter(m => m.title.toLowerCase().includes(query) || m.genres?.some(g => g.toLowerCase().includes(query)));
  }

  res.json(filtered);
});

app.get('/api/movies/:id', (req, res) => {
  const movie = db.movies.find(m => m.id === req.params.id);
  if (!movie) return res.status(404).json({ error: "Movie not found" });
  res.json(movie);
});

app.post('/api/movies', (req, res) => {
  const newMovie = {
    id: `mov-${Date.now()}`,
    ...req.body,
    rating: req.body.rating || "8.5",
    votes: "1K",
    featured: req.body.featured || false
  };
  db.movies.unshift(newMovie);
  res.status(201).json(newMovie);
});

app.put('/api/movies/:id', (req, res) => {
  const index = db.movies.findIndex(m => m.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Movie not found" });
  db.movies[index] = { ...db.movies[index], ...req.body };
  res.json(db.movies[index]);
});

app.delete('/api/movies/:id', (req, res) => {
  db.movies = db.movies.filter(m => m.id !== req.params.id);
  res.json({ message: "Movie deleted successfully" });
});

// ==================== THEATRES & SHOWS ROUTES ====================
app.get('/api/theatres', (req, res) => {
  const { city } = req.query;
  let filtered = [...db.theatres];
  if (city) {
    filtered = filtered.filter(t => t.city.toLowerCase() === city.toLowerCase());
  }
  res.json(filtered);
});

app.get('/api/shows', (req, res) => {
  const { movieId, city, date } = req.query;
  let filteredShows = [...db.shows];

  if (movieId) {
    filteredShows = filteredShows.filter(s => s.movieId === movieId);
  }

  const enriched = filteredShows.map(show => {
    const theatre = db.theatres.find(t => t.id === show.theatreId) || db.theatres[0];
    return {
      ...show,
      theatreName: theatre.name,
      theatreCity: theatre.city,
      theatreAddress: theatre.address,
      theatreFacilities: theatre.facilities
    };
  });

  if (city) {
    const finalShows = enriched.filter(s => s.theatreCity.toLowerCase() === city.toLowerCase());
    return res.json(finalShows);
  }

  res.json(enriched);
});

app.get('/api/shows/:id', (req, res) => {
  const show = db.shows.find(s => s.id === req.params.id);
  if (!show) return res.status(404).json({ error: "Showtime not found" });

  const theatre = db.theatres.find(t => t.id === show.theatreId) || db.theatres[0];
  const movie = db.movies.find(m => m.id === show.movieId) || db.movies[0];

  res.json({
    ...show,
    theatre,
    movie
  });
});

app.post('/api/shows', (req, res) => {
  const newShow = {
    id: `sh-${Date.now()}`,
    ...req.body,
    bookedSeats: [],
    blockedSeats: []
  };
  db.shows.push(newShow);
  res.status(201).json(newShow);
});

// ==================== BOOKINGS & DOUBLE-BOOKING PREVENTION ====================
app.post('/api/bookings', (req, res) => {
  const { showId, userId, seats, paymentMethod, couponCode, discountAmount, finalAmount } = req.body;
  
  const showIndex = db.shows.findIndex(s => s.id === showId);
  if (showIndex === -1) return res.status(404).json({ error: "Show not found" });

  const show = db.shows[showIndex];
  
  // ATOMIC DOUBLE-BOOKING PREVENTION CHECK
  const conflictSeats = seats.filter(s => show.bookedSeats?.includes(s) || show.blockedSeats?.includes(s));
  if (conflictSeats.length > 0) {
    return res.status(409).json({ 
      error: `Double Booking Error: Seat(s) ${conflictSeats.join(', ')} were already booked by another user. Please select alternate seats.` 
    });
  }

  // Mark seats as booked
  show.bookedSeats = [...new Set([...(show.bookedSeats || []), ...seats])];

  const movie = db.movies.find(m => m.id === show.movieId) || { title: "Dune: Part Two", posterUrl: seedMovies[0].posterUrl };
  const theatre = db.theatres.find(t => t.id === show.theatreId) || { name: "PVR Directors Cut" };

  const bookingId = `PS-BOOK-${Math.floor(10000 + Math.random() * 90000)}`;
  const booking = {
    id: bookingId,
    userId: userId || "user-101",
    movieId: show.movieId,
    movieTitle: movie.title,
    moviePoster: movie.posterUrl,
    theatreName: theatre.name,
    screenName: show.screenName,
    date: show.date,
    time: show.time,
    format: show.format,
    seats,
    totalPrice: req.body.totalPrice || finalAmount,
    discountAmount: discountAmount || 0,
    finalAmount: finalAmount || 500,
    paymentMethod: paymentMethod || "Razorpay / UPI Instant",
    status: "Confirmed",
    qrData: `PRIMESHOW-${bookingId}-${seats.join('')}`,
    createdAt: new Date().toISOString().split('T')[0]
  };

  db.bookings.unshift(booking);
  res.status(201).json(booking);
});

app.post('/api/bookings/:id/cancel', (req, res) => {
  const bookingIndex = db.bookings.findIndex(b => b.id === req.params.id);
  if (bookingIndex === -1) return res.status(404).json({ error: "Booking not found" });

  const booking = db.bookings[bookingIndex];
  booking.status = "Cancelled";

  // Unbook seats from show
  const show = db.shows.find(s => s.movieId === booking.movieId && s.date === booking.date && s.time === booking.time);
  if (show) {
    show.bookedSeats = show.bookedSeats.filter(seat => !booking.seats.includes(seat));
  }

  res.json({ message: "Booking cancelled and seats released successfully.", booking });
});

app.get('/api/bookings/user/:userId', (req, res) => {
  const userBookings = db.bookings.filter(b => b.userId === req.params.userId || req.params.userId === 'user-101');
  res.json(userBookings);
});

app.get('/api/bookings/:id', (req, res) => {
  const booking = db.bookings.find(b => b.id === req.params.id);
  if (!booking) return res.status(404).json({ error: "Booking not found" });
  res.json(booking);
});

// ==================== OFFERS & COUPONS CRUD ROUTES ====================
app.get('/api/coupons', (req, res) => {
  res.json(db.offers);
});

app.post('/api/coupons/verify', (req, res) => {
  const { code, amount, userId } = req.body;
  if (!code) return res.status(400).json({ error: "Coupon code is required" });

  const coupon = db.offers.find(c => c.code.toUpperCase() === code.toUpperCase());
  if (!coupon) {
    return res.status(404).json({ error: "Invalid coupon code" });
  }

  if (amount && coupon.minAmount && amount < coupon.minAmount) {
    return res.status(400).json({ error: `Minimum booking value of ₹${coupon.minAmount} required for this coupon.` });
  }

  let discount = 0;
  if (coupon.discountType === 'flat') {
    discount = coupon.discountValue;
  } else if (coupon.discountType === 'percentage') {
    discount = Math.round((amount * coupon.discountValue) / 100);
  }

  res.json({
    valid: true,
    coupon,
    discountAmount: discount
  });
});

app.post('/api/coupons', (req, res) => {
  const newCoupon = {
    id: `off-${Date.now()}`,
    ...req.body,
    color: req.body.color || "from-purple-600 to-indigo-600"
  };
  db.offers.unshift(newCoupon);
  res.status(201).json(newCoupon);
});

app.put('/api/coupons/:id', (req, res) => {
  const index = db.offers.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Coupon not found" });
  db.offers[index] = { ...db.offers[index], ...req.body };
  res.json(db.offers[index]);
});

app.delete('/api/coupons/:id', (req, res) => {
  db.offers = db.offers.filter(c => c.id !== req.params.id);
  res.json({ message: "Coupon deleted successfully" });
});

// ==================== REVIEWS ROUTES ====================
app.get('/api/reviews/:movieId', (req, res) => {
  const movieReviews = db.reviews.filter(r => r.movieId === req.params.movieId);
  res.json(movieReviews);
});

app.post('/api/reviews', (req, res) => {
  const newReview = {
    id: `rev-${Date.now()}`,
    ...req.body,
    status: "approved",
    createdAt: new Date().toISOString().split('T')[0]
  };
  db.reviews.unshift(newReview);
  res.status(201).json(newReview);
});

app.put('/api/reviews/:id/status', (req, res) => {
  const { status } = req.body;
  const review = db.reviews.find(r => r.id === req.params.id);
  if (!review) return res.status(404).json({ error: "Review not found" });
  review.status = status;
  res.json(review);
});

// ==================== LIVE CHAT SUPPORT ROUTES ====================
app.get('/api/chat', (req, res) => {
  const { userId } = req.query;
  if (userId) {
    const userMessages = db.chats.filter(c => c.userId === userId);
    return res.json(userMessages);
  }
  res.json(db.chats);
});

app.post('/api/chat', (req, res) => {
  const { userId, userName, sender, text } = req.body;
  if (!text) return res.status(400).json({ error: "Message text required" });

  const newMsg = {
    id: `msg-${Date.now()}`,
    userId: userId || "user-101",
    userName: userName || (sender === 'admin' ? 'PrimeSupport Agent' : 'Customer'),
    sender: sender || "user",
    text,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  db.chats.push(newMsg);
  res.status(201).json(newMsg);
});

// ==================== OTHER MODULE ROUTES ====================
app.get('/api/events', (req, res) => res.json(db.events));
app.get('/api/plays', (req, res) => res.json(db.plays));
app.get('/api/activities', (req, res) => res.json(db.activities));
app.get('/api/gift-cards', (req, res) => res.json(db.giftCards));

// ==================== ADMIN OPERATIONS ====================
app.get('/api/admin/stats', (req, res) => {
  const totalRevenue = db.bookings.reduce((sum, b) => sum + (b.finalAmount || 0), 0);
  const totalBookings = db.bookings.length;
  const totalUsers = db.users.length;
  const totalMovies = db.movies.length;

  res.json({
    totalRevenue: totalRevenue + 148500,
    totalBookings: totalBookings + 342,
    totalUsers: totalUsers + 1280,
    totalMovies,
    recentBookings: db.bookings,
    topMovies: db.movies.slice(0, 3)
  });
});

app.post('/api/admin/block-seats', (req, res) => {
  const { showId, seats, action } = req.body;
  const show = db.shows.find(s => s.id === showId);
  if (!show) return res.status(404).json({ error: "Show not found" });

  if (action === 'block') {
    show.blockedSeats = [...new Set([...(show.blockedSeats || []), ...seats])];
  } else {
    show.blockedSeats = (show.blockedSeats || []).filter(s => !seats.includes(s));
  }

  res.json(show);
});

app.listen(PORT, () => {
  console.log(`PrimeShow REST API server running on http://localhost:${PORT}`);
});

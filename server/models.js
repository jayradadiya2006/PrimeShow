// PrimeShow Mongoose Schemas for MongoDB Atlas
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  username: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  phone: { type: String },
  altPhone: { type: String, default: '' },
  whatsappPhone: { type: String, default: '' },
  gender: { type: String, default: 'Male' },
  city: { type: String, default: 'Mumbai' },
  dob: { type: String, default: '1998-05-15' },
  role: { type: String, enum: ['ADMIN', 'CUSTOMER'], default: 'CUSTOMER' },
  rewardsPoints: { type: Number, default: 500 },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80' },
  provider: { type: String, default: 'LOCAL' },
  googleId: { type: String, default: '' }
}, { timestamps: true });

const MovieSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  tagline: { type: String, default: '' },
  synopsis: { type: String, default: '' },
  duration: { type: String, default: '2h 30m' },
  rating: { type: Number, default: 9.0 },
  votesCount: { type: Number, default: 100 },
  parentalRating: { type: String, default: 'UA' },
  releaseDate: { type: String, default: '2026-08-01' },
  genres: [{ type: String }],
  languages: [{ type: String }],
  formats: [{ type: String }],
  poster: { type: String },
  banner: { type: String },
  trailerUrl: { type: String },
  director: { type: String },
  cast: [{
    id: String,
    name: String,
    role: String,
    photo: String
  }],
  status: { type: String, default: 'Now Showing' },
  featured: { type: Boolean, default: true }
}, { timestamps: true });

const TheatreSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, default: 'Maharashtra' },
  address: { type: String, required: true },
  logo: { type: String },
  image: { type: String },
  facilities: [{ type: String }],
  screensCount: { type: Number, default: 6 },
  totalSeats: { type: Number, default: 200 },
  screens: [{
    id: String,
    name: String,
    formats: [String],
    totalSeats: Number
  }],
  shows: [{
    id: String,
    movieId: String,
    movieTitle: String,
    screenId: String,
    screenName: String,
    format: String,
    time: String,
    price: Number
  }]
}, { timestamps: true });

const BookingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  transactionId: { type: String },
  showId: { type: String },
  movieId: { type: String },
  movieTitle: { type: String },
  theatreId: { type: String },
  theatreName: { type: String },
  screenName: { type: String },
  date: { type: String },
  time: { type: String },
  seats: [{ type: String }],
  tier: { type: String },
  totalAmount: { type: Number },
  paymentMethod: { type: String },
  userEmail: { type: String },
  userName: { type: String },
  status: { type: String, default: 'CONFIRMED' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const PrivateTheatreBookingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  transactionId: { type: String },
  theatreId: { type: String },
  theatreName: { type: String },
  showId: { type: String },
  movieId: { type: String },
  movieTitle: { type: String },
  format: { type: String },
  date: { type: String },
  time: { type: String },
  duration: { type: String },
  screenName: { type: String },
  totalPrice: { type: Number },
  paymentMethod: { type: String },
  status: { type: String, default: 'CONFIRMED' },
  userEmail: { type: String },
  userName: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const EventSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String },
  badge: { type: String },
  venue: { type: String },
  city: { type: String },
  date: { type: String },
  time: { type: String },
  price: { type: Number },
  totalCapacity: { type: Number },
  availableSeats: { type: Number },
  image: { type: String },
  description: { type: String }
}, { timestamps: true });

const PlaySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  language: { type: String },
  category: { type: String },
  badge: { type: String },
  venue: { type: String },
  city: { type: String },
  date: { type: String },
  time: { type: String },
  price: { type: Number },
  totalCapacity: { type: Number },
  availableSeats: { type: Number },
  image: { type: String },
  description: { type: String }
}, { timestamps: true });

const ActivitySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String },
  badge: { type: String },
  location: { type: String },
  city: { type: String },
  validity: { type: String },
  price: { type: Number },
  totalCapacity: { type: Number },
  availableSeats: { type: Number },
  benefits: [{ type: String }],
  image: { type: String },
  description: { type: String }
}, { timestamps: true });

const OfferSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  code: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  bank: { type: String },
  discountValue: { type: Number },
  expiryDate: { type: String }
}, { timestamps: true });

const OfferBannerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  tagline: { type: String },
  code: { type: String },
  category: { type: String },
  categoryBadge: { type: String },
  image: { type: String },
  expiryDate: { type: String },
  ctaText: { type: String },
  ctaLink: { type: String }
}, { timestamps: true });

const SupportMessageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String },
  userName: { type: String },
  userEmail: { type: String },
  subject: { type: String },
  message: { type: String },
  reply: { type: String, default: null },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const NotificationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, default: 'SYSTEM' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const BlockedSeatSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  theatreId: { type: String, required: true },
  screenId: { type: String, required: true },
  blockedSeats: [{ type: String }]
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
const Movie = mongoose.model('Movie', MovieSchema);
const Theatre = mongoose.model('Theatre', TheatreSchema);
const Booking = mongoose.model('Booking', BookingSchema);
const PrivateTheatreBooking = mongoose.model('PrivateTheatreBooking', PrivateTheatreBookingSchema);
const Event = mongoose.model('Event', EventSchema);
const Play = mongoose.model('Play', PlaySchema);
const Activity = mongoose.model('Activity', ActivitySchema);
const Offer = mongoose.model('Offer', OfferSchema);
const OfferBanner = mongoose.model('OfferBanner', OfferBannerSchema);
const SupportMessage = mongoose.model('SupportMessage', SupportMessageSchema);
const Notification = mongoose.model('Notification', NotificationSchema);
const BlockedSeat = mongoose.model('BlockedSeat', BlockedSeatSchema);

module.exports = {
  User,
  Movie,
  Theatre,
  Booking,
  PrivateTheatreBooking,
  Event,
  Play,
  Activity,
  Offer,
  OfferBanner,
  SupportMessage,
  Notification,
  BlockedSeat
};

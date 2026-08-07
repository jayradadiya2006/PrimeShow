// PrimeShow Mongoose Schemas for MongoDB Atlas
const mongoose = require('mongoose');

const UserActivitySubSchema = new mongoose.Schema({
  action: { type: String, required: true },
  details: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  username: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  phone: { type: String },
  phoneNumber: { type: String },
  altPhone: { type: String, default: '' },
  whatsappPhone: { type: String, default: '' },
  gender: { type: String, default: 'Male' },
  city: { type: String, default: 'Surat' },
  dob: { type: String, default: '1998-05-15' },
  role: { type: String, enum: ['ADMIN', 'CUSTOMER'], default: 'CUSTOMER' },
  rewardsPoints: { type: Number, default: 500 },
  avatar: { type: String, default: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Alexander&backgroundColor=0f172a' },
  profilePicture: { type: String, default: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Alexander&backgroundColor=0f172a' },
  provider: { type: String, default: 'LOCAL' },
  authProvider: { type: String, default: 'email' },
  googleId: { type: String, default: '' },
  isOnline: { type: Boolean, default: false },
  lastLoginTime: { type: Date, default: Date.now },
  lastLogoutTime: { type: Date },
  lastActive: { type: Date, default: Date.now },
  wishlist: [{ type: String }],
  claimedOffers: [{ type: String }],
  activityLogs: [UserActivitySubSchema]
}, { timestamps: true });

const UserActivityLogSchema = new mongoose.Schema({
  id: { type: String, required: true },
  userId: { type: String },
  userEmail: { type: String, required: true },
  userName: { type: String, default: 'User' },
  action: { type: String, required: true },
  details: { type: String, default: '' },
  metadata: { type: Object, default: {} },
  timestamp: { type: Date, default: Date.now }
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
  mapLocationUrl: { type: String, default: '' },
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
  userId: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  category: { type: String, default: 'Movie' }, // 'Movie' | 'Theatre' | 'Event' | 'Play' | 'Activity'
  title: { type: String },
  movieTitle: { type: String },
  showId: { type: String },
  movieId: { type: String },
  theatreId: { type: String },
  theatreName: { type: String },
  screenName: { type: String },
  date: { type: String },
  slotDate: { type: String },
  time: { type: String },
  showTime: { type: String },
  seats: [{ type: String }],
  seatsBooked: [{ type: String }],
  tier: { type: String },
  totalAmount: { type: Number },
  paymentMethod: { type: String },
  userEmail: { type: String },
  userName: { type: String },
  status: { type: String, default: 'CONFIRMED' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Mongoose Indexes for Heavy Load Query Optimization
UserSchema.index({ email: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ lastLoginTime: -1 });

BookingSchema.index({ userEmail: 1 });
BookingSchema.index({ category: 1 });
BookingSchema.index({ createdAt: -1 });

UserActivityLogSchema.index({ userEmail: 1 });
UserActivityLogSchema.index({ timestamp: -1 });

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

PrivateTheatreBookingSchema.index({ userEmail: 1 });
PrivateTheatreBookingSchema.index({ createdAt: -1 });

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

const GlobalConfigSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: 'primary_config' },
  platformName: { type: String, default: 'PrimeShow Cinema & Events' },
  activeCity: { type: String, default: 'Surat' },
  maintenanceMode: { type: Boolean, default: false },
  bannerAnnouncement: { type: String, default: '⚡ Exclusive Offer: Get 50% Flat Discount on IMAX & VIP Recliner Tickets!' },
  homeBanners: [{ type: Object }],
  visualEditorLayout: { type: Object, default: {} },
  notifications: [{ type: Object }],
  activeOffers: [{ type: Object }],
  customThemeTokens: { type: Object, default: {} },
  broadcastAlert: { type: Object, default: null },
  updatedBy: { type: String, default: 'Admin Desk' }
}, { timestamps: true });

const EditorLayoutSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  section: { type: String, required: true },
  elements: [{ type: Object }],
  enabled: { type: Boolean, default: true },
  updatedBy: { type: String, default: 'Admin Desk' }
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
const UserActivityLog = mongoose.model('UserActivityLog', UserActivityLogSchema);
const BlockedSeat = mongoose.model('BlockedSeat', BlockedSeatSchema);
const GlobalConfig = mongoose.model('GlobalConfig', GlobalConfigSchema);
const EditorLayout = mongoose.model('EditorLayout', EditorLayoutSchema);

module.exports = {
  User,
  UserActivityLog,
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
  BlockedSeat,
  GlobalConfig,
  EditorLayout
};

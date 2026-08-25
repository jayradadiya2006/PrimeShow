require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

try {
  mongoose.set('returnDocument', 'after');
} catch (e) {}
mongoose.set('bufferCommands', false);

const {
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
} = require('./models');

// Initial Seed Data
const initialMovies = [
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
    genres: ['Sci-Fi', 'Action', 'Adventure', 'Fantasy'],
    languages: ['English', 'Hindi', 'Tamil', 'Telugu'],
    formats: ['IMAX 3D', '4DX', 'Dolby Atmos', '3D', '2D'],
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    banner: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80',
    trailerUrl: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081127_0992a171-d3c6-4978-8213-0ec5df8b6d63.mp4',
    director: 'James Cameron',
    cast: [
      { id: 'c_1', name: 'Sam Worthington', role: 'Jake Sully', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80' },
      { id: 'c_2', name: 'Zoe Saldana', role: 'Neytiri', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' },
      { id: 'c_3', name: 'Sigourney Weaver', role: 'Kiri', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80' }
    ],
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
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    languages: ['English', 'Hindi'],
    formats: ['IMAX 3D', 'Dolby Atmos', '2D'],
    poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    banner: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80',
    trailerUrl: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_092026_dd05b805-ea0f-40b2-8c52-332b88502592.mp4',
    director: 'Denis Villeneuve',
    cast: [
      { id: 'c_4', name: 'Timothée Chalamet', role: 'Paul Atreides', photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80' },
      { id: 'c_5', name: 'Zendaya', role: 'Chani', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80' }
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
    genres: ['Action', 'Sci-Fi', 'Mythology'],
    languages: ['Hindi', 'Telugu', 'Tamil'],
    formats: ['IMAX 3D', '3D', 'Dolby Atmos'],
    poster: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
    banner: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1920&q=80',
    trailerUrl: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081042_df7202bf-bd80-4b2b-bbc6-1f09ba2870e9.mp4',
    director: 'Nag Ashwin',
    cast: [
      { id: 'c_6', name: 'Prabhas', role: 'Bhairava', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80' },
      { id: 'c_7', name: 'Amitabh Bachchan', role: 'Ashwatthama', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80' }
    ],
    status: 'Now Showing',
    featured: true
  }
];

const initialTheatres = [
  {
    id: 'th_1',
    name: 'PVR Director\'s Cut, Palladium Mall',
    city: 'Mumbai',
    state: 'Maharashtra',
    address: '4th Floor, High Street Phoenix, Lower Parel, Mumbai',
    logo: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=150&q=80',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
    facilities: ['VIP Recliners', 'IMAX 3D', 'Dolby Atmos 360', 'Gourmet In-Seat Dining', 'Valet Parking'],
    screensCount: 6,
    totalSeats: 200,
    screens: [
      { id: 'sc_1', name: 'Screen 1 - Director\'s Cut IMAX 3D', formats: ['IMAX 3D', 'Dolby Atmos'], totalSeats: 120 },
      { id: 'sc_2', name: 'Screen 2 - Luxe Gold Lounge', formats: ['Dolby Atmos', '2D'], totalSeats: 80 }
    ],
    shows: [
      { id: 'sh_101', movieId: 'mov_1', movieTitle: 'Avatar: Fire and Ash', screenId: 'sc_1', screenName: 'Screen 1 - IMAX 3D', format: 'IMAX 3D', time: '10:30 AM', price: 450 },
      { id: 'sh_102', movieId: 'mov_1', movieTitle: 'Avatar: Fire and Ash', screenId: 'sc_1', screenName: 'Screen 1 - IMAX 3D', format: 'IMAX 3D', time: '02:15 PM', price: 480 },
      { id: 'sh_103', movieId: 'mov_2', movieTitle: 'Dune: Part Two', screenId: 'sc_2', screenName: 'Screen 2 - Luxe Gold Lounge', format: 'Dolby Atmos', time: '06:00 PM', price: 380 },
      { id: 'sh_104', movieId: 'mov_3', movieTitle: 'Kalki 2898 AD', screenId: 'sc_2', screenName: 'Screen 2 - Luxe Gold Lounge', format: '3D', time: '09:30 PM', price: 400 }
    ]
  },
  {
    id: 'th_2',
    name: 'INOX Megaplex, Inorbit Mall',
    city: 'Mumbai',
    state: 'Maharashtra',
    address: '3rd Floor, Link Road, Malad West, Mumbai',
    logo: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=150&q=80',
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80',
    facilities: ['IMAX 3D', 'ScreenX 270°', 'MX4D Motion Seats', 'Live Food Counters'],
    screensCount: 11,
    totalSeats: 350,
    screens: [
      { id: 'sc_3', name: 'Screen 1 - INSIGNIA 4DX', formats: ['4DX', '3D'], totalSeats: 100 },
      { id: 'sc_4', name: 'Screen 2 - Dolby Cinema', formats: ['Dolby Atmos', '2D'], totalSeats: 150 }
    ],
    shows: [
      { id: 'sh_201', movieId: 'mov_1', movieTitle: 'Avatar: Fire and Ash', screenId: 'sc_3', screenName: 'Screen 1 - INSIGNIA 4DX', format: '4DX', time: '11:00 AM', price: 500 },
      { id: 'sh_202', movieId: 'mov_2', movieTitle: 'Dune: Part Two', screenId: 'sc_4', screenName: 'Screen 2 - Dolby Cinema', format: 'Dolby Atmos', time: '03:30 PM', price: 350 }
    ]
  }
];

const initialEvents = [
  {
    id: 'ev_1',
    title: 'Coldplay: Music of the Spheres World Tour',
    category: 'Live Concert',
    badge: 'SELLING FAST',
    venue: 'DY Patil Stadium, Mumbai',
    city: 'Mumbai',
    date: '18 JAN 2027',
    time: '07:00 PM',
    price: 3500,
    totalCapacity: 50000,
    availableSeats: 12400,
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
    description: 'Experience Coldplay live in Mumbai performing classics like Yellow, Fix You, Viva La Vida, and Higher Power in an immersive LED wristband stadium experience.'
  }
];

const initialPlays = [
  {
    id: 'pl_1',
    title: 'Gujjubhai Banya Dabang',
    language: 'Gujarati',
    category: 'Comedy Drama',
    badge: 'HOT SELLER',
    venue: 'Royal Opera House, Mumbai',
    city: 'Mumbai',
    date: '14 FEB 2027',
    time: '08:00 PM',
    price: 600,
    totalCapacity: 1200,
    availableSeats: 340,
    image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80',
    description: 'Siddharth Randeria returns as the hilarious Gujjubhai in an action-packed Gujarati family comedy play that will leave you in splits!'
  }
];

const initialActivities = [
  {
    id: 'act_1',
    title: 'Imagicaa Water Park & Snow World',
    category: 'Water Park',
    badge: 'UNLIMITED ACCESS',
    location: 'Khopoli, Mumbai-Pune Expressway',
    city: 'Mumbai',
    validity: 'Full Day Pass (10:30 AM - 07:00 PM)',
    price: 1299,
    totalCapacity: 3000,
    availableSeats: 850,
    benefits: ['Unlimited Water Rides', 'Free Snow World Access', 'Wave Pool Entry', 'Complimentary Buffet Lunch'],
    image: 'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?auto=format&fit=crop&w=800&q=80',
    description: 'Experience India\'s premier international water park featuring high-thrill slides, lazy rivers, wave pools, and sub-zero snow world adventures!'
  }
];

const initialOffers = [
  {
    id: 'off_1',
    code: 'PRIMESHOW50',
    title: '50% Flat Discount on IMAX & VIP Bookings',
    description: 'Get 50% discount up to ₹250 on all luxury recliner tickets.',
    bank: 'All Cards & UPI',
    discountValue: 250,
    expiryDate: '2026-12-31'
  }
];

const initialBanners = [
  {
    id: 'ban_1',
    title: 'Buy 1 Get 1 FREE on IMAX 3D & VIP Movies',
    tagline: 'Experience Avatar: Fire & Ash in Native IMAX 3D with complimentary popcorn & recliner upgrades.',
    code: 'BOGOIMAX',
    category: 'Movies',
    categoryBadge: '🎬 MOVIES SPECIAL',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80',
    expiryDate: '2026-12-31',
    ctaText: 'Book Movie Ticket',
    ctaLink: 'movies'
  }
];

let isConnected = false;

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('❌ MONGODB_URI environment variable is missing! Missing MongoDB Atlas URI connection string.');
  }

  try {
    if (mongoose.connection.readyState === 1) {
      console.log(`>>> CONNECTED TO CLOUD DB: ${mongoose.connection.host}`);
      return true;
    }

    console.log(`🔄 Connecting strictly to MongoDB Atlas Cloud Database...`);
    await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000
    });

    isConnected = true;
    console.log(`>>> CONNECTED TO CLOUD DB: ${mongoose.connection.host}`);
    await seedDatabaseIfEmpty();
    return true;
  } catch (err) {
    console.error(`❌ MongoDB Atlas Connection Error: ${err.message}`);
    throw err;
  }
}

async function seedDatabaseIfEmpty() {
  try {
    const movieCount = await Movie.countDocuments();
    if (movieCount === 0) {
      console.log('🌱 Seeding initial Movies collection into MongoDB Atlas...');
      await Movie.insertMany(initialMovies);
    }

    const theatreCount = await Theatre.countDocuments();
    if (theatreCount === 0) {
      console.log('🌱 Seeding initial Theatres collection into MongoDB Atlas...');
      await Theatre.insertMany(initialTheatres);
    }

    const eventCount = await Event.countDocuments();
    if (eventCount === 0) {
      await Event.insertMany(initialEvents);
    }

    const playCount = await Play.countDocuments();
    if (playCount === 0) {
      await Play.insertMany(initialPlays);
    }

    const activityCount = await Activity.countDocuments();
    if (activityCount === 0) {
      await Activity.insertMany(initialActivities);
    }

    const offerCount = await Offer.countDocuments();
    if (offerCount === 0) {
      await Offer.insertMany(initialOffers);
    }

    const bannerCount = await OfferBanner.countDocuments();
    if (bannerCount === 0) {
      await OfferBanner.insertMany(initialBanners);
    }

    // Seed Users (Admin & Default Customer)
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Seeding initial Users collection into MongoDB...');
      await User.insertMany([
        {
          id: 'admin_1',
          name: 'Admin Command Desk',
          username: 'admin',
          email: 'admin@primeshow.com',
          password: 'admin123',
          phone: '+91 9999999999',
          role: 'ADMIN',
          rewardsPoints: 99999
        },
        {
          id: 'usr_1',
          name: 'Jay Hiralal Radadiya',
          username: 'jayradadiya',
          email: 'jayradadiya2006@gmail.com',
          phone: '+91 9876543210',
          role: 'CUSTOMER',
          city: 'Surat',
          rewardsPoints: 1500
        }
      ]);
    }

    // Seed Support Messages / Live Chats
    const chatCount = await SupportMessage.countDocuments();
    if (chatCount === 0) {
      console.log('🌱 Seeding initial Support Messages / Chats collection into MongoDB...');
      await SupportMessage.insertMany([
        {
          id: 'msg_welcome_1',
          userId: 'usr_1',
          userName: 'Jay Hiralal Radadiya',
          userEmail: 'jayradadiya2006@gmail.com',
          subject: 'Cinema Ticket & VIP Seating Inquiry',
          message: 'Hello PrimeShow Support! Can I upgrade my seats to VIP Recliners for Avatar: Fire and Ash?',
          reply: '🤖 [AI Assistant]: Welcome to PrimeShow VIP Support! Yes, you can upgrade your seats directly from your profile or during checkout.',
          status: 'replied',
          createdAt: new Date()
        }
      ]);
    }

  } catch (err) {
    console.warn('Seed sync error:', err.message);
  }
}

// In-Memory Fallbacks for instant zero-latency responses
const movies = [...initialMovies];
const theatres = [...initialTheatres];
const events = [...initialEvents];
const eventBookings = [];
const plays = [...initialPlays];
const playBookings = [];
const activities = [...initialActivities];
const activityBookings = [];
const offers = [...initialOffers];
const offerBanners = [...initialBanners];
const supportMessages = [];
const notifications = [];
const bookings = [];
const privateTheatreBookings = [];
const cinemaScreenBlockedSeatsMap = {
  'th_1_sc_1': ['V1', 'V2'],
  'th_1_sc_2': ['R1']
};

module.exports = {
  connectDB,
  movies,
  theatres,
  events,
  eventBookings,
  plays,
  playBookings,
  activities,
  activityBookings,
  offers,
  offerBanners,
  supportMessages,
  notifications,
  bookings,
  privateTheatreBookings,
  cinemaScreenBlockedSeatsMap
};

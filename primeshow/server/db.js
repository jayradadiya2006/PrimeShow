// PrimeShow Server In-Memory & File Persisted Seed Store

const movies = [
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

const theatres = [
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
  },
  {
    id: 'th_3',
    name: 'Cinepolis VIP, Orion Mall',
    city: 'Bengaluru',
    state: 'Karnataka',
    address: 'Dr. Rajkumar Road, Rajajinagar, Bengaluru',
    logo: 'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?auto=format&fit=crop&w=150&q=80',
    image: 'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?auto=format&fit=crop&w=800&q=80',
    facilities: ['Plush Recliners', 'Dolby Atmos', 'Butler Service', 'Private Lounge'],
    screensCount: 8,
    totalSeats: 240,
    screens: [
      { id: 'sc_5', name: 'VIP Screen 1', formats: ['Dolby Atmos', '3D'], totalSeats: 120 }
    ],
    shows: [
      { id: 'sh_301', movieId: 'mov_3', movieTitle: 'Kalki 2898 AD', screenId: 'sc_5', screenName: 'VIP Screen 1', format: '3D', time: '07:00 PM', price: 420 }
    ]
  }
];

const events = [
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
  },
  {
    id: 'ev_2',
    title: 'Zakir Khan Live - Tathastu Special',
    category: 'Stand-up Comedy',
    badge: 'LIMITED SEATS',
    venue: 'Siri Fort Auditorium, Delhi NCR',
    city: 'Delhi NCR',
    date: '04 FEB 2027',
    time: '08:00 PM',
    price: 999,
    totalCapacity: 2500,
    availableSeats: 480,
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    description: 'India\'s beloved Sakht Launda, Zakir Khan, returns with his brand-new 90-minute stand-up special filled with relatable storytelling, laughter, and poetry.'
  },
  {
    id: 'ev_3',
    title: 'Sunburn Goa EDM Music Festival 2026',
    category: 'Festival',
    badge: 'LIVE NOW',
    venue: 'Vagator Beach, Goa',
    city: 'Goa',
    date: '28 DEC 2026',
    time: '04:00 PM onwards',
    price: 4999,
    totalCapacity: 30000,
    availableSeats: 8200,
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
    description: 'Asia\'s biggest electronic dance music festival featuring international headliner DJs, laser shows, pyrotechnics, and beach vibes across 3 massive stages.'
  },
  {
    id: 'ev_4',
    title: 'Arijit Singh Live in Concert - Soulful Night',
    category: 'Singing',
    badge: 'FILLING FAST',
    venue: 'Jawaharlal Nehru Stadium, Delhi NCR',
    city: 'Delhi NCR',
    date: '15 MAR 2027',
    time: '06:30 PM',
    price: 2500,
    totalCapacity: 40000,
    availableSeats: 9500,
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80',
    description: 'An unforgettable evening with Arijit Singh performing his hit romantic and soulful melodies backed by a 50-piece symphony orchestra.'
  }
];

const eventBookings = [];

const plays = [
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
  },
  {
    id: 'pl_2',
    title: 'Mughal-E-Azam: The Grand Musical',
    language: 'Hindi',
    category: 'Musical Drama',
    badge: 'PREMIERE',
    venue: 'NCPA Theatre, Nariman Point, Mumbai',
    city: 'Mumbai',
    date: '20 FEB 2027',
    time: '07:30 PM',
    price: 1500,
    totalCapacity: 1500,
    availableSeats: 210,
    image: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=800&q=80',
    description: 'Feroz Abbas Khan\'s iconic Broadway-style Indian musical featuring live singing, Manish Malhotra costumes, and breathtaking Kathak dance performances.'
  },
  {
    id: 'pl_3',
    title: 'Hamlet: Shakespeare Masterpiece',
    language: 'English',
    category: 'Classic Tragedy',
    badge: 'CRITICS CHOICE',
    venue: 'Kashinath Ghanekar Natyagruha, Thane',
    city: 'Mumbai',
    date: '02 MAR 2027',
    time: '06:00 PM',
    price: 800,
    totalCapacity: 900,
    availableSeats: 450,
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    description: 'A gripping modern theatrical adaptation of William Shakespeare\'s psychological revenge masterpiece directed by award-winning theater veterans.'
  },
  {
    id: 'pl_4',
    title: 'Sahi Re Sahi - Legendary Comedy',
    language: 'Marathi',
    category: 'Comedy',
    badge: 'HOUSEFULL SOON',
    venue: 'Vishnudas Bhave Natyagruh, Navi Mumbai',
    city: 'Mumbai',
    date: '10 MAR 2027',
    time: '08:30 PM',
    price: 500,
    totalCapacity: 1100,
    availableSeats: 180,
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
    description: 'Bharat Jadhav plays quadruple roles in Maharashtra\'s record-breaking theatrical comedy extravaganza about mistaken identities and hilarious chaos.'
  }
];

const playBookings = [];

const activities = [
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
  },
  {
    id: 'act_2',
    title: 'Bounce Inc Trampoline Park & Ninja Course',
    category: 'Trampoline Park',
    badge: 'BEST VALUE',
    location: 'Inorbit Mall, Malad West, Mumbai',
    city: 'Mumbai',
    validity: '2-Hour All-Access Pass',
    price: 899,
    totalCapacity: 500,
    availableSeats: 120,
    benefits: ['Free Grip Socks', 'Freestyle Trampoline Arena', 'Slam Dunk & Dodgeball', 'Ninja Warrior Obstacle Course'],
    image: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=800&q=80',
    description: 'Wall-to-wall trampolines, foam pits, cliff jumping, and high-energy indoor ninja courses for adrenaline junkies of all ages!'
  },
  {
    id: 'act_3',
    title: 'Della Adventure Park Extreme Sports Pass',
    category: 'Adventure Sport',
    badge: 'POPULAR',
    location: 'Lonavala, Maharashtra',
    city: 'Lonavala',
    validity: 'Full Day Extreme Pass',
    price: 1999,
    totalCapacity: 1500,
    availableSeats: 410,
    benefits: ['Swoop Swing (100ft Drop)', 'Sky Cycling & Zipline', 'ATV Dirt Track Ride', 'Paintball Battle Zone'],
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
    description: 'India\'s largest extreme adventure park offering over 50 thrill activities, ATV dirt racing, sky cycling, and high-altitude drop swings.'
  },
  {
    id: 'act_4',
    title: 'Smaaash VR & Laser Tag Gaming Arena',
    category: 'Arcade Zone',
    badge: 'UNLIMITED ACCESS',
    location: 'Lower Parel, Mumbai',
    city: 'Mumbai',
    validity: '3-Hour Unlimited Gaming Pass',
    price: 999,
    totalCapacity: 800,
    availableSeats: 260,
    benefits: ['Unlimited Arcade Games', 'VR Coaster Simulation', 'Multiplayer Laser Tag Arena', '10-Pin Bowling Alley'],
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80',
    description: 'Next-gen virtual reality gaming hub featuring interactive 9D simulators, immersive laser tag battles, bowling lanes, and arcade classics.'
  }
];

const activityBookings = [];

const offers = [
  {
    id: 'off_1',
    code: 'PRIMESHOW50',
    title: '50% Flat Discount on IMAX & VIP Bookings',
    description: 'Get 50% discount up to ₹250 on all luxury recliner tickets.',
    bank: 'All Cards & UPI',
    discountValue: 250,
    expiryDate: '2026-12-31'
  },
  {
    id: 'off_2',
    code: 'LUXURY200',
    title: 'Flat ₹200 Cashback for HDFC Bank Cards',
    description: 'Flat ₹200 instant savings on minimum order value of ₹800.',
    bank: 'HDFC Bank',
    discountValue: 200,
    expiryDate: '2026-12-31'
  }
];

const supportMessages = [
  {
    id: 'msg_101',
    userId: 'usr_1',
    userName: 'Aarav Sharma',
    userEmail: 'aarav@primeshow.com',
    subject: 'Seat Upgrade Inquiry',
    message: 'Hello, can I upgrade my recliner ticket for Avatar to VIP Gold Lounge?',
    reply: 'Hello Aarav! Yes, you can present your booking QR code at the Director\'s Cut concierge desk for instant seat upgrade.',
    status: 'replied',
    createdAt: '2026-07-27T10:15:00.000Z'
  }
];

const notifications = [
  {
    id: 'notif_101',
    title: 'Welcome to PrimeShow VIP Lounge!',
    message: 'Enjoy 500 bonus reward points on your registered account.',
    type: 'PROMO',
    read: false,
    createdAt: '2026-07-28T09:00:00.000Z'
  },
  {
    id: 'notif_102',
    title: 'Avatar: Fire and Ash IMAX 3D Pre-Booking Open',
    message: 'Exclusive early bird seats unlocked for Gold Class members in Mumbai.',
    type: 'MOVIE',
    read: false,
    createdAt: '2026-07-28T10:30:00.000Z'
  }
];

const bookings = [];

// Private Theatre Hall Reservation Store
const privateTheatreBookings = [
  {
    id: 'PRIV-TH-772910',
    transactionId: 'TXN-PAY-882194',
    theatreId: 'th_1',
    theatreName: 'PVR Director\'s Cut, Palladium Mall',
    showId: 'sh_104',
    movieId: 'mov_3',
    movieTitle: 'Kalki 2898 AD',
    format: '3D',
    date: '28 Jul',
    time: '09:30 PM',
    screenName: 'Screen 2 - Luxe Gold Lounge',
    totalPrice: 15000,
    paymentMethod: 'UPI (Instant)',
    status: 'CONFIRMED',
    userEmail: 'vip.guest@primeshow.com',
    userName: 'VIP Private Guest',
    createdAt: '2026-07-28T12:00:00.000Z'
  }
];

// Cinema & Screen Scoped Blocked Seats Store: key `cinemaId_screenId` -> array of seatIds
const cinemaScreenBlockedSeatsMap = {
  'th_1_sc_1': ['V1', 'V2'],
  'th_1_sc_2': ['R1']
};

const offerBanners = [
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
  },
  {
    id: 'ban_2',
    title: 'Flat 20% OFF on Full Private Theater Reservation',
    tagline: 'Book an entire luxury screen privately for birthdays, anniversaries, or corporate events with double-booking lock protection.',
    code: 'PRIVATETHEATRE20',
    category: 'Theaters',
    categoryBadge: '🍿 THEATER BOOKING',
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1600&q=80',
    expiryDate: '2026-12-31',
    ctaText: 'Book Private Screen',
    ctaLink: 'theatres'
  },
  {
    id: 'ban_3',
    title: 'Weekend Play Specials - 15% Instant Cashback',
    tagline: 'Reserve stage seats for Gujjubhai Banya Dabang, Mughal-E-Azam, and Hamlet with instant cashback.',
    code: 'DRAMAPLAY15',
    category: 'Plays',
    categoryBadge: '🎭 PLAYS & DRAMA',
    image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1600&q=80',
    expiryDate: '2026-12-31',
    ctaText: 'Book Stage Pass',
    ctaLink: 'plays'
  },
  {
    id: 'ban_4',
    title: 'Coldplay & Sunburn Goa - Save Flat ₹1,000',
    tagline: 'Get exclusive VIP stadium pit access & LED wristbands for live music concerts and EDM festivals.',
    code: 'COLDPLAYVIP',
    category: 'Events',
    categoryBadge: '🎸 LIVE CONCERTS',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1600&q=80',
    expiryDate: '2026-12-31',
    ctaText: 'Get Concert Ticket',
    ctaLink: 'events'
  },
  {
    id: 'ban_5',
    title: 'Imagicaa & Della Adventure Pass - Flat ₹300 OFF',
    tagline: 'All-inclusive day passes for Water Parks, Trampoline Arenas, VR Laser Tag, and Extreme Sports.',
    code: 'ADVENTURE300',
    category: 'Activities',
    categoryBadge: '🎢 ADVENTURE PARKS',
    image: 'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?auto=format&fit=crop&w=1600&q=80',
    expiryDate: '2026-12-31',
    ctaText: 'Get Activity Pass',
    ctaLink: 'activities'
  }
];

module.exports = {
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

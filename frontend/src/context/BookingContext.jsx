import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import API, { API_BASE } from '../services/api';
import { safeLocalStorageSet, safeLocalStorageGet, getImageFromIDB } from '../utils/imageStorage';

const BookingContext = createContext();

const getSocketBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '').replace(/\/api$/, '');
  }
  return typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000'
    : '';
};
const SOCKET_BASE = getSocketBaseUrl();

const DEFAULT_HERO_SLIDES = [
  {
    id: 'hero_1',
    movieId: 'mov_1',
    title: 'Stree 2: Sarkate Ka Aatank',
    tagline: 'The Legend Returns to Protect Chanderi',
    badge: 'BLOCKBUSTER',
    rating: 9.5,
    votesCount: 94800,
    duration: '2h 29m',
    genres: ['Horror', 'Comedy', 'Blockbuster'],
    languages: ['Hindi'],
    price: 350,
    banner: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80',
    synopsis: 'The town of Chanderi faces a new terrifying threat as Sarkate strikes, forcing Vicky and his friends to reunite with Stree.'
  },
  {
    id: 'hero_2',
    movieId: 'mov_2',
    title: 'Jawan: Extended Cut',
    tagline: 'An Unstoppable Force of Justice',
    badge: 'TRENDING',
    rating: 9.3,
    votesCount: 88200,
    duration: '2h 50m',
    genres: ['Action', 'Thriller'],
    languages: ['Hindi', 'Tamil', 'Telugu'],
    price: 400,
    banner: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1920&q=80',
    synopsis: 'A high-octane action thriller highlighting the emotional journey of a man who is set to rectify the wrongs in society.'
  },
  {
    id: 'hero_3',
    movieId: 'mov_3',
    title: 'Pushpa 2: The Rule',
    tagline: 'Wilder, Fiercer & Bigger Than Ever',
    badge: 'CRITICS CHOICE',
    rating: 9.4,
    votesCount: 92400,
    duration: '3h 10m',
    genres: ['Action', 'Crime', 'Drama'],
    languages: ['Telugu', 'Hindi', 'Tamil'],
    price: 450,
    banner: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80',
    synopsis: 'The clash between Pushpa Raj and Bhanwar Singh Shekhawat intensifies as Pushpa expands his red sandalwood empire.'
  }
];

const DEFAULT_FEATURE_STRIPS = [
  {
    id: 'feat_1',
    title: 'Instant UPI Ticket Pass',
    subtitle: 'Scan QR Code for instant pass generation',
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
    icon: 'Zap',
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
    id: 'up_avengers_secret_wars',
    title: 'Avengers: Secret Wars',
    release: 'Dec 2026',
    releaseDateTag: 'Dec 2026',
    genres: ['Action', 'Sci-Fi', 'Adventure'],
    poster: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHRu2OGjr1xiHI1mTwYIwhaqgpMhQgfrFTePu3w6T2xw&s=10',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHRu2OGjr1xiHI1mTwYIwhaqgpMhQgfrFTePu3w6T2xw&s=10',
    synopsis: "Earth's mightiest heroes unite across the multiverse in an epic confrontation against cosmic threats."
  },
  {
    id: 'up_ramayana_part1',
    title: 'Ramayana: Part 1',
    release: 'Nov 2026',
    releaseDateTag: 'Nov 2026',
    genres: ['Mythological', 'Action', 'Fantasy'],
    poster: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHUIrI9Ytd4-3kbWNXKMB6kaWvb1Q_hJPvsTc3lf7IVA&s=10',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHUIrI9Ytd4-3kbWNXKMB6kaWvb1Q_hJPvsTc3lf7IVA&s=10',
    synopsis: 'The epic timeless tale of Lord Rama, righteousness, and courage brought to the grand IMAX screen.'
  },
  {
    id: 'up_love_and_war',
    title: 'Love & War',
    release: 'Jan 2027',
    releaseDateTag: 'Jan 2027',
    genres: ['Romance', 'Drama', 'War'],
    poster: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnm4ohArZvblsu4yjno3gqKIIEAdOr_U3xrLHoS7_QpQ&s=10',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnm4ohArZvblsu4yjno3gqKIIEAdOr_U3xrLHoS7_QpQ&s=10',
    synopsis: 'An intense romantic saga set against the turbulent backdrop of war, duty, and immense sacrifices.'
  },
  {
    id: 'up_spiderman_beyond_spiderverse',
    title: 'Spider-Man: Beyond the Spider-Verse',
    release: 'Jun 2027',
    releaseDateTag: 'Jun 2027',
    genres: ['Animation', 'Action', 'Sci-Fi'],
    poster: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyXHGB4QGlPsIaULimO_ql2DhZYCyCamGfAfFjeWoImw&s=10',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyXHGB4QGlPsIaULimO_ql2DhZYCyCamGfAfFjeWoImw&s=10',
    synopsis: 'Miles Morales journeys across the multiverse to determine his own destiny and save those he loves.'
  },
  {
    id: 'up_spirit_prabhas',
    title: 'Spirit',
    release: 'Mar 2027',
    releaseDateTag: 'Mar 2027',
    genres: ['Action', 'Crime', 'Thriller'],
    poster: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQtvlYipQ8YVR5eahH9lS2truLLqh8-xPJ6OdmZA9RNA&s=10',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQtvlYipQ8YVR5eahH9lS2truLLqh8-xPJ6OdmZA9RNA&s=10',
    synopsis: 'A high-octane action thriller navigating a fiercely dedicated cop, underworld crime, and justice.'
  }
];

const MOCK_MOVIES = [
  {
    id: 'mov_drishyam_conclusion',
    title: 'Drishyam: The Conclusion',
    tagline: 'The Ultimate Salgaonkar Family Truth Unfolds',
    synopsis: 'Vijay Salgaonkar’s past resurfaces when new evidence threatens to expose his secret, putting his family and carefully protected truth at risk in a climactic game of wits.',
    director: 'Abhishek Pathak',
    producer: 'Kumar Mangat Pathak; Abhishek Pathak',
    duration: '2h 45m',
    rating: 9.0,
    votesCount: 38200,
    parentalRating: 'UA',
    releaseDate: '2026-10-02',
    genres: ['Thriller', 'Crime', 'Drama'],
    languages: ['Hindi'],
    formats: ['2D', 'Dolby Atmos'],
    city: 'Surat',
    cities: ['Surat', 'Ahmedabad', 'Vadodara', 'Rajkot', 'Valsad', 'Anand', 'Bharuch', 'Bhavnagar', 'Mumbai'],
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
    banner: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1920&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=fneuVQ7uO_w',
    status: 'Now Showing',
    featured: true
  },
  {
    id: 'mov_prem_keetanu',
    title: 'Prem Keetanu',
    tagline: 'A Viral Love Story of Mismatched Hearts',
    synopsis: 'A refreshing romantic comedy featuring Veer Pahariya, Aafiya Sayed, and Aparshakti Khurana as two young souls discover that the biggest infection in the world is love.',
    director: 'Apoorv Singh Karki',
    producer: 'Gaurav Verma',
    duration: '2h 18m',
    rating: 9.9,
    votesCount: 29400,
    parentalRating: 'UA 16+',
    releaseDate: '2026-10-02',
    genres: ['Romance', 'Comedy'],
    languages: ['Hindi'],
    formats: ['2D'],
    city: 'Surat',
    cities: ['Surat', 'Ahmedabad', 'Vadodara', 'Rajkot', 'Valsad', 'Anand', 'Bharuch', 'Bhavnagar', 'Mumbai'],
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    banner: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1920&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=KVnheWaLUXs',
    status: 'Now Showing',
    featured: true
  },
  {
    id: 'mov_the_vvaan',
    title: 'The Vvaan: Force of the Forrest',
    tagline: 'Ancient Spirits of Vandevi Awaken',
    synopsis: 'Rishi returns to his ancestral village to sell inherited land, awakening folklore surrounding Vandevi and a forbidden forest with supernatural forces.',
    director: 'Deepak Kumar Mishra',
    producer: 'Shobha Kapoor, Ektaa R Kapoor, Arunabh Kumar',
    duration: '2h 35m',
    rating: 8.5,
    votesCount: 19800,
    parentalRating: 'UA 16+',
    releaseDate: '2026-09-25',
    genres: ['Action', 'Adventure', 'Fantasy', 'Mystery', 'Thriller'],
    languages: ['Hindi'],
    formats: ['2D', 'Dolby Atmos'],
    city: 'Surat',
    cities: ['Surat', 'Ahmedabad', 'Vadodara', 'Rajkot', 'Valsad', 'Anand', 'Bharuch', 'Bhavnagar', 'Mumbai'],
    poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    banner: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=fneuVQ7uO_w',
    status: 'Now Showing',
    featured: false
  },
  {
    id: 'mov_the_paradise',
    title: 'The Paradise',
    tagline: 'Raw Power Struggles in the Slums of Secunderabad',
    synopsis: '"The Paradise" is an intense period action-drama film set up in a slum of Secunderabad, navigating power politics, survival, and brotherhood.',
    director: 'Srikanth Odela',
    producer: 'Sudhakar Cherukuri',
    duration: '2h 42m',
    rating: 7.4,
    votesCount: 15600,
    parentalRating: 'A',
    releaseDate: '2026-09-24',
    genres: ['Action', 'Adventure', 'Drama'],
    languages: ['Hindi', 'Telugu'],
    formats: ['2D'],
    city: 'Surat',
    cities: ['Surat', 'Ahmedabad', 'Vadodara', 'Rajkot', 'Valsad', 'Anand', 'Bharuch', 'Bhavnagar', 'Mumbai'],
    poster: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
    banner: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?auto=format&fit=crop&w=1920&q=80',
    trailerUrl: 'https://youtu.be/namFQ8wFdIA',
    status: 'Now Showing',
    featured: false
  },
  {
    id: 'mov_mirzapur_the_movie',
    title: 'Mirzapur: The Movie',
    tagline: 'King of Mirzapur: The Grand Theatrical War',
    synopsis: 'A high-octane crime-action story based on the iconic Mirzapur franchise. The violent throne of Purvanchal is contested once more on the silver screen.',
    director: 'Gurmmeet Singh',
    producer: 'Ritesh Sidhwani, Farhan Akhtar',
    duration: '2h 50m',
    rating: 9.1,
    votesCount: 52100,
    parentalRating: 'A',
    releaseDate: '2026-09-04',
    genres: ['Crime', 'Action', 'Thriller'],
    languages: ['Hindi'],
    formats: ['2D', 'Dolby Atmos'],
    city: 'Surat',
    cities: ['Surat', 'Ahmedabad', 'Vadodara', 'Rajkot', 'Valsad', 'Anand', 'Bharuch', 'Bhavnagar', 'Mumbai'],
    poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
    banner: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1920&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=fneuVQ7uO_w',
    status: 'Now Showing',
    featured: true
  },
  {
    id: 'mov_hanuman_ansh',
    title: 'Hanuman Ansh',
    tagline: 'The Spiritual Legacy of Neem Karoli Baba',
    synopsis: 'The film chronicles Lakshminarayan’s spiritual journey and the divine experiences that lead to his becoming the globally revered mystic Neem Karoli Baba.',
    director: 'Vishal Chaturvedi',
    producer: 'Anupriya Nagar, Namrata G Singh, Piyush Thakur',
    duration: '2h 20m',
    rating: 9.6,
    votesCount: 31200,
    parentalRating: 'U',
    releaseDate: '2026-08-07',
    genres: ['Biography', 'Devotional', 'Drama'],
    languages: ['Hindi'],
    formats: ['2D'],
    city: 'Surat',
    cities: ['Surat', 'Ahmedabad', 'Vadodara', 'Rajkot', 'Valsad', 'Anand', 'Bharuch', 'Bhavnagar', 'Mumbai'],
    poster: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80',
    banner: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1920&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=fneuVQ7uO_w',
    status: 'Now Showing',
    featured: true
  },
  {
    id: 'mov_doraemon_castle',
    title: 'Doraemon: Castle of the Undersea Devil',
    tagline: 'Deep Sea Adventures Beyond Imagination',
    synopsis: 'Nobita, Doraemon, and friends embark on an undersea adventure in the deep oceanic realms of the Bermuda Triangle to face a mechanical menace.',
    director: 'Tetsuo Yajima',
    producer: 'Shin-Ei Animation',
    duration: '1h 45m',
    rating: 9.0,
    votesCount: 22800,
    parentalRating: 'U',
    releaseDate: '2026-10-02',
    genres: ['Animation', 'Family', 'Adventure', 'Comedy'],
    languages: ['Hindi'],
    formats: ['2D'],
    city: 'Surat',
    cities: ['Surat', 'Ahmedabad', 'Vadodara', 'Rajkot', 'Valsad', 'Anand', 'Bharuch', 'Bhavnagar', 'Mumbai'],
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    banner: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=KVnheWaLUXs',
    status: 'Now Showing',
    featured: false
  },
  {
    id: 'mov_mitrata_gujarati',
    title: 'Mitrata',
    tagline: 'Dosti, Pagalpanti & Gujju Swag',
    synopsis: 'A heartfelt Gujarati drama-comedy featuring Viraj Ghelani, Deep Vaidya, Vishal Parekh, and Vishwaa Joshi celebrating friendship, dreams, and family ties.',
    director: 'Oneel Karnik',
    producer: 'Parthiv Gohil, Manasi Parekh',
    duration: '2h 25m',
    rating: 9.5,
    votesCount: 27500,
    parentalRating: 'UA',
    releaseDate: '2026-09-25',
    genres: ['Drama', 'Comedy'],
    languages: ['Gujarati'],
    formats: ['2D'],
    city: 'Surat',
    cities: ['Surat', 'Ahmedabad', 'Vadodara', 'Rajkot', 'Valsad', 'Anand', 'Bharuch', 'Bhavnagar', 'Mumbai'],
    poster: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
    banner: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1920&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=fneuVQ7uO_w',
    status: 'Now Showing',
    featured: true
  }
];

const DEFAULT_GUJARAT_THEATRES = [
  {
    id: 'th_surat_inox_vr',
    name: 'INOX, VR Mall',
    city: 'Surat',
    state: 'Gujarat',
    address: '3rd Floor, VR Surat Mall, Dumas Road, Magdalla, Surat, Gujarat 395007',
    facilities: ['IMAX', 'Dolby Atmos', 'VIP Recliners', 'Food Court', 'Wheelchair Accessible', 'Valet Parking'],
    screensCount: 6,
    totalSeats: 900,
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'th_surat_pvr_rahul_raj',
    name: 'PVR, Rahul Raj Mall',
    city: 'Surat',
    state: 'Gujarat',
    address: '3rd Floor, Rahul Raj Mall, Opp. Goverdhan Haveli, Dumas Road, Piplod, Surat, Gujarat 395007',
    facilities: ['4K Laser Projection', 'Dolby 7.1', 'Recliner Seats', 'Parking', 'Cafeteria'],
    screensCount: 8,
    totalSeats: 1400,
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'th_surat_rajhans_ar_mall',
    name: 'Rajhans Multiplex - AR Mall',
    city: 'Surat',
    state: 'Gujarat',
    address: 'Fl 7, AR mall, Rajhans Multiplex, Mota Varachha, Surat, Gujarat 394105',
    facilities: ['RealD 3D', 'Dolby Atmos', 'Gourmet Food', 'Luxury Rocker Seats'],
    screensCount: 5,
    totalSeats: 1100,
    image: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'th_surat_rajhans_pal',
    name: 'Rajhans Cinemas, Pal',
    city: 'Surat',
    state: 'Gujarat',
    address: 'Rajhans Multiplex, Hazira Road, Opp. Navyug College, Pal, Adajan Gam, Surat, Gujarat 394510',
    facilities: ['Dolby Atmos', '3D Screens', 'Executive Seating', 'Food Lounge'],
    screensCount: 4,
    totalSeats: 950,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6vgih7YxqrDcQXozRqvu4VSpU_YiALbLT5Hc92sz_Tg&s=10',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCBDGyLPGiQQn4V5aohNWkDL4682UZ6X4sE5jTD6gmug&s=10'
  },
  {
    id: 'th_surat_valentine',
    name: 'Valentine Multiplex',
    city: 'Surat',
    state: 'Gujarat',
    address: 'Dumas Road, Piplod, Near Valentine Mall, Surat, Gujarat 395007',
    facilities: ['Dolby Digital', 'Push-back Seats', 'Food Court', 'Game Zone'],
    screensCount: 4,
    totalSeats: 840,
    image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'th_ahmedabad_pvr_acropolis',
    name: 'PVR, Acropolis Mall',
    city: 'Ahmedabad',
    state: 'Gujarat',
    address: '3rd Floor, Acropolis Mall, Thaltej Cross Road, SG Highway, Thaltej, Ahmedabad, Gujarat 380059',
    facilities: ['PVR Gold Class', 'IMAX', 'Dolby Atmos', 'Recliners', 'Valet Parking'],
    screensCount: 6,
    totalSeats: 1420,
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'th_ahmedabad_cinepolis_nexus',
    name: 'Cinepolis, Nexus Ahmedabad One Mall',
    city: 'Ahmedabad',
    state: 'Gujarat',
    address: '4th Floor, Nexus Ahmedabad One Mall, Near Vastrapur Lake, Vastrapur, Ahmedabad, Gujarat 380054',
    facilities: ['4DX', 'RealD 3D', 'Dolby Atmos', 'VIP Club', 'Gourmet Dining'],
    screensCount: 7,
    totalSeats: 1580,
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'th_vadodara_cinepolis_inorbit',
    name: 'Cinepolis, Inorbit Mall',
    city: 'Vadodara',
    state: 'Gujarat',
    address: '2nd Floor, Inorbit Mall, Alembic Road, Subhanpura, Vadodara, Gujarat 390023',
    facilities: ['Dolby Atmos', '3D Projection', 'Recliner Lounges', 'Food & Beverages'],
    screensCount: 6,
    totalSeats: 1280,
    image: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'th_vadodara_pvr_transcube',
    name: 'PVR, Transcube Plaza Mall',
    city: 'Vadodara',
    state: 'Gujarat',
    address: '3rd Floor, Central Bus Terminal, Ved Transcube Plaza, Sayajiganj, Vadodara, Gujarat 390007',
    facilities: ['4K Projection', 'Dolby 7.1', 'Push-back Seating', 'Wheelchair Access'],
    screensCount: 7,
    totalSeats: 1450,
    image: 'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'th_rajkot_inox_crystal',
    name: 'INOX, R World Crystal Mall',
    city: 'Rajkot',
    state: 'Gujarat',
    address: '3rd Floor, Crystal Mall, Kalawad Road, Opp. Rani Tower, Rajkot, Gujarat 360005',
    facilities: ['Insignia Lounge', 'Dolby Atmos', 'RealD 3D', 'Recliner Seats'],
    screensCount: 4,
    totalSeats: 980,
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'th_rajkot_cosmoplex',
    name: 'Cosmoplex Cinema',
    city: 'Rajkot',
    state: 'Gujarat',
    address: 'Kalawad Road, Near Mota Mava, Rajkot, Gujarat 360005',
    facilities: ['Dolby Atmos', '3D Digital', 'Food Court', 'Parking Facility'],
    screensCount: 5,
    totalSeats: 1120,
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'th_valsad_rajhans',
    name: 'Rajhans Cinemas, Valsad',
    city: 'Valsad',
    state: 'Gujarat',
    address: 'Dharampur Road, Near Abrama, Valsad, Gujarat 396001',
    facilities: ['2K Digital Projection', 'Dolby 7.1 Surround', 'Snack Counter', 'AC Waiting Area'],
    screensCount: 3,
    totalSeats: 650,
    image: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'th_valsad_pvr_jalaram',
    name: 'PVR, Jalaram Plaza',
    city: 'Valsad',
    state: 'Gujarat',
    address: 'Near Tithal Road Cross, Station Area, Valsad, Gujarat 396001',
    facilities: ['Dolby Atmos', 'Executive Recliner Seating', 'Cafeteria'],
    screensCount: 3,
    totalSeats: 590,
    image: 'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'th_anand_inox_maruti',
    name: 'INOX, Maruti Solaris Mall',
    city: 'Anand',
    state: 'Gujarat',
    address: 'Maruti Solaris Mall, Anand - Vidyanagar Road, Anand, Gujarat 388001',
    facilities: ['Dolby Atmos', '3D Screens', 'Gourmet Food Court', 'Lift & Parking'],
    screensCount: 4,
    totalSeats: 860,
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'th_anand_city_pulse',
    name: 'City Pulse Cinemas, Anand',
    city: 'Anand',
    state: 'Gujarat',
    address: 'Near Borsad Crossroads, Anand Town, Anand, Gujarat 388001',
    facilities: ['Dolby Digital', 'Push-back Seats', 'Snack Kiosks', 'Parking'],
    screensCount: 3,
    totalSeats: 620,
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'th_bharuch_inox_shalimar',
    name: 'INOX, Shalimar Fort Mall',
    city: 'Bharuch',
    state: 'Gujarat',
    address: 'Shalimar Fort Mall, Bholav, Bharuch, Gujarat 392002',
    facilities: ['Dolby Atmos', '3D', 'VIP Recliners', 'Food Kiosk', 'Escalators'],
    screensCount: 4,
    totalSeats: 810,
    image: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'th_bharuch_rajhans',
    name: 'Rajhans Cinemas, Bharuch',
    city: 'Bharuch',
    state: 'Gujarat',
    address: 'Near Zadeshwar Road, Bholav, Bharuch, Gujarat 392011',
    facilities: ['2K Projection', 'Dolby Surround', 'Pushback Seating', 'Canteen'],
    screensCount: 3,
    totalSeats: 690,
    image: 'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'th_bhavnagar_pvr_victoria',
    name: 'PVR, Victoria Park Mall',
    city: 'Bhavnagar',
    state: 'Gujarat',
    address: 'Near Victoria Park Road, Kalanala, Bhavnagar, Gujarat 364002',
    facilities: ['4K Laser Projection', 'Dolby Atmos', 'Recliners', 'Food Court'],
    screensCount: 4,
    totalSeats: 790,
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'th_bhavnagar_top3',
    name: 'Top3 Cinemas',
    city: 'Bhavnagar',
    state: 'Gujarat',
    address: 'Waghavadi Road, Near Hill Drive, Bhavnagar, Gujarat 364001',
    facilities: ['Dolby 7.1', '3D Glasses Provided', 'Cafeteria', 'Parking'],
    screensCount: 3,
    totalSeats: 580,
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=300&q=80'
  }
];

export const BookingProvider = ({ children }) => {
  const [moviesList, setMoviesList] = useState(() => {
    const saved = safeLocalStorageGet('primeshow_movies_v1', null);
    if (saved && Array.isArray(saved) && saved.length > 0) return saved;
    return MOCK_MOVIES;
  });
  const [theatresList, setTheatresList] = useState(() => {
    const saved = safeLocalStorageGet('primeshow_theatres_v1', null);
    if (saved && Array.isArray(saved) && saved.length > 0) return saved;
    return DEFAULT_GUJARAT_THEATRES;
  });

  useEffect(() => {
    safeLocalStorageSet('primeshow_theatres_v1', theatresList);
  }, [theatresList]);

  useEffect(() => {
    safeLocalStorageSet('primeshow_movies_v1', moviesList);
  }, [moviesList]);
  
  const fetchMovies = async () => {
    try {
      const res = await API.get('/movies');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setMoviesList(res.data);
      }
    } catch (err) {
      console.warn('⚠️ Error fetching movies from server API (Using Offline Cache):', err.message);
    }
  };

  const fetchTheatres = async (city = '') => {
    try {
      const url = city && city !== 'All' ? `/admin/theatres?city=${encodeURIComponent(city)}` : '/admin/theatres';
      const res = await API.get(url);
      if (res.data && Array.isArray(res.data)) {
        setTheatresList(res.data);
        return res.data;
      }
    } catch (err) {
      console.warn('⚠️ Error fetching theatres from Local MongoDB:', err.message);
    }
    return [];
  };

  const addTheatreToGlobalStore = async (theatreObj) => {
    const newTh = {
      id: theatreObj.id || `th_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      ...theatreObj
    };
    setTheatresList(prev => [newTh, ...prev.filter(t => t.id !== newTh.id)]);
    try {
      const res = await API.post('/admin/theatres', newTh);
      if (res.data && res.data.id) {
        setTheatresList(prev => [res.data, ...prev.filter(t => t.id !== res.data.id)]);
      }
    } catch (err) {}
    return newTh;
  };

  const updateTheatreInGlobalStore = async (theatreId, updatedFields) => {
    setTheatresList(prev => prev.map(t => t.id === theatreId ? { ...t, ...updatedFields } : t));
    try {
      await API.put(`/admin/theatres/${theatreId}`, updatedFields);
    } catch (err) {}
  };

  const deleteTheatreFromGlobalStore = async (theatreId) => {
    setTheatresList(prev => prev.filter(t => t.id !== theatreId));
    try {
      await API.delete(`/admin/theatres/${theatreId}`);
    } catch (err) {}
  };

  useEffect(() => {
    fetchMovies();
    fetchTheatres();
  }, []);

  // Master Dynamic Screen Seat Configuration Store
  const DEFAULT_SEAT_ROWS = [
    { row: 'N', tier: 'Classic Normal (Screen Front)', price: 280, seatsCount: 12 },
    { row: 'P', tier: 'Premium Tier', price: 480, seatsCount: 12 },
    { row: 'R', tier: 'Luxury Recliner', price: 650, seatsCount: 10 },
    { row: 'V', tier: 'VIP Gold Lounge (Back Tier)', price: 950, seatsCount: 8 }
  ];

  const [screenLayoutsMap, setScreenLayoutsMap] = useState({});

  const fetchScreenLayoutsFromBackend = async () => {
    try {
      const res = await API.get('/screen-layouts');
      const dataMap = res.data?.screenLayouts || (typeof res.data === 'object' ? res.data : {});
      if (dataMap && Object.keys(dataMap).length > 0) {
        setScreenLayoutsMap(prev => ({ ...prev, ...dataMap }));
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchScreenLayoutsFromBackend();
  }, []);

  const saveScreenLayoutToBackend = async (screenId, layoutObj) => {
    try {
      await API.post('/screen-layouts/save', {
        screenId,
        rows: layoutObj.rows || [],
        blockedSeats: layoutObj.blockedSeats || [],
        customStatuses: layoutObj.customStatuses || {},
        isApproved: layoutObj.isApproved || false
      });
      await fetchScreenLayoutsFromBackend();
    } catch (err) {
      console.warn('⚠️ Error persisting screen layout to Local MongoDB:', err.message);
    }
  };

  const getScreenLayout = (screenId = 'sc_1') => {
    return screenLayoutsMap[screenId] || {
      screenId,
      screenName: 'Screen 1',
      rows: DEFAULT_SEAT_ROWS,
      blockedSeats: [],
      customStatuses: {}
    };
  };

  const updateRowPriceInScreenLayout = async (screenId = 'sc_1', rowChar, newPrice) => {
    const priceNum = Number(newPrice);
    let updatedLayout = null;

    setScreenLayoutsMap(prev => {
      const current = prev[screenId] || { screenId, rows: DEFAULT_SEAT_ROWS, blockedSeats: [], customStatuses: {} };
      const existingRows = current.rows || [];
      const updatedRows = existingRows.map(r => r.row === rowChar ? { ...r, price: priceNum } : r);
      updatedLayout = { ...current, rows: updatedRows };
      return {
        ...prev,
        [screenId]: updatedLayout
      };
    });

    if (updatedLayout) {
      saveScreenLayoutToBackend(screenId, updatedLayout);
    }
  };

  const updateScreenRowsConfig = (screenId = 'sc_1', updatedRows) => {
    let updatedLayout = null;
    setScreenLayoutsMap(prev => {
      const current = prev[screenId] || { screenId, rows: DEFAULT_SEAT_ROWS, blockedSeats: [], customStatuses: {} };
      updatedLayout = { ...current, rows: updatedRows };
      return {
        ...prev,
        [screenId]: updatedLayout
      };
    });

    if (updatedLayout) {
      saveScreenLayoutToBackend(screenId, updatedLayout);
    }
  };

  const toggleBlockSeatForScreen = (screenId = 'sc_1', seatId) => {
    let updatedLayout = null;
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

      updatedLayout = { ...current, blockedSeats: updatedBlocked, customStatuses: custom };
      return {
        ...prev,
        [screenId]: updatedLayout
      };
    });

    if (updatedLayout) {
      saveScreenLayoutToBackend(screenId, updatedLayout);
    }
  };

  const setManualSeatStatusForScreen = (screenId = 'sc_1', seatId, newStatus) => {
    let updatedLayout = null;
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

      updatedLayout = { ...current, blockedSeats: blocked, customStatuses: custom };
      return {
        ...prev,
        [screenId]: updatedLayout
      };
    });

    if (updatedLayout) {
      saveScreenLayoutToBackend(screenId, updatedLayout);
    }
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

  const fetchUserBookings = async (userId, userEmail) => {
    if (!userId && !userEmail) return;
    try {
      const res = await API.get('/bookings', {
        params: { userId: userId || '', userEmail: userEmail || '', email: userEmail || '' }
      });
      if (res.data && Array.isArray(res.data.bookings)) {
        setMyBookings(res.data.bookings);
      } else if (Array.isArray(res.data)) {
        setMyBookings(res.data);
      }
    } catch (err) {
      console.warn('⚠️ Error fetching user bookings from MongoDB:', err.message);
    }
  };

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('primeshow_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        if (u && (u.id || u.email)) {
          fetchUserBookings(u.id, u.email);
        }
      }
    } catch (e) {}
  }, []);

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
      const res = await API.post('/coupons/verify', 
        { code, amount: totalAmount }
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
    const movieId = bookingDetails.movieId || targetMovie.id || targetMovie._id || 'mov_1';
    const movieTitle = bookingDetails.movieTitle || targetMovie.title || 'Movie';
    const poster = bookingDetails.poster || targetMovie.poster || targetMovie.banner || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80';
    
    const activeTh = activeBooking.theatre || {};
    const theatreId = bookingDetails.theatreId || bookingDetails.targetTheaterId || bookingDetails.theaterId || activeTh.id || activeTh._id || 'th_1';
    const theatreName = bookingDetails.theatreName || bookingDetails.name || activeTh.name || 'Multiplex Cinema';
    const theatreCity = bookingDetails.city || bookingDetails.theatreCity || activeTh.city || 'Surat';

    const numSeats = Number(bookingDetails.ticketCount || bookingDetails.seatsBookedCount || bookingDetails.totalSeats || (bookingDetails.seats ? bookingDetails.seats.length : 1));

    const newBooking = {
      id: bookingId,
      ...bookingDetails,
      movieId,
      movieTitle,
      poster,
      theatreId,
      theatreName,
      city: theatreCity,
      seatsBookedCount: numSeats,
      ticketCount: numSeats,
      tickets: numSeats,
      bookingDate: new Date().toISOString(),
      status: 'CONFIRMED',
      qrCodeData: `PRIMESHOW-${bookingId}-${movieTitle.replace(/\s+/g, '')}-${bookingDetails.seats ? bookingDetails.seats.join('') : ''}`
    };

    setMyBookings(prev => [newBooking, ...prev]);

    if (activeBooking.show?.id) {
      const showId = activeBooking.show.id;
      setShowBookedSeatsMap(prev => ({
        ...prev,
        [showId]: Array.from(new Set([...(prev[showId] || []), ...(bookingDetails.seats || [])]))
      }));
    }

    let loggedUser = null;
    try {
      const savedUser = localStorage.getItem('primeshow_user');
      if (savedUser) loggedUser = JSON.parse(savedUser);
    } catch (e) {}

    const targetUserId = bookingDetails.userId || loggedUser?.id || loggedUser?.firebaseUid || '';
    const targetUserEmail = bookingDetails.userEmail || loggedUser?.email || 'guest@primeshow.com';
    const targetUserName = bookingDetails.userName || loggedUser?.name || 'VIP Guest';

    try {
      await API.post('/bookings/create', {
        userId: targetUserId,
        userEmail: targetUserEmail,
        userName: targetUserName,
        showId: activeBooking.show?.id || bookingDetails.showId || 'sh_101',
        movieId: movieId,
        movieTitle: movieTitle,
        title: movieTitle,
        poster: poster,
        posterUrl: poster,
        theatreId: theatreId,
        targetTheaterId: theatreId,
        theaterId: theatreId,
        theatreName: theatreName,
        theatre: theatreName,
        venue: theatreName,
        city: theatreCity,
        theatreCity: theatreCity,
        screenName: activeBooking.show?.screenName || bookingDetails.screenName || 'Screen 1',
        seats: bookingDetails.seats || ['C4'],
        seatsBooked: bookingDetails.seats || ['C4'],
        seatsBookedCount: numSeats,
        ticketCount: numSeats,
        tickets: numSeats,
        tier: bookingDetails.tier || 'Recliner',
        totalAmount: Number(bookingDetails.totalAmount || 480),
        couponCode: bookingDetails.couponCode || '',
        paymentMethod: bookingDetails.paymentMethod || 'UPI (Instant)',
        basePrice: bookingDetails.basePrice || 400,
        convenienceFee: bookingDetails.convenienceFee || 40,
        tax: bookingDetails.tax || 20,
        discount: bookingDetails.discount || 0,
        category: bookingDetails.category || 'Movie',
        bookingType: bookingDetails.bookingType || 'movie'
      });
    } catch (err) {
      console.warn('⚠️ Error posting booking to server:', err);
    }

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
      await API.post('/bookings/hold-seats', {
        showId,
        seats
      });
    } catch (err) {}
  };

  const addMovieToGlobalStore = async (newMovieData) => {
    const moviePayload = {
      id: newMovieData.id || `mov_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      ...newMovieData,
      title: (newMovieData.title || newMovieData.movieName || '').trim() || 'Untitled Movie',
      duration: newMovieData.duration || '2h 30m',
      rating: newMovieData.rating || 9.0,
      votesCount: newMovieData.votesCount || 100,
      parentalRating: newMovieData.parentalRating || 'UA',
      releaseDate: newMovieData.releaseDate || new Date().toISOString().split('T')[0],
      showDates: newMovieData.showDates || ['2026-07-31', '2026-08-01'],
      genres: Array.isArray(newMovieData.genres) ? newMovieData.genres : (newMovieData.genres ? String(newMovieData.genres).split(',').map(s=>s.trim()) : ['Action']),
      languages: Array.isArray(newMovieData.languages) ? newMovieData.languages : (newMovieData.languages ? String(newMovieData.languages).split(',').map(s=>s.trim()) : ['English', 'Hindi']),
      formats: Array.isArray(newMovieData.formats) ? newMovieData.formats : (newMovieData.formats ? String(newMovieData.formats).split(',').map(s=>s.trim()) : ['IMAX 3D', 'Dolby Atmos']),
      poster: newMovieData.poster || newMovieData.posterUrl || 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
      banner: newMovieData.banner || newMovieData.bannerUrl || newMovieData.poster || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80',
      trailerUrl: newMovieData.trailerUrl || newMovieData.youtubeUrl || 'https://www.youtube.com/watch?v=d9MyW72ELq0',
      director: newMovieData.director || 'Famous Director',
      producer: newMovieData.producer || 'PrimeShow Studios',
      cast: newMovieData.cast || [],
      theatres: newMovieData.theatres || [],
      status: newMovieData.status || 'Now Showing',
      featured: newMovieData.featured !== undefined ? newMovieData.featured : true,
      city: newMovieData.city || 'All',
      cities: newMovieData.cities || ['All', 'Surat', 'Mumbai', 'Ahmedabad', 'Delhi', 'Bengaluru']
    };

    setMoviesList(prev => [moviePayload, ...prev.filter(m => m.id !== moviePayload.id)]);

    try {
      const res = await API.post('/movies', moviePayload);
      const data = res.data;
      const savedMovie = data.movie || data;

      if (data && (data.success || data.id || data._id || savedMovie.id || savedMovie._id)) {
        setMoviesList(prev => {
          const filtered = prev.filter(m => m.id !== savedMovie.id && m._id !== savedMovie._id);
          return [savedMovie, ...filtered];
        });
        return { success: true, movie: savedMovie };
      }
    } catch (err) {
      console.warn('⚠️ Server API offline, movie saved to offline local store:', err.message);
    }
    return { success: true, movie: moviePayload, offline: true };
  };

  const updateMovieInGlobalStore = async (movieId, updatedFields) => {
    let updatedMovieObj = null;
    setMoviesList(prev => prev.map(m => {
      if (m.id === movieId || m._id === movieId) {
        updatedMovieObj = { ...m, ...updatedFields };
        return updatedMovieObj;
      }
      return m;
    }));

    try {
      const res = await API.put(`/movies/${encodeURIComponent(movieId)}`, updatedFields);
      const data = res.data;
      const savedMovie = data.movie || data;
      if (data && (data.success || data.id || data._id || savedMovie.id)) {
        return { success: true, movie: savedMovie };
      }
    } catch (err) {
      console.warn('⚠️ Server API offline, movie updated in offline local store:', err.message);
    }
    return { success: true, movie: updatedMovieObj || updatedFields, offline: true };
  };

  const deleteMovieFromGlobalStore = async (movieId) => {
    setMoviesList(prev => prev.filter(m => m.id !== movieId && m._id !== movieId && m.title !== movieId));
    try {
      await API.delete(`/movies/${encodeURIComponent(movieId)}`);
    } catch (err) {
      console.warn('⚠️ Server API offline, movie deleted from offline local store:', err.message);
    }
    return { success: true, offline: true };
  };

  // Show Management Helpers with Async Backend Persistence to Local MongoDB
  const addShowDateToMovie = async (movieId, dateStr) => {
    setMoviesList(prev => prev.map(m => {
      if (m.id === movieId || m._id === movieId) {
        const existingDates = m.showDates || [];
        if (!existingDates.includes(dateStr)) {
          return { ...m, showDates: [...existingDates, dateStr] };
        }
      }
      return m;
    }));

    try {
      const res = await API.post('/admin/movies/add-date', {
        targetMovieId: movieId,
        movieId,
        dateStr,
        date: dateStr
      });
      if (res.data && res.data.movie) {
        const updatedMovie = res.data.movie;
        setMoviesList(prev => prev.map(m => (m.id === movieId || m._id === movieId) ? { ...m, ...updatedMovie } : m));
      }
    } catch (err) {
      console.error('❌ Error persisting show date to Local MongoDB:', err.message);
    }
  };

  const deleteShowDateFromMovie = async (movieId, dateStr) => {
    setMoviesList(prev => prev.map(m => {
      if (m.id === movieId || m._id === movieId) {
        const existingDates = m.showDates || [];
        const updatedDates = existingDates.filter(d => d !== dateStr);
        const updatedSchedules = { ...(m.schedules || {}) };
        delete updatedSchedules[dateStr];
        return { ...m, showDates: updatedDates, schedules: updatedSchedules };
      }
      return m;
    }));

    try {
      const res = await API.post('/admin/movies/schedule', {
        action: 'DELETE_DATE',
        movieId,
        targetMovieId: movieId,
        dateStr
      });
      if (res.data && res.data.movie) {
        const updatedMovie = res.data.movie;
        setMoviesList(prev => prev.map(m => (m.id === movieId || m._id === movieId) ? { ...m, ...updatedMovie } : m));
      }
    } catch (err) {
      console.error('❌ Error deleting show date from Local MongoDB:', err.message);
    }
  };

  const addShowSlotToMovieTheatre = async (movieId, dateStr, theatreObj, showSlotObj) => {
    setMoviesList(prev => prev.map(m => {
      if (m.id === movieId || m._id === movieId) {
        const schedules = { ...(m.schedules || {}) };
        const dateTheatres = schedules[dateStr] ? JSON.parse(JSON.stringify(schedules[dateStr])) : [];
        const theatreIndex = dateTheatres.findIndex(t => t.id === theatreObj.id || (t.name && t.name.trim().toLowerCase() === (theatreObj.name || '').trim().toLowerCase()));

        if (theatreIndex > -1) {
          const targetTheatre = dateTheatres[theatreIndex];
          const existingShows = targetTheatre.shows || [];
          const isDuplicate = existingShows.some(s => s.time === showSlotObj.time && s.format === showSlotObj.format);
          if (!isDuplicate) {
            targetTheatre.shows = [...existingShows, showSlotObj];
          }
        } else {
          dateTheatres.push({
            id: theatreObj.id || `th_${Date.now()}`,
            name: theatreObj.name || 'PVR Cinemas',
            city: theatreObj.city || 'Surat',
            address: theatreObj.address || 'Central Complex',
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

    try {
      const res = await API.post('/admin/movies/schedule', {
        movieId,
        targetMovieId: movieId,
        action: 'ADD_SHOW_SLOT',
        dateStr,
        date: dateStr,
        theatreObj,
        theatre: theatreObj,
        showSlotObj,
        show: showSlotObj
      });
      if (res.data && res.data.movie) {
        const updatedMovie = res.data.movie;
        setMoviesList(prev => prev.map(m => (m.id === movieId || m._id === movieId) ? { ...m, ...updatedMovie } : m));
      }
    } catch (err) {
      console.error('❌ Error persisting show slot to Local MongoDB:', err.message);
    }
  };

  const deleteShowSlotFromMovieTheatre = async (movieId, dateStr, theatreId, showId) => {
    setMoviesList(prev => prev.map(m => {
      if (m.id === movieId || m._id === movieId) {
        const schedules = { ...(m.schedules || {}) };
        if (schedules[dateStr]) {
          schedules[dateStr] = schedules[dateStr].map(t => {
            if (t.id === theatreId) {
              return { ...t, shows: (t.shows || []).filter(s => s.id !== showId) };
            }
            return t;
          }).filter(t => t.shows && t.shows.length > 0);
        }
        return { ...m, schedules };
      }
      return m;
    }));

    try {
      const res = await API.post('/admin/movies/schedule', {
        action: 'DELETE_SHOW_SLOT',
        movieId,
        targetMovieId: movieId,
        dateStr,
        theatreId,
        showId
      });
      if (res.data && res.data.movie) {
        const updatedMovie = res.data.movie;
        setMoviesList(prev => prev.map(m => (m.id === movieId || m._id === movieId) ? { ...m, ...updatedMovie } : m));
      }
    } catch (err) {
      console.error('❌ Error deleting show slot from Local MongoDB:', err.message);
    }
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
    const saved = safeLocalStorageGet('primeshow_hero_slides_v1', null);
    if (saved && Array.isArray(saved) && saved.length > 0) {
      return saved;
    }
    return DEFAULT_HERO_SLIDES;
  });

  // Resolve any IndexedDB image references on initialization
  useEffect(() => {
    let isMounted = true;
    const resolveIDBImages = async () => {
      if (!Array.isArray(heroSlidesList)) return;
      let hasIDBRefs = false;
      const resolved = await Promise.all(heroSlidesList.map(async (slide) => {
        const copy = { ...slide };
        if (typeof copy.banner === 'string' && copy.banner.startsWith('idb:')) {
          hasIDBRefs = true;
          const idbKey = copy.banner.replace('idb:', '');
          const imgData = await getImageFromIDB(idbKey);
          if (imgData) copy.banner = imgData;
        }
        if (typeof copy.imageUrl === 'string' && copy.imageUrl.startsWith('idb:')) {
          hasIDBRefs = true;
          const idbKey = copy.imageUrl.replace('idb:', '');
          const imgData = await getImageFromIDB(idbKey);
          if (imgData) copy.imageUrl = imgData;
        }
        return copy;
      }));
      if (hasIDBRefs && isMounted) {
        setHeroSlidesList(resolved);
      }
    };
    resolveIDBImages();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    safeLocalStorageSet('primeshow_hero_slides_v1', heroSlidesList);
  }, [heroSlidesList]);

  const addHeroSlide = async (slideObj) => {
    const newSlide = {
      id: `hero_${Date.now()}`,
      ...slideObj
    };
    setHeroSlidesList(prev => [newSlide, ...prev]);
    try {
      const res = await API.post('/hero-slides', newSlide);
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
      const res = await API.delete(`/hero-slides/${slideId}`);
      if (res.data && Array.isArray(res.data)) {
        setHeroSlidesList(res.data);
      }
    } catch (err) {}
  };

  // Feature Strips Dynamic Store & Central API Synchronization
  const [featureStripsList, setFeatureStripsList] = useState(DEFAULT_FEATURE_STRIPS);

  const fetchFeatureStrips = async () => {
    try {
      const res = await API.get(`/feature-chips?t=${Date.now()}`);
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setFeatureStripsList(res.data);
      }
    } catch (err) {}
  };

  const fetchHeroSlides = async () => {
    try {
      const res = await API.get(`/hero-slides?t=${Date.now()}`);
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setHeroSlidesList(res.data);
      }
    } catch (err) {}
  };

  const fetchUpcomingMovies = async () => {
    try {
      const res = await API.get(`/upcoming-movies?t=${Date.now()}`);
      if (res.data && Array.isArray(res.data)) {
        setUpcomingMoviesList(res.data);
      }
    } catch (err) {}
  };

  const fetchAllGlobalData = () => {
    fetchMovies();
    fetchTheatres();
    fetchFeatureStrips();
    fetchHeroSlides();
    fetchUpcomingMovies();
  };

  useEffect(() => {
    fetchAllGlobalData();

    const interval = setInterval(() => {
      fetchAllGlobalData();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Real-Time Socket.io Synchronization across ALL active User Panels & Sessions
  useEffect(() => {
    let cmsSocket = null;
    try {
      cmsSocket = io(SOCKET_BASE, {
        transports: ['polling', 'websocket'],
        autoConnect: true,
        reconnectionAttempts: 3,
        timeout: 5000
      });
      cmsSocket.on('connect_error', () => {});

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

      cmsSocket.on('THEATRE_UPDATED', () => fetchAllGlobalData());
      cmsSocket.on('THEATRE_DELETED', () => fetchAllGlobalData());
      cmsSocket.on('SHOW_UPDATED', () => fetchAllGlobalData());
      cmsSocket.on('SHOW_DELETED', () => fetchAllGlobalData());
      cmsSocket.on('EVENT_UPDATED', () => fetchAllGlobalData());
      cmsSocket.on('EVENT_DELETED', () => fetchAllGlobalData());
      cmsSocket.on('PLAY_UPDATED', () => fetchAllGlobalData());
      cmsSocket.on('PLAY_DELETED', () => fetchAllGlobalData());
      cmsSocket.on('ACTIVITY_UPDATED', () => fetchAllGlobalData());
      cmsSocket.on('ACTIVITY_DELETED', () => fetchAllGlobalData());
      cmsSocket.on('OFFER_UPDATED', () => fetchAllGlobalData());
      cmsSocket.on('OFFER_DELETED', () => fetchAllGlobalData());
      cmsSocket.on('OFFER_BANNERS_UPDATED', () => fetchAllGlobalData());

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
        } else {
          fetchUpcomingMovies();
        }
      });

      cmsSocket.on('LAYOUT_DATA_UPDATED', (payload) => {
        console.log('⚡ [BookingContext] Real-time LAYOUT_DATA_UPDATED received:', payload);
        fetchAllGlobalData();
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
        fetchAllGlobalData();
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
      const res = await API.post('/feature-chips', newStrip);
      if (res.data && Array.isArray(res.data)) {
        setFeatureStripsList(res.data);
      }
    } catch (err) {}
    return newStrip;
  };

  const updateFeatureStrip = async (stripId, updatedFields) => {
    setFeatureStripsList(prev => prev.map(s => s.id === stripId ? { ...s, ...updatedFields } : s));
    try {
      const res = await API.put(`/feature-chips/${stripId}`, updatedFields);
      if (res.data && Array.isArray(res.data)) {
        setFeatureStripsList(res.data);
      }
    } catch (err) {}
  };

  const deleteFeatureStrip = async (stripId) => {
    setFeatureStripsList(prev => prev.filter(s => s.id !== stripId));
    try {
      const res = await API.delete(`/feature-chips/${stripId}`);
      if (res.data && Array.isArray(res.data)) {
        setFeatureStripsList(res.data);
      }
    } catch (err) {}
  };

  // Upcoming Movies Dynamic Store (Local MongoDB Single Source of Truth)
  const [upcomingMoviesList, setUpcomingMoviesList] = useState(() => {
    const saved = safeLocalStorageGet('primeshow_upcoming_v1', null);
    if (saved && Array.isArray(saved) && saved.length > 0) return saved;
    return DEFAULT_UPCOMING_MOVIES;
  });

  useEffect(() => {
    safeLocalStorageSet('primeshow_upcoming_v1', upcomingMoviesList);
  }, [upcomingMoviesList]);

  const addUpcomingMovie = async (movieObj) => {
    const newMovie = { id: movieObj.id || `up_${Date.now()}`, ...movieObj };
    setUpcomingMoviesList(prev => [newMovie, ...prev.filter(m => m.id !== newMovie.id)]);
    try {
      await API.post('/upcoming-movies', newMovie);
      await fetchUpcomingMovies();
    } catch (err) {}
    return newMovie;
  };

  const updateUpcomingMovie = async (movieId, updatedFields) => {
    setUpcomingMoviesList(prev => prev.map(m => m.id === movieId ? { ...m, ...updatedFields } : m));
    try {
      await API.put(`/upcoming-movies/${movieId}`, updatedFields);
      await fetchUpcomingMovies();
    } catch (err) {}
  };

  const deleteUpcomingMovie = async (movieId) => {
    setUpcomingMoviesList(prev => prev.filter(m => m.id !== movieId));
    try {
      await API.delete(`/upcoming-movies/${movieId}`);
      await fetchUpcomingMovies();
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
      updateRowPriceInScreenLayout,
      fetchScreenLayoutsFromBackend,
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
      fetchUserBookings,
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
      theatresList,
      setTheatresList,
      fetchTheatres,
      addTheatreToGlobalStore,
      updateTheatreInGlobalStore,
      deleteTheatreFromGlobalStore,
      upcomingMoviesList,
      fetchUpcomingMovies,
      addUpcomingMovie,
      updateUpcomingMovie,
      deleteUpcomingMovie
    }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);

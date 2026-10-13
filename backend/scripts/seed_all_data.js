const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const https = require('https');

// 1. FEATURE CHIPS
const featureChipsData = [
  {
    id: 'feat_1',
    title: 'Instant UPI Ticket Pass',
    subtitle: 'Scan QR Code for instant pass generation',
    badge: 'INSTANT',
    icon: 'Zap',
    color: 'amber'
  },
  {
    id: 'feat_2',
    title: 'Private Cinema Screen',
    subtitle: 'Book full theatre lounge for private birthday parties',
    badge: 'LUXURY',
    icon: 'Film',
    color: 'purple'
  },
  {
    id: 'feat_3',
    title: 'Exclusive Promo Vouchers',
    subtitle: 'Flat 50% discount on IMAX 3D recliners using PRIMESHOW50',
    badge: 'OFFER',
    icon: 'Zap',
    color: 'emerald'
  },
  {
    id: 'feat_4',
    title: 'Expert VIP Concierge',
    subtitle: 'Dedicated lounge assistance & gourmet dining booking',
    badge: 'VIP',
    icon: 'Sparkles',
    color: 'cyan'
  }
];

// 2. PLAYS
const playsData = [
  {
    id: 'pl_gujjubhai_ni_golmaal_surat',
    title: 'Gujjubhai Ni Golmaal',
    language: 'Gujarati',
    category: 'Comedy Drama',
    badge: '🔥 HOT SELLER',
    city: 'Surat',
    venue: 'Sanjeev Kumar Auditorium, Hazira Road, Adajan Gam, Pal, Surat - 394510',
    date: '14 NOV 2026',
    time: '08:30 PM',
    price: 500,
    totalCapacity: 1150,
    availableSeats: 1150,
    image: 'https://image.tmdb.org/t/p/w780/sTDcx4mcrHPdUQ5IX11PJyd0ksw.jpg',
    description: 'The iconic Gujjubhai franchise returns with an uproarious laugh riot. When an everyday Gujarati patriarch finds himself tangled in an accidental mix-up involving real estate confusion and meddling relatives, chaos ensues in true comedic fashion. Starring Siddharth Randeria and an ensemble Gujarati stage cast.'
  },
  {
    id: 'pl_mughal_e_azam_surat',
    title: 'Mughal-e-Azam: The Musical',
    language: 'Hindi',
    category: 'Historical Drama',
    badge: '🔥 HOT SELLER',
    city: 'Surat',
    venue: 'Pandit Dindayal Upadhyay Indoor Stadium, Athwalines, Surat - 395007',
    date: '28 DEC 2026',
    time: '07:00 PM',
    price: 1200,
    totalCapacity: 2200,
    availableSeats: 2200,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJWaBwwHfB6prGstRVgBkCjqOFkA_m45bQt1XYLUPN2g&s=10',
    description: 'Feroz Abbas Khan’s Broadway-style tribute to K. Asif’s timeless cinematic classic. Experience the tragic saga of Prince Salim and courtesan Anarkali told through live Kathak performances, soul-stirring classical music, exquisite Manish Malhotra period costumes, and grand theatrical set designs.'
  }
];

// 3. THEATRES ACROSS GUJARAT
const theatresData = [
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
    logo: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=300&q=80',
    locationLink: 'https://maps.google.com/?cid=11969252147070215358'
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
    logo: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=300&q=80',
    locationLink: 'https://maps.google.com/?cid=4763180887078352650'
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
    logo: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=300&q=80',
    locationLink: 'https://maps.app.goo.gl/3FcUCvP35DzWyubg6'
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
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCBDGyLPGiQQn4V5aohNWkDL4682UZ6X4sE5jTD6gmug&s=10',
    locationLink: 'https://maps.google.com/?cid=18305607599940007495'
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
    logo: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=300&q=80',
    locationLink: 'https://maps.google.com/?cid=15926719119619078652'
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
    logo: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=300&q=80',
    locationLink: 'https://maps.google.com/?cid=2902605600566376891'
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
    logo: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=300&q=80',
    locationLink: 'https://maps.google.com/?cid=11501586836441489551'
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
    logo: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=300&q=80',
    locationLink: 'https://maps.google.com/?cid=5668436399448718293'
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
    logo: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=300&q=80',
    locationLink: 'https://maps.google.com/?cid=2082923779900837823'
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
    logo: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=300&q=80',
    locationLink: 'https://maps.google.com/?cid=12648712391283120191'
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
    logo: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=300&q=80',
    locationLink: 'https://maps.google.com/?cid=8912301842918239012'
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
    logo: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=300&q=80',
    locationLink: 'https://maps.google.com/?cid=16239102830192830192'
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
    logo: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=300&q=80',
    locationLink: 'https://maps.google.com/?cid=14298102938192038102'
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
    logo: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=300&q=80',
    locationLink: 'https://maps.google.com/?cid=10928301928301928301'
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
    logo: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=300&q=80',
    locationLink: 'https://maps.google.com/?cid=13098192830192831092'
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
    logo: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=300&q=80',
    locationLink: 'https://maps.google.com/?cid=17892019283019283019'
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
    logo: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=300&q=80',
    locationLink: 'https://maps.google.com/?cid=15829102938102938190'
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
    logo: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=300&q=80',
    locationLink: 'https://maps.google.com/?cid=19827391029381029381'
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
    logo: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=300&q=80',
    locationLink: 'https://maps.google.com/?cid=14981920381029381923'
  }
];

// Add default screens and shows for all theatres
theatresData.forEach(t => {
  t.screens = [
    { id: `${t.id}_sc_1`, name: 'Audi 1 - Laser Atmos', totalSeats: 150, rows: 10, cols: 15 },
    { id: `${t.id}_sc_2`, name: 'Audi 2 - VIP Recliner', totalSeats: 100, rows: 8, cols: 12 }
  ];
  t.shows = [
    { id: `${t.id}_sh_1`, screenId: `${t.id}_sc_1`, time: '10:00 AM', format: 'Dolby Atmos', price: 250, availableSeats: 120 },
    { id: `${t.id}_sh_2`, screenId: `${t.id}_sc_1`, time: '01:30 PM', format: 'Dolby Atmos', price: 300, availableSeats: 95 },
    { id: `${t.id}_sh_3`, screenId: `${t.id}_sc_2`, time: '06:00 PM', format: 'VIP Recliner', price: 450, availableSeats: 70 },
    { id: `${t.id}_sh_4`, screenId: `${t.id}_sc_2`, time: '09:30 PM', format: 'VIP Recliner', price: 500, availableSeats: 85 }
  ];
});

// 4. MOVIES CATALOG (8 Movies)
const moviesData = [
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
    targetCity: 'Surat',
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
    targetCity: 'Surat',
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
    targetCity: 'Surat',
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
    targetCity: 'Surat',
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
    targetCity: 'Surat',
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
    targetCity: 'Surat',
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
    targetCity: 'Surat',
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
    targetCity: 'Surat',
    poster: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
    banner: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1920&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=fneuVQ7uO_w',
    status: 'Now Showing',
    featured: true
  }
];

// 5. GUJARAT LIVE EVENTS (12 Events)
const eventsData = [
  {
    id: 'ev_surat_garba',
    title: 'Garba Nights: Rangilo Gujarat',
    category: 'Live Concert',
    badge: 'SELLING FAST',
    languages: ['Gujarati', 'Hindi'],
    ageRating: 'UA',
    city: 'Surat',
    venueName: 'SIECC Convention Centre',
    venueAddress: 'SIECC Convention Centre, Sarsana, Surat, Gujarat 395007',
    venue: 'SIECC Convention Centre, Sarsana, Surat',
    mapLink: 'https://maps.google.com/?q=SIECC+Convention+Centre+Surat',
    date: '2026-10-24',
    startTime: '19:00',
    endTime: '23:00',
    time: '07:00 PM',
    screenOrHallStage: 'Main Arena',
    ticketPrice: 799,
    price: 799,
    seatCategory: 'Gold',
    slotTicketPrice: 799,
    totalCapacity: 5000,
    availableSeats: 3800,
    slotSeatCapacity: 1200,
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
    thumbnailImageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
    backdropBannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1920&q=80',
    description: 'A festive Gujarati garba night with live singers, traditional music and a massive dance floor.',
    termsAndConditions: 'Entry requires a valid ticket. Children must be accompanied by an adult.',
    activeBookings: true
  },
  {
    id: 'ev_ahmedabad_indie',
    title: 'Ahmedabad Indie Music Festival',
    category: 'Music Concert',
    badge: 'LIVE',
    languages: ['Hindi', 'English', 'Gujarati'],
    ageRating: 'UA 16+',
    city: 'Ahmedabad',
    venueName: 'EKA Club',
    venueAddress: 'EKA Club, Kankaria, Ahmedabad, Gujarat 380022',
    venue: 'EKA Club, Kankaria, Ahmedabad',
    mapLink: 'https://maps.google.com/?q=EKA+Club+Ahmedabad',
    date: '2026-11-07',
    startTime: '18:30',
    endTime: '22:30',
    time: '06:30 PM',
    screenOrHallStage: 'Outdoor Stage',
    ticketPrice: 1299,
    price: 1299,
    seatCategory: 'Silver',
    slotTicketPrice: 1299,
    totalCapacity: 3500,
    availableSeats: 2600,
    slotSeatCapacity: 900,
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=800&q=80',
    thumbnailImageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=800&q=80',
    backdropBannerUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1920&q=80',
    description: 'An evening of indie music, emerging artists, food stalls and live performances.',
    termsAndConditions: 'Carry a valid ticket and photo ID. Outside food and beverages not permitted.',
    activeBookings: true
  },
  {
    id: 'ev_rajkot_rock',
    title: 'Rajkot Rock & Rhythm Live',
    category: 'Live Concert',
    badge: 'NEW',
    languages: ['Gujarati', 'Hindi'],
    ageRating: 'UA 16+',
    city: 'Rajkot',
    venueName: 'Race Course Ground',
    venueAddress: 'Race Course Ground, Race Course Ring Road, Rajkot, Gujarat 360001',
    venue: 'Race Course Ground, Rajkot',
    mapLink: 'https://maps.google.com/?q=Race+Course+Ground+Rajkot',
    date: '2026-11-14',
    startTime: '19:00',
    endTime: '22:45',
    time: '07:00 PM',
    screenOrHallStage: 'Main Stage',
    ticketPrice: 599,
    price: 599,
    seatCategory: 'General',
    slotTicketPrice: 599,
    totalCapacity: 4000,
    availableSeats: 2500,
    slotSeatCapacity: 1500,
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
    thumbnailImageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
    backdropBannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1920&q=80',
    description: 'A high-energy regional music event featuring live bands and popular Gujarati tracks.',
    termsAndConditions: 'Standing areas are first come, first served. Re-entry is not allowed.',
    activeBookings: true
  },
  {
    id: 'ev_vadodara_beats',
    title: 'Vadodara Cultural Beats',
    category: 'Cultural Event',
    badge: 'POPULAR',
    languages: ['Gujarati', 'Hindi'],
    ageRating: 'UA',
    city: 'Vadodara',
    venueName: 'Navlakhi Ground',
    venueAddress: 'Navlakhi Ground, Vadodara, Gujarat 390001',
    venue: 'Navlakhi Ground, Vadodara',
    mapLink: 'https://maps.google.com/?q=Navlakhi+Ground+Vadodara',
    date: '2026-10-31',
    startTime: '18:00',
    endTime: '22:00',
    time: '06:00 PM',
    screenOrHallStage: 'Cultural Stage',
    ticketPrice: 499,
    price: 499,
    seatCategory: 'General',
    slotTicketPrice: 499,
    totalCapacity: 3000,
    availableSeats: 2000,
    slotSeatCapacity: 1000,
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    thumbnailImageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    backdropBannerUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1920&q=80',
    description: 'A family-friendly evening showcasing folk dance, music and regional performances.',
    termsAndConditions: 'Keep the venue clean. Follow security staff instructions.',
    activeBookings: true
  },
  {
    id: 'ev_gandhinagar_comedy',
    title: 'Gandhinagar Comedy Night',
    category: 'Comedy Show',
    badge: 'LIVE',
    languages: ['Gujarati', 'Hindi'],
    ageRating: 'UA 16+',
    city: 'Gandhinagar',
    venueName: 'Mahatma Mandir Convention Centre',
    venueAddress: 'Mahatma Mandir, Sector 13C, Gandhinagar, Gujarat 382017',
    venue: 'Mahatma Mandir, Gandhinagar',
    mapLink: 'https://maps.google.com/?q=Mahatma+Mandir+Gandhinagar',
    date: '2026-11-21',
    startTime: '19:30',
    endTime: '21:30',
    time: '07:30 PM',
    screenOrHallStage: 'Auditorium',
    ticketPrice: 399,
    price: 399,
    seatCategory: 'Silver',
    slotTicketPrice: 399,
    totalCapacity: 1200,
    availableSeats: 600,
    slotSeatCapacity: 600,
    image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80',
    thumbnailImageUrl: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80',
    backdropBannerUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1920&q=80',
    description: 'A stand-up comedy evening with observational humour and Gujarati crowd interaction.',
    termsAndConditions: 'Late entry may be restricted. Show recommended for ages 16 and above.',
    activeBookings: true
  },
  {
    id: 'ev_bhavnagar_folk',
    title: 'Bhavnagar Folk Music Evening',
    category: 'Music Concert',
    badge: 'NEW',
    languages: ['Gujarati'],
    ageRating: 'UA',
    city: 'Bhavnagar',
    venueName: 'Town Hall Bhavnagar',
    venueAddress: 'Town Hall, Waghawadi Road, Bhavnagar, Gujarat 364001',
    venue: 'Town Hall, Bhavnagar',
    mapLink: 'https://maps.google.com/?q=Town+Hall+Bhavnagar',
    date: '2026-11-28',
    startTime: '18:30',
    endTime: '21:30',
    time: '06:30 PM',
    screenOrHallStage: 'Main Hall',
    ticketPrice: 299,
    price: 299,
    seatCategory: 'Silver',
    slotTicketPrice: 299,
    totalCapacity: 900,
    availableSeats: 450,
    slotSeatCapacity: 450,
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=800&q=80',
    thumbnailImageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=800&q=80',
    backdropBannerUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1920&q=80',
    description: 'An intimate folk music programme celebrating Gujarati melodies and traditional instruments.',
    termsAndConditions: 'Seats are allocated according to the selected ticket category.',
    activeBookings: true
  },
  {
    id: 'ev_jamnagar_fest',
    title: 'Jamnagar Dance & Music Fest',
    category: 'Live Concert',
    badge: 'SELLING FAST',
    languages: ['Gujarati', 'Hindi'],
    ageRating: 'UA',
    city: 'Jamnagar',
    venueName: 'Darbargadh Grounds',
    venueAddress: 'Darbargadh area, Jamnagar, Gujarat 361001',
    venue: 'Darbargadh Grounds, Jamnagar',
    mapLink: 'https://maps.google.com/?q=Darbargadh+Jamnagar',
    date: '2026-12-05',
    startTime: '18:00',
    endTime: '22:00',
    time: '06:00 PM',
    screenOrHallStage: 'Festival Stage',
    ticketPrice: 449,
    price: 449,
    seatCategory: 'General',
    slotTicketPrice: 449,
    totalCapacity: 2500,
    availableSeats: 1600,
    slotSeatCapacity: 900,
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    thumbnailImageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    backdropBannerUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1920&q=80',
    description: 'A lively regional festival with dance performances, music and local food vendors.',
    termsAndConditions: 'Event schedule may change. Arrive at least 30 minutes before.',
    activeBookings: true
  },
  {
    id: 'ev_anand_youth',
    title: 'Anand Youth Live Sessions',
    category: 'Music Concert',
    badge: 'LIVE',
    languages: ['Gujarati', 'Hindi', 'English'],
    ageRating: 'UA 16+',
    city: 'Anand',
    venueName: 'Sardar Patel University Auditorium',
    venueAddress: 'Sardar Patel University, Vallabh Vidyanagar, Anand, Gujarat 388120',
    venue: 'Sardar Patel University, Anand',
    mapLink: 'https://maps.google.com/?q=Sardar+Patel+University+Auditorium+Anand',
    date: '2026-11-01',
    startTime: '17:30',
    endTime: '21:00',
    time: '05:30 PM',
    screenOrHallStage: 'Auditorium',
    ticketPrice: 349,
    price: 349,
    seatCategory: 'General',
    slotTicketPrice: 349,
    totalCapacity: 1000,
    availableSeats: 500,
    slotSeatCapacity: 500,
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
    thumbnailImageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
    backdropBannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1920&q=80',
    description: 'A youth-focused live music evening featuring local performers and acoustic sets.',
    termsAndConditions: 'A valid ticket is required for entry. Follow seating instructions.',
    activeBookings: true
  },
  {
    id: 'ev_junagadh_heritage',
    title: 'Junagadh Heritage & Folk Festival',
    category: 'Cultural Event',
    badge: 'POPULAR',
    languages: ['Gujarati'],
    ageRating: 'UA',
    city: 'Junagadh',
    venueName: 'Bahuddin College Ground',
    venueAddress: 'Bahuddin College area, Junagadh, Gujarat 362001',
    venue: 'Bahuddin College Ground, Junagadh',
    mapLink: 'https://maps.google.com/?q=Bahuddin+College+Ground+Junagadh',
    date: '2026-12-12',
    startTime: '17:00',
    endTime: '21:30',
    time: '05:00 PM',
    screenOrHallStage: 'Heritage Stage',
    ticketPrice: 250,
    price: 250,
    seatCategory: 'General',
    slotTicketPrice: 250,
    totalCapacity: 2200,
    availableSeats: 1400,
    slotSeatCapacity: 800,
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    thumbnailImageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    backdropBannerUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1920&q=80',
    description: 'A cultural showcase of folk music, traditional dance and local heritage.',
    termsAndConditions: 'Outdoor event; weather-related changes may apply.',
    activeBookings: true
  },
  {
    id: 'ev_himmatnagar_garba',
    title: 'Himmatnagar Garba & Folk Night',
    category: 'Cultural Event',
    badge: 'NEW',
    languages: ['Gujarati'],
    ageRating: 'UA',
    city: 'Himmatnagar',
    venueName: 'Modasa Road Event Ground',
    venueAddress: 'Modasa Road, Himmatnagar, Gujarat 383001',
    venue: 'Modasa Road Ground, Himmatnagar',
    mapLink: 'https://maps.google.com/?q=Modasa+Road+Himmatnagar',
    date: '2026-10-30',
    startTime: '19:00',
    endTime: '22:30',
    time: '07:00 PM',
    screenOrHallStage: 'Main Ground',
    ticketPrice: 299,
    price: 299,
    seatCategory: 'General',
    slotTicketPrice: 299,
    totalCapacity: 1800,
    availableSeats: 1100,
    slotSeatCapacity: 700,
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
    thumbnailImageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
    backdropBannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1920&q=80',
    description: 'A regional garba and folk music event designed for friends and families.',
    termsAndConditions: 'Children must be supervised by guardians. Ticket valid for one person.',
    activeBookings: true
  },
  {
    id: 'ev_valsad_coastal',
    title: 'Valsad Coastal Music Evening',
    category: 'Music Concert',
    badge: 'LIVE',
    languages: ['Gujarati', 'Hindi'],
    ageRating: 'UA',
    city: 'Valsad',
    venueName: 'Shree Dharampur Road Community Ground',
    venueAddress: 'Dharampur Road, Valsad, Gujarat 396001',
    venue: 'Dharampur Road Ground, Valsad',
    mapLink: 'https://maps.google.com/?q=Dharampur+Road+Valsad',
    date: '2026-12-19',
    startTime: '18:00',
    endTime: '21:45',
    time: '06:00 PM',
    screenOrHallStage: 'Open Air Stage',
    ticketPrice: 349,
    price: 349,
    seatCategory: 'General',
    slotTicketPrice: 349,
    totalCapacity: 1600,
    availableSeats: 950,
    slotSeatCapacity: 650,
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=800&q=80',
    thumbnailImageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=800&q=80',
    backdropBannerUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1920&q=80',
    description: 'An open-air music evening featuring Gujarati songs and regional artists.',
    termsAndConditions: 'Outdoor seating is subject to venue arrangements.',
    activeBookings: true
  },
  {
    id: 'ev_mehsana_family',
    title: 'Mehsana Family Entertainment Night',
    category: 'Live Show',
    badge: 'POPULAR',
    languages: ['Gujarati', 'Hindi'],
    ageRating: 'UA',
    city: 'Mehsana',
    venueName: 'Toranwali Mata Ground',
    venueAddress: 'Toranwali Mata area, Mehsana, Gujarat 384001',
    venue: 'Toranwali Mata Ground, Mehsana',
    mapLink: 'https://maps.google.com/?q=Toranwali+Mata+Ground+Mehsana',
    date: '2026-12-26',
    startTime: '18:30',
    endTime: '21:30',
    time: '06:30 PM',
    screenOrHallStage: 'Main Stage',
    ticketPrice: 299,
    price: 299,
    seatCategory: 'General',
    slotTicketPrice: 299,
    totalCapacity: 2000,
    availableSeats: 1250,
    slotSeatCapacity: 750,
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
    thumbnailImageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
    backdropBannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1920&q=80',
    description: 'A family entertainment programme with music, dance and stage performances.',
    termsAndConditions: 'Please arrive early for entry checks.',
    activeBookings: true
  }
];

// Helper to make HTTP POST requests to Render API
function postToRender(path, data) {
  return new Promise((resolve) => {
    const postData = JSON.stringify(data);
    const options = {
      hostname: 'primeshow-api.onrender.com',
      port: 443,
      path: `/api${path}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, body });
      });
    });

    req.on('error', (e) => resolve({ error: e.message }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ error: 'Timeout' });
    });
    req.write(postData);
    req.end();
  });
}

async function runSeed() {
  console.log('🚀 Starting Comprehensive Data Seeding...');

  // 1. Write to local JSON files in backend/data/
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  fs.writeFileSync(path.join(dataDir, 'feature-chips.json'), JSON.stringify(featureChipsData, null, 2));
  fs.writeFileSync(path.join(dataDir, 'plays.json'), JSON.stringify(playsData, null, 2));
  fs.writeFileSync(path.join(dataDir, 'theatres.json'), JSON.stringify(theatresData, null, 2));
  fs.writeFileSync(path.join(dataDir, 'movies.json'), JSON.stringify(moviesData, null, 2));
  fs.writeFileSync(path.join(dataDir, 'events.json'), JSON.stringify(eventsData, null, 2));
  console.log('📁 Local JSON files in backend/data/ updated successfully.');

  // 2. Insert into Local MongoDB (both 'primeshow' and 'show_db')
  try {
    const client = new MongoClient('mongodb://127.0.0.1:27017');
    await client.connect();
    console.log('🔌 Connected to local MongoDB.');

    for (const dbName of ['primeshow', 'show_db']) {
      const db = client.db(dbName);
      
      // Feature Chips
      for (const item of featureChipsData) {
        await db.collection('feature-chips').updateOne({ id: item.id }, { $set: item }, { upsert: true });
        await db.collection('featurechips').updateOne({ id: item.id }, { $set: item }, { upsert: true });
      }

      // Plays
      for (const item of playsData) {
        await db.collection('plays').updateOne({ id: item.id }, { $set: item }, { upsert: true });
      }

      // Theatres
      for (const item of theatresData) {
        await db.collection('theatres').updateOne({ id: item.id }, { $set: item }, { upsert: true });
      }

      // Movies
      for (const item of moviesData) {
        await db.collection('movies').updateOne({ id: item.id }, { $set: item }, { upsert: true });
      }

      // Events
      for (const item of eventsData) {
        await db.collection('events').updateOne({ id: item.id }, { $set: item }, { upsert: true });
      }

      console.log(`✅ Seeded to local MongoDB database "${dbName}".`);
    }

    await client.close();
  } catch (err) {
    console.warn('⚠️ Local MongoDB connection error:', err.message);
  }

  // 3. Sync to Live Render MongoDB Atlas API
  console.log('🌐 Syncing datasets to Live Render MongoDB Atlas...');

  // Feature Chips
  for (const item of featureChipsData) {
    const res = await postToRender('/feature-chips', item);
    console.log(`  [Feature Chip] ${item.title} -> status: ${res.status || res.error}`);
  }

  // Plays
  for (const item of playsData) {
    const res = await postToRender('/plays', item);
    console.log(`  [Play] ${item.title} -> status: ${res.status || res.error}`);
  }

  // Theatres
  for (const item of theatresData) {
    const res = await postToRender('/theatres', item);
    console.log(`  [Theatre] ${item.name} (${item.city}) -> status: ${res.status || res.error}`);
  }

  // Movies
  for (const item of moviesData) {
    const res = await postToRender('/movies', item);
    console.log(`  [Movie] ${item.title} -> status: ${res.status || res.error}`);
  }

  // Events
  for (const item of eventsData) {
    const res = await postToRender('/events', item);
    console.log(`  [Event] ${item.title} (${item.city}) -> status: ${res.status || res.error}`);
  }

  console.log('🎉 Comprehensive Data Seeding Complete!');
}

runSeed().catch(console.error);

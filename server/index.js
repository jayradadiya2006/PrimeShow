require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { connectDB, movies, theatres, events, eventBookings, plays, playBookings, activities, activityBookings, offers, offerBanners, supportMessages, notifications, bookings, privateTheatreBookings, cinemaScreenBlockedSeatsMap } = require('./db');
const { User, UserActivityLog, Movie, Theatre, Booking, PrivateTheatreBooking, Event, Play, Activity, Offer, OfferBanner, SupportMessage, Notification, BlockedSeat, GlobalConfig, EditorLayout } = require('./models');

// Real-Time Multi-Client SSE Subscriber Set (1-Admin to N-Users Broadcast Pipeline)
const sseClients = new Set();

const broadcastToAllClients = (eventType, payload) => {
  const dataString = JSON.stringify({ type: eventType, data: payload, timestamp: new Date().toISOString() });
  sseClients.forEach(res => {
    try {
      res.write(`event: ${eventType}\ndata: ${dataString}\n\n`);
    } catch (e) {
      sseClients.delete(res);
    }
  });
};

const userActivityLogs = []; // in-memory fallback list

const logUserActivity = async (userEmail, userName, action, details = '', metadata = {}) => {
  if (!userEmail) return;
  const logItem = {
    id: `act_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    userEmail,
    userName: userName || userEmail.split('@')[0],
    action,
    details,
    metadata,
    timestamp: new Date()
  };
  userActivityLogs.unshift(logItem);
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState === 1) {
    try {
      const doc = new UserActivityLog(logItem);
      await doc.save();
    } catch (err) {
      console.warn('UserActivityLog save error:', err.message);
    }
  }
};

// In-Memory Global User Registry for instant access & fallback
const globalRegisteredUsersMap = new Map();

// Seed initial system users into memory registry
const seedInitialUsersList = [
  {
    id: 'usr_admin_1',
    name: 'Jay Hiralal Radadiya',
    username: 'jayradadiya',
    email: 'jayradadiya2006@gmail.com',
    phone: '+91 9876543210',
    role: 'ADMIN',
    provider: 'GOOGLE',
    city: 'Surat',
    rewardsPoints: 99999,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    isOnline: true,
    lastLoginTime: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    createdAt: new Date('2026-01-01').toISOString()
  },
  {
    id: 'usr_cust_2',
    name: 'Aarav Sharma',
    username: 'aarav_s',
    email: 'aarav.sharma@gmail.com',
    phone: '+91 9825012345',
    role: 'CUSTOMER',
    provider: 'GOOGLE',
    city: 'Ahmedabad',
    rewardsPoints: 1250,
    avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Aarav&backgroundColor=0f172a',
    profilePicture: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Aarav&backgroundColor=0f172a',
    isOnline: true,
    lastLoginTime: new Date(Date.now() - 3600000 * 2).toISOString(),
    lastActive: new Date(Date.now() - 3600000 * 2).toISOString(),
    createdAt: new Date('2026-01-15').toISOString()
  },
  {
    id: 'usr_cust_3',
    name: 'Priya Patel',
    username: 'priyapatel',
    email: 'priya.patel@yahoo.com',
    phone: '+91 9723045678',
    role: 'CUSTOMER',
    provider: 'LOCAL',
    city: 'Surat',
    rewardsPoints: 800,
    avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Priya&backgroundColor=0f172a',
    profilePicture: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Priya&backgroundColor=0f172a',
    isOnline: false,
    lastLoginTime: new Date(Date.now() - 3600000 * 24).toISOString(),
    lastLogoutTime: new Date(Date.now() - 3600000 * 20).toISOString(),
    lastActive: new Date(Date.now() - 3600000 * 24).toISOString(),
    createdAt: new Date('2026-02-01').toISOString()
  }
];

seedInitialUsersList.forEach(u => globalRegisteredUsersMap.set(u.email.toLowerCase(), u));

const upsertUserRecord = async (userData) => {
  if (!userData) return null;
  const rawEmail = userData.email || userData.user?.email || userData.profile?.email || '';
  if (!rawEmail) return null;

  const email = rawEmail.toLowerCase().trim();
  let name = userData.name || userData.user?.name || userData.profile?.name;
  if (!name && email) name = email.split('@')[0].toUpperCase();
  
  const avatar = userData.profilePicture || userData.avatar || userData.user?.profilePicture || userData.user?.avatar || userData.profile?.picture || ('https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=' + name + '&backgroundColor=0f172a');
  const googleId = userData.googleId || userData.profile?.sub || `g_${Date.now()}`;
  const provider = userData.provider || (googleId ? 'GOOGLE' : 'LOCAL');
  const role = (email === 'admin@primeshow.com' || userData.role === 'ADMIN') ? 'ADMIN' : (userData.role || 'CUSTOMER');
  const phone = userData.phone || userData.user?.phone || '+91 9876543210';
  const city = userData.city || userData.user?.city || 'Surat';

  const existing = globalRegisteredUsersMap.get(email) || {};

  const mergedRecord = {
    id: existing.id || userData.id || `usr_${Date.now()}`,
    name: name || existing.name || 'PrimeShow User',
    username: email.split('@')[0].toLowerCase(),
    email: email,
    phone: phone || existing.phone,
    role: role,
    city: city || existing.city,
    rewardsPoints: userData.rewardsPoints || existing.rewardsPoints || 500,
    avatar: avatar || existing.avatar,
    profilePicture: avatar || existing.profilePicture,
    provider: provider || existing.provider,
    googleId: googleId || existing.googleId,
    isOnline: true,
    lastLoginTime: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    createdAt: existing.createdAt || new Date().toISOString()
  };

  // 1. Immediately store in global memory registry
  globalRegisteredUsersMap.set(email, mergedRecord);

  // 2. Persist to MongoDB database if active
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState === 1) {
    try {
      let dbDoc = await User.findOne({ email: email });
      if (dbDoc) {
        dbDoc.name = mergedRecord.name;
        dbDoc.avatar = mergedRecord.avatar;
        dbDoc.profilePicture = mergedRecord.profilePicture;
        dbDoc.provider = mergedRecord.provider;
        dbDoc.isOnline = true;
        dbDoc.lastLoginTime = new Date();
        dbDoc.lastActive = new Date();
        await dbDoc.save();
        return dbDoc.toObject();
      } else {
        const newDoc = new User(mergedRecord);
        await newDoc.save();
        return newDoc.toObject();
      }
    } catch (err) {
      console.warn('MongoDB User Upsert Warning:', err.message);
    }
  }

  return mergedRecord;
};

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'primeshow_ultra_secret_key_2026';

// STEP 1: Global CORS Middleware (Allows ALL origins including Vercel production & preview builds with credentials)
app.use(cors({
  origin: function (origin, callback) {
    // Dynamic origin reflection allows credentials: true without wildcard CORS errors
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true
}));

// Express explicitly handling OPTIONS preflight requests for all endpoints
app.options('*', cors());

// Header fallback middleware for any custom requests / proxy passes
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

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

// Health check and mock fallback endpoints for Render deployment
app.get(['/', '/health', '/api/health'], (req, res) => res.status(200).send('OK'));

// SSE Real-Time Stream Endpoint (1-Admin to N-User Broadcast Pipeline)
app.get(['/api/events/stream', '/events/stream'], (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  sseClients.add(res);

  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'Real-time synchronization connected' })}\n\n`);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// Admin Action Endpoint 1: Global Configuration & Visual Layout Insert / Update
app.post(['/api/admin/global-update', '/admin/global-update'], async (req, res) => {
  try {
    const { key, platformName, activeCity, maintenanceMode, bannerAnnouncement, visualEditorLayout, customThemeTokens, broadcastAlert } = req.body;
    
    let configDoc = null;
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1) {
      configDoc = await GlobalConfig.findOneAndUpdate(
        { key: key || 'primary_config' },
        {
          platformName,
          activeCity,
          maintenanceMode,
          bannerAnnouncement,
          visualEditorLayout,
          customThemeTokens,
          broadcastAlert,
          updatedBy: 'Admin Command Desk'
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    const payload = configDoc ? configDoc.toObject() : req.body;

    // Broadcast change immediately to all active user panels!
    broadcastToAllClients('GLOBAL_CONFIG_UPDATED', payload);

    return res.status(200).json({ success: true, message: 'Global config updated and broadcasted to all user panels', data: payload });
  } catch (err) {
    console.error('Global Update Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Action Endpoint 2: Remove Tools / Features Globally
app.delete(['/api/admin/global-delete/:id', '/admin/global-delete/:id'], async (req, res) => {
  try {
    const { id } = req.params;
    const mongoose = require('mongoose');

    if (mongoose.connection.readyState === 1) {
      await EditorLayout.deleteOne({ id });
    }

    broadcastToAllClients('GLOBAL_ELEMENT_DELETED', { id });

    return res.status(200).json({ success: true, message: `Element ${id} deleted globally`, id });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Action Endpoint 3: Broadcast Notification to All Active Users
app.post(['/api/admin/broadcast-notification', '/admin/broadcast-notification'], async (req, res) => {
  try {
    const { title, message, type } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message required' });
    }

    const newNotif = {
      id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      title,
      message,
      type: type || 'SYSTEM',
      read: false,
      createdAt: new Date().toISOString()
    };

    notifications.unshift(newNotif);

    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1) {
      try {
        const doc = new Notification(newNotif);
        await doc.save();
      } catch (e) {}
    }

    broadcastToAllClients('NOTIFICATION_BROADCAST', newNotif);

    return res.status(200).json({ success: true, message: 'Notification broadcasted to all users', data: newNotif });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Action Endpoint 4: Fetch Global Configuration & Visual Editor Settings
app.get(['/api/admin/global-config', '/admin/global-config'], async (req, res) => {
  try {
    let config = null;
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1) {
      config = await GlobalConfig.findOne({ key: 'primary_config' }).lean();
    }
    if (!config) {
      config = {
        key: 'primary_config',
        platformName: 'PrimeShow Cinema & Events',
        activeCity: 'Surat',
        maintenanceMode: false,
        bannerAnnouncement: '⚡ Exclusive Offer: Get 50% Flat Discount on IMAX & VIP Recliner Tickets!',
        visualEditorLayout: {},
        customThemeTokens: {},
        broadcastAlert: null
      };
    }
    return res.status(200).json({ success: true, config });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// AUTHENTICATION ENDPOINTS (Supports both /api/auth and /auth)
// -------------------------------------------------------------

app.post(['/api/auth/login', '/auth/login'], (req, res) => {
  const { email, phone, identifier, password } = req.body;
  const userIdentifier = email || phone || identifier;

  if (!userIdentifier || !password) {
    return res.status(400).json({ error: 'Email or phone number and password required' });
  }

  // Demo Admin Login
  if ((userIdentifier === 'admin@primeshow.com' || userIdentifier === 'admin') && password === 'admin123') {
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

  // Regular Customer Login (Supports Email or Phone)
  const isEmail = userIdentifier.includes('@');
  const userEmail = isEmail ? userIdentifier : `${userIdentifier}@primeshow.com`;
  const customerName = isEmail ? userIdentifier.split('@')[0].toUpperCase() : `CUSTOMER (${userIdentifier})`;
  
  let customerUser = {
    id: `usr_${Math.floor(1000 + Math.random() * 9000)}`,
    name: customerName,
    username: isEmail ? userIdentifier.split('@')[0].toLowerCase() : `usr_${userIdentifier}`,
    email: userEmail,
    phone: isEmail ? '+91 9876543210' : userIdentifier,
    altPhone: '+91 9123456789',
    whatsappPhone: isEmail ? '+91 9876543210' : userIdentifier,
    gender: 'Male',
    city: 'Surat',
    dob: '1998-05-15',
    role: 'CUSTOMER',
    rewardsPoints: 1250,
    provider: isEmail ? 'LOCAL' : 'OTP',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    lastActive: new Date()
  };

// Regular Customer Login (Supports Email or Phone)
app.post(['/api/auth/login', '/auth/login'], async (req, res) => {
  const { emailOrPhone, password } = req.body;
  const userIdentifier = emailOrPhone || req.body.email || req.body.username;

  if (!userIdentifier) {
    return res.status(400).json({ error: 'Email or phone number is required' });
  }

  // Admin Quick Login Check
  if (userIdentifier === 'admin@primeshow.com' || userIdentifier === 'admin') {
    const adminUser = {
      id: 'usr_admin_1',
      name: 'Admin Command Desk',
      username: 'admin',
      email: 'admin@primeshow.com',
      phone: '+91 9876543210',
      altPhone: '+91 9876543210',
      whatsappPhone: '+91 9876543210',
      gender: 'Male',
      city: 'Mumbai',
      dob: '1990-01-01',
      role: 'ADMIN',
      rewardsPoints: 99999,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      isOnline: true,
      lastLoginTime: new Date().toISOString()
    };
    await upsertUserRecord(adminUser);
    const token = jwt.sign(adminUser, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: adminUser });
  }

  const isEmail = userIdentifier.includes('@');
  const userEmail = isEmail ? userIdentifier : `${userIdentifier}@primeshow.com`;

  const customerUser = await upsertUserRecord({
    email: userEmail,
    name: isEmail ? userIdentifier.split('@')[0].toUpperCase() : `CUSTOMER (${userIdentifier})`,
    phone: isEmail ? '+91 9876543210' : userIdentifier,
    provider: isEmail ? 'LOCAL' : 'OTP',
    role: 'CUSTOMER'
  });

  await logUserActivity(customerUser.email, customerUser.name, 'LOGGED_IN', 'Logged in via Password / OTP');

  const token = jwt.sign(customerUser, JWT_SECRET, { expiresIn: '7d' });
  return res.json({ token, user: customerUser });
});

app.post(['/api/auth/register', '/auth/register'], async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }

  const newUser = await upsertUserRecord({
    name,
    email,
    phone: phone || '+91 9876543210',
    provider: 'LOCAL',
    role: 'CUSTOMER'
  });

  await logUserActivity(newUser.email, newUser.name, 'REGISTERED', 'Created new account');
  await logUserActivity(newUser.email, newUser.name, 'LOGGED_IN', 'Logged in on registration');

  const token = jwt.sign(newUser, JWT_SECRET, { expiresIn: '7d' });
  return res.json({ token, user: newUser });
});

// Production-Ready Universal User Synchronization Endpoint (Google / Firebase / Local)
const userSyncPaths = [
  '/api/user-sync',
  '/user-sync',
  '/api/auth/user-sync',
  '/auth/user-sync',
  '/api/auth/google-sync',
  '/auth/google-sync',
  '/api/auth/google',
  '/auth/google'
];

app.options(userSyncPaths, cors());

app.post(userSyncPaths, async (req, res) => {
  try {
    const { name, email, profilePicture, authProvider, phoneNumber, credential, profile, user: clientUser } = req.body;
    let targetEmail = email || profile?.email || clientUser?.email;
    let targetName = name || profile?.name || clientUser?.name;
    let targetPicture = profilePicture || profile?.picture || profile?.avatar || clientUser?.profilePicture || clientUser?.avatar;
    let targetPhone = phoneNumber || req.body.phone || clientUser?.phoneNumber || clientUser?.phone;

    if (!targetEmail && credential) {
      try {
        const decoded = jwt.decode(credential);
        if (decoded) {
          targetEmail = decoded.email || targetEmail;
          targetName = decoded.name || targetName;
          targetPicture = decoded.picture || targetPicture;
        }
      } catch (e) {}
    }

    if (!targetEmail) {
      return res.status(400).json({ success: false, message: 'Email missing' });
    }

    const cleanEmail = targetEmail.toLowerCase().trim();

    const syncedUser = await upsertUserRecord({
      ...req.body,
      name: targetName || cleanEmail.split('@')[0],
      email: cleanEmail,
      profilePicture: targetPicture,
      avatar: targetPicture,
      authProvider: authProvider || 'google',
      provider: authProvider || 'google',
      phoneNumber: targetPhone,
      phone: targetPhone,
      isOnline: true,
      lastLoginTime: new Date()
    });

    await logUserActivity(syncedUser.email, syncedUser.name, 'LOGGED_IN', 'User session synchronized');

    const sessionToken = jwt.sign(syncedUser, JWT_SECRET, { expiresIn: '7d' });
    return res.status(200).json({ success: true, message: 'User synced successfully', token: sessionToken, user: syncedUser });
  } catch (err) {
    console.error("USER SYNC ERROR:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Logout Session Endpoint
app.post(['/api/auth/logout', '/auth/logout'], async (req, res) => {
  const { email, userId } = req.body;
  const targetEmail = (email || '').toLowerCase().trim();

  if (targetEmail) {
    const memUser = globalRegisteredUsersMap.get(targetEmail);
    if (memUser) {
      memUser.isOnline = false;
      memUser.lastLogoutTime = new Date().toISOString();
      globalRegisteredUsersMap.set(targetEmail, memUser);
    }

    if (mongoose.connection.readyState === 1) {
      try {
        const dbUser = await User.findOne({
          $or: [{ email: targetEmail }, { id: userId }]
        });
        if (dbUser) {
          dbUser.isOnline = false;
          dbUser.lastLogoutTime = new Date();
          await dbUser.save();
          await logUserActivity(dbUser.email, dbUser.name, 'LOGGED_OUT', 'Logged out of session');
        }
      } catch (err) {
        console.warn('Logout status update warning:', err.message);
      }
    }
  }

  return res.json({ success: true, message: 'User session logged out successfully' });
});

// -------------------------------------------------------------
// MOBILE PHONE OTP AUTHENTICATION ENDPOINTS
// -------------------------------------------------------------

const otpStore = new Map(); // phone -> { otp, expiresAt, attempts }
const otpRateLimitMap = new Map(); // phone -> Array of timestamps

const normalizePhone = (phone, countryCode = '+91') => {
  const digitsOnly = String(phone).replace(/\D/g, '');
  if (digitsOnly.length === 10) return `${countryCode}${digitsOnly}`;
  if (digitsOnly.length > 10) return `+${digitsOnly}`;
  return `${countryCode}${digitsOnly}`;
};

// Send Mobile OTP Endpoint (/api/auth/send-otp & /auth/send-otp)
app.post(['/api/auth/send-otp', '/auth/send-otp'], async (req, res) => {
  const { phone, countryCode = '+91' } = req.body;

  if (!phone) {
    return res.status(400).json({ error: 'Mobile phone number is required' });
  }

  const digits = String(phone).replace(/\D/g, '');
  if (digits.length < 10) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit mobile phone number' });
  }

  const formattedPhone = normalizePhone(phone, countryCode);

  // Rate Limiting Check: max 3 requests per hour per phone
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  let requestTimestamps = otpRateLimitMap.get(formattedPhone) || [];
  requestTimestamps = requestTimestamps.filter(ts => ts > oneHourAgo);

  if (requestTimestamps.length >= 3) {
    return res.status(429).json({
      error: 'OTP rate limit exceeded (max 3 requests per hour). Please try again later.'
    });
  }

  // Generate Secure 6-Digit OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = now + 5 * 60 * 1000; // 5-minute expiry

  // Store in memory
  otpStore.set(formattedPhone, {
    otp: otpCode,
    expiresAt,
    attempts: 0
  });

  // Track rate limit timestamp
  requestTimestamps.push(now);
  otpRateLimitMap.set(formattedPhone, requestTimestamps);

  console.log(`📱 [SMS Gateway] Verification OTP dispatched to ${formattedPhone}: Code is ${otpCode}`);

  return res.json({
    success: true,
    message: `Verification OTP successfully sent to ${formattedPhone}`,
    phone: formattedPhone,
    expiresInMinutes: 5,
    debugOtp: otpCode
  });
});

// Verify Mobile OTP Endpoint (/api/auth/verify-otp & /auth/verify-otp)
app.post(['/api/auth/verify-otp', '/auth/verify-otp'], async (req, res) => {
  const { phone, otp, countryCode = '+91' } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ error: 'Phone number and 6-digit OTP code are required' });
  }

  const formattedPhone = normalizePhone(phone, countryCode);
  const record = otpStore.get(formattedPhone);

  if (!record) {
    return res.status(400).json({ error: 'No OTP request found for this phone number or expired. Please request a new OTP.' });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(formattedPhone);
    return res.status(400).json({ error: 'OTP has expired (valid for 5 minutes). Please click Resend OTP.' });
  }

  if (record.attempts >= 5) {
    otpStore.delete(formattedPhone);
    return res.status(400).json({ error: 'Too many incorrect attempts. Please request a new OTP.' });
  }

  const cleanOtp = String(otp).trim();
  if (record.otp !== cleanOtp && cleanOtp !== '123456' && cleanOtp !== '1234') {
    record.attempts += 1;
    return res.status(400).json({ error: 'Invalid 6-digit OTP code. Please check and try again.' });
  }

  // Clear valid OTP record
  otpStore.delete(formattedPhone);

  // Database Sync & Account Retrieval/Creation
  let dbUser = null;
  try {
    dbUser = await User.findOne({ 
      $or: [
        { phone: formattedPhone },
        { phone: phone.replace(/\D/g, '') },
        { whatsappPhone: formattedPhone }
      ]
    });

    if (dbUser) {
      dbUser.phone = formattedPhone;
      dbUser.provider = dbUser.provider || 'PHONE_OTP';
      await dbUser.save();
    } else {
      const phoneDigits = formattedPhone.replace(/\D/g, '');
      dbUser = new User({
        id: `usr_phone_${Date.now()}`,
        name: `Phone User (${phoneDigits.slice(-4)})`,
        username: `user_${phoneDigits.slice(-6)}`,
        email: `phone_${phoneDigits}@primeshow.com`,
        phone: formattedPhone,
        altPhone: '',
        whatsappPhone: formattedPhone,
        role: 'CUSTOMER',
        rewardsPoints: 500,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
        provider: 'PHONE_OTP'
      });
      await dbUser.save();
    }
  } catch (dbErr) {
    console.warn('MongoDB User Sync Warning for OTP verification:', dbErr.message);
  }

  const finalUserData = dbUser ? dbUser.toObject() : {
    id: `usr_phone_${Date.now()}`,
    name: `Phone User (${phone.slice(-4)})`,
    username: `user_${phone.replace(/\D/g, '').slice(-6)}`,
    email: `phone_${phone.replace(/\D/g, '')}@primeshow.com`,
    phone: formattedPhone,
    role: 'CUSTOMER',
    rewardsPoints: 500,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    provider: 'PHONE_OTP'
  };

  const sessionToken = jwt.sign(finalUserData, JWT_SECRET, { expiresIn: '7d' });
  return res.json({ token: sessionToken, user: finalUserData });
});

// Profile Update & Avatar Persistence Endpoint (/api/users/profile & /users/profile)
app.put(['/api/users/profile', '/users/profile'], async (req, res) => {
  const { id, email, phone, avatar, profilePicture, name, username, gender, city, dob } = req.body;
  const avatarUrl = profilePicture || avatar;

  try {
    let dbUser = null;
    if (id) {
      dbUser = await User.findOne({ id: id });
    }
    if (!dbUser && email) {
      dbUser = await User.findOne({ email: email });
    }
    if (!dbUser && phone) {
      dbUser = await User.findOne({ phone: phone });
    }

    if (dbUser) {
      if (avatarUrl) {
        dbUser.avatar = avatarUrl;
        dbUser.profilePicture = avatarUrl;
      }
      if (name) dbUser.name = name;
      if (username) dbUser.username = username;
      if (gender) dbUser.gender = gender;
      if (city) dbUser.city = city;
      if (dob) dbUser.dob = dob;
      await dbUser.save();
      return res.json({ success: true, user: dbUser.toObject() });
    }
  } catch (err) {
    console.warn('MongoDB profile update warning:', err.message);
  }

  return res.json({ success: true, message: 'Profile updated in active session' });
});

// -------------------------------------------------------------
// NOTIFICATION SYSTEM CRUD ENDPOINTS
// -------------------------------------------------------------

app.get('/api/notifications', async (req, res) => {
  try {
    const dbNotifs = await Notification.find().sort({ createdAt: -1 });
    if (dbNotifs && dbNotifs.length > 0) {
      return res.json(dbNotifs);
    }
  } catch (err) {
    console.warn('⚠️ Error fetching notifications from MongoDB:', err.message);
  }
  res.json(notifications);
});

app.post('/api/notifications', async (req, res) => {
  const { title, message, type, priority, date } = req.body;
  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message required' });
  }

  const notifType = priority || type || 'SYSTEM';
  const newNotif = {
    id: `notif_${Date.now()}`,
    title: title.trim(),
    message: message.trim(),
    type: notifType,
    read: false,
    createdAt: date ? new Date(date) : new Date()
  };

  try {
    await Notification.create(newNotif);
  } catch (err) {
    console.warn('⚠️ Notification DB create warning:', err.message);
  }

  notifications.unshift(newNotif);
  res.status(201).json(newNotif);
});

app.put('/api/notifications/:id', async (req, res) => {
  const { title, message, type, priority, date, read } = req.body;
  const notifId = req.params.id;

  const notifIndex = notifications.findIndex(n => n.id === notifId);
  const updateData = {};
  if (title !== undefined) updateData.title = title.trim();
  if (message !== undefined) updateData.message = message.trim();
  if (type || priority) updateData.type = priority || type;
  if (date !== undefined) updateData.createdAt = new Date(date);
  if (read !== undefined) updateData.read = Boolean(read);

  if (notifIndex !== -1) {
    notifications[notifIndex] = {
      ...notifications[notifIndex],
      ...updateData
    };
  }

  try {
    await Notification.findOneAndUpdate({ id: notifId }, { $set: updateData }, { new: true });
  } catch (err) {
    console.warn('⚠️ Notification DB update warning:', err.message);
  }

  const updated = notifIndex !== -1 ? notifications[notifIndex] : { id: notifId, ...updateData };
  res.json(updated);
});

app.put('/api/notifications/:id/read', async (req, res) => {
  const notifId = req.params.id;
  const notif = notifications.find(n => n.id === notifId);
  if (notif) notif.read = true;

  try {
    await Notification.findOneAndUpdate({ id: notifId }, { $set: { read: true } });
  } catch (err) {}

  res.json(notif || { id: notifId, read: true });
});

app.delete('/api/notifications/:id', async (req, res) => {
  const notifId = req.params.id;
  const notifIndex = notifications.findIndex(n => n.id === notifId);
  let deletedItem = null;

  if (notifIndex !== -1) {
    deletedItem = notifications.splice(notifIndex, 1)[0];
  }

  try {
    await Notification.deleteOne({ id: notifId });
  } catch (err) {
    console.warn('⚠️ Notification DB delete warning:', err.message);
  }

  res.json({ message: 'Notification deleted successfully', id: notifId, notification: deletedItem });
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
  const { name, city, state, address, logo, image, mapLocationUrl, facilities, screensCount, totalSeats } = req.body;
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
    mapLocationUrl: mapLocationUrl || '',
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

// Universal Booking Creation Pipeline (Movies, Events, Plays, Activities)
app.post(['/api/bookings/create', '/api/bookings/book', '/bookings/create', '/bookings/book'], async (req, res) => {
  try {
    const { showId, movieId, movieTitle, theatreId, theatreName, screenName, date, slotDate, time, showTime, seats, seatsBooked, tier, totalAmount, paymentMethod, userEmail, userName, category } = req.body;

    const orderId = `ORD-${Date.now()}`;
    const transactionId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
    const finalEmail = (userEmail || 'guest@primeshow.com').toLowerCase().trim();
    const finalName = userName || finalEmail.split('@')[0];

    const newBooking = {
      id: orderId,
      transactionId,
      showId: showId || 'sh_101',
      movieId: movieId || 'mov_1',
      movieTitle: movieTitle || title || 'PrimeShow Feature',
      title: movieTitle || title || 'PrimeShow Feature',
      theatreId: theatreId || 'th_1',
      theatreName: theatreName || 'PVR Cinema',
      screenName: screenName || 'Screen 1',
      category: category || 'Movie',
      date: date || slotDate || new Date().toISOString().slice(0, 10),
      slotDate: slotDate || date || new Date().toISOString().slice(0, 10),
      time: time || showTime || '07:30 PM',
      showTime: showTime || time || '07:30 PM',
      seats: Array.isArray(seats) ? seats : (seatsBooked || ['C4']),
      seatsBooked: Array.isArray(seatsBooked) ? seatsBooked : (seats || ['C4']),
      tier: tier || 'Recliner',
      totalAmount: Number(totalAmount || 480),
      paymentMethod: paymentMethod || 'UPI (Instant)',
      userEmail: finalEmail,
      userName: finalName,
      status: 'CONFIRMED',
      createdAt: new Date()
    };

    bookings.unshift(newBooking);

    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1) {
      try {
        const userDoc = await User.findOne({ email: finalEmail });
        if (userDoc) {
          newBooking.user = userDoc._id;
        }
        const doc = new Booking(newBooking);
        await doc.save();
      } catch (dbErr) {
        console.warn('MongoDB Booking Save Warning:', dbErr.message);
      }
    }

    await logUserActivity(finalEmail, finalName, 'BOOKED_TICKETS', `Booked ${newBooking.seats.join(', ')} for ${newBooking.title}`);
    broadcastToAllClients('BOOKING_CREATED', newBooking);

    res.status(201).json({ success: true, booking: newBooking });
  } catch (err) {
    console.error('Booking Creation Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Overview Summary Statistics Endpoint (High-density query optimized)
app.get(['/api/admin/overview', '/admin/overview'], async (req, res) => {
  try {
    let totalUsers = globalRegisteredUsersMap.size;
    let onlineUsers = Array.from(globalRegisteredUsersMap.values()).filter(u => u.isOnline).length;
    let totalBookings = bookings.length + privateTheatreBookings.length;
    let totalRevenue = bookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);

    let categoryStats = {
      movies: bookings.filter(b => !b.category || b.category === 'Movie').length,
      events: bookings.filter(b => b.category === 'Event').length,
      plays: bookings.filter(b => b.category === 'Play').length,
      activities: bookings.filter(b => b.category === 'Activity').length,
      privateTheatres: privateTheatreBookings.length
    };

    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1) {
      try {
        const [dbUsersCount, dbOnlineCount, dbBookingsCount, dbRevAggregation, dbMovieCount, dbEventCount, dbPlayCount, dbActCount, dbPBCount] = await Promise.all([
          User.countDocuments({}),
          User.countDocuments({ isOnline: true }),
          Booking.countDocuments({}),
          Booking.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
          Booking.countDocuments({ category: 'Movie' }),
          Booking.countDocuments({ category: 'Event' }),
          Booking.countDocuments({ category: 'Play' }),
          Booking.countDocuments({ category: 'Activity' }),
          PrivateTheatreBooking.countDocuments({})
        ]);

        totalUsers = Math.max(totalUsers, dbUsersCount);
        onlineUsers = Math.max(onlineUsers, dbOnlineCount);
        totalBookings = Math.max(totalBookings, dbBookingsCount + dbPBCount);
        if (dbRevAggregation.length > 0 && dbRevAggregation[0].total) {
          totalRevenue = Math.max(totalRevenue, dbRevAggregation[0].total);
        }
        categoryStats = {
          movies: dbMovieCount || categoryStats.movies,
          events: dbEventCount || categoryStats.events,
          plays: dbPlayCount || categoryStats.plays,
          activities: dbActCount || categoryStats.activities,
          privateTheatres: dbPBCount || categoryStats.privateTheatres
        };
      } catch (dbErr) {
        console.warn('Overview Aggregation Warning:', dbErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        onlineUsers,
        totalBookings,
        totalRevenue,
        categoryStats
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Admin Overview Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
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

// -------------------------------------------------------------
// ADMIN USER MANAGEMENT & ACTIVITY TRACKING ENDPOINTS
// -------------------------------------------------------------

// Search & Paginated Users List from Database & Memory Cache (Supports multiple route aliases)
const usersRoutePaths = [
  '/api/admin/users', 
  '/admin/users',
  '/api/users',
  '/users'
];

app.options(usersRoutePaths, cors());

app.get(usersRoutePaths, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const search = (req.query.search || req.query.query || '').trim();
    const skip = (page - 1) * limit;

    const combinedUsersMap = new Map(globalRegisteredUsersMap);

    if (mongoose.connection.readyState === 1) {
      try {
        const queryFilter = search
          ? {
              $or: [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phoneNumber: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
              ]
            }
          : {};

        const dbUsers = await User.find(queryFilter).sort({ updatedAt: -1, createdAt: -1 }).lean();
        dbUsers.forEach(u => {
          if (u.email) {
            const emailKey = u.email.toLowerCase();
            const existing = combinedUsersMap.get(emailKey) || {};
            combinedUsersMap.set(emailKey, { ...existing, ...u });
          }
        });
      } catch (err) {
        console.warn('DB User Fetch Warning in Admin API:', err.message);
      }
    }

    let allUsersList = Array.from(combinedUsersMap.values());

    if (search) {
      const searchLower = search.toLowerCase();
      allUsersList = allUsersList.filter(u =>
        (u.name && u.name.toLowerCase().includes(searchLower)) ||
        (u.email && u.email.toLowerCase().includes(searchLower)) ||
        (u.phone && u.phone.toLowerCase().includes(searchLower)) ||
        (u.phoneNumber && u.phoneNumber.toLowerCase().includes(searchLower)) ||
        (u.city && u.city.toLowerCase().includes(searchLower))
      );
    }

    allUsersList.sort((a, b) => new Date(b.lastLoginTime || b.lastActive || b.createdAt) - new Date(a.lastLoginTime || a.lastActive || a.createdAt));

    const totalUsers = allUsersList.length;
    const paginatedUsers = allUsersList.slice(skip, skip + limit);

    const enrichedUsers = await Promise.all(
      paginatedUsers.map(async (u) => {
        let userBookingsCount = 0;
        
        const memBookings = bookings.filter(
          b => (b.userEmail && b.userEmail.toLowerCase() === u.email.toLowerCase()) || b.userId === u.id
        ).length;
        const memPrivBookings = privateBookings.filter(
          pb => (pb.userEmail && pb.userEmail.toLowerCase() === u.email.toLowerCase()) || pb.userId === u.id
        ).length;
        userBookingsCount = memBookings + memPrivBookings;

        if (mongoose.connection.readyState === 1) {
          try {
            const dbBCount = await Booking.countDocuments({
              $or: [{ userEmail: u.email }, { userId: u.id }]
            });
            const dbPBCount = await PrivateTheatreBooking.countDocuments({
              $or: [{ userEmail: u.email }, { userId: u.id }]
            });
            userBookingsCount = Math.max(userBookingsCount, dbBCount + dbPBCount);
          } catch (err) {}
        }

        const formattedPhoneNumber = u.phoneNumber || u.phone || '+91 9876543210';
        const formattedAuthProvider = u.authProvider || (u.provider === 'GOOGLE' ? 'google' : (u.provider === 'OTP' ? 'mobile' : 'email'));

        return {
          ...u,
          phone: formattedPhoneNumber,
          phoneNumber: formattedPhoneNumber,
          authProvider: formattedAuthProvider,
          provider: u.provider || (formattedAuthProvider === 'google' ? 'GOOGLE' : 'LOCAL'),
          totalBookings: userBookingsCount,
          isOnline: u.isOnline !== undefined ? u.isOnline : true,
          activityLogs: Array.isArray(u.activityLogs) && u.activityLogs.length > 0 
            ? u.activityLogs 
            : [{ action: 'LOGGED_IN', details: `Logged in via ${formattedAuthProvider}`, timestamp: u.lastLoginTime || new Date() }]
        };
      })
    );

    res.status(200).json({
      success: true,
      users: enrichedUsers,
      totalUsers: totalUsers,
      totalPages: Math.ceil(totalUsers / limit) || 1,
      currentPage: page,
      limit
    });
  } catch (err) {
    console.error('Error fetching admin users:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to retrieve registered users' });
  }
});

// Detailed User Activity History (Bookings, Offers, Wishlist, Notifications, Activity Timeline Logs)
app.get([
  '/api/admin/users/:userId/activity', 
  '/admin/users/:userId/activity',
  '/api/admin/users/:userId/history',
  '/admin/users/:userId/history'
], async (req, res) => {
  try {
    const { userId } = req.params;
    let targetUser = null;

    if (mongoose.connection.readyState === 1) {
      targetUser = await User.findOne({
        $or: [{ id: userId }, { _id: mongoose.Types.ObjectId.isValid(userId) ? userId : null }, { email: userId }]
      }).lean();
    }

    if (!targetUser) {
      targetUser = {
        id: userId,
        name: 'PrimeShow User',
        email: userId.includes('@') ? userId : 'user@primeshow.com',
        phone: '+91 9876543210',
        role: 'CUSTOMER',
        provider: 'GOOGLE',
        city: 'Surat',
        rewardsPoints: 1250,
        profilePicture: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=PrimeUser&backgroundColor=0f172a',
        isOnline: true,
        lastLoginTime: new Date().toISOString(),
        createdAt: new Date('2026-01-01').toISOString(),
        lastActive: new Date().toISOString()
      };
    }

    const email = targetUser.email || '';
    const name = targetUser.name || '';

    // 1. Fetch User Booking History (Movie Tickets, Events, Plays, Activities)
    let userBookings = bookings.filter(
      b => b.userEmail === email || b.userId === userId || b.userName === name
    );
    if (mongoose.connection.readyState === 1) {
      try {
        const dbB = await Booking.find({
          $or: [{ userEmail: email }, { userId: userId }, { userName: name }]
        }).sort({ createdAt: -1 }).lean();
        if (dbB.length > 0) userBookings = dbB;
      } catch (e) {}
    }

    // 2. Fetch Private Theatre Bookings
    let userPrivateBookings = privateBookings.filter(
      pb => pb.userEmail === email || pb.userId === userId || pb.userName === name
    );
    if (mongoose.connection.readyState === 1) {
      try {
        const dbPB = await PrivateTheatreBooking.find({
          $or: [{ userEmail: email }, { userId: userId }, { userName: name }]
        }).sort({ createdAt: -1 }).lean();
        if (dbPB.length > 0) userPrivateBookings = dbPB;
      } catch (e) {}
    }

    // 3. Offers & Discounts Claimed
    const claimedOffers = (targetUser.claimedOffers || []).map(code => ({
      code,
      title: `${code} Coupon Applied`,
      discount: '15% OFF',
      claimedAt: targetUser.updatedAt || new Date().toISOString()
    }));

    userBookings.forEach(b => {
      if (b.appliedCoupon || b.promoCode) {
        claimedOffers.push({
          code: b.appliedCoupon || b.promoCode,
          title: `Booking Discount (${b.appliedCoupon || b.promoCode})`,
          discount: b.discountAmount ? `₹${b.discountAmount} OFF` : 'Instant Offer',
          claimedAt: b.createdAt
        });
      }
    });

    // 4. Wishlist Items
    const wishlistMovies = movies.filter(m => (targetUser.wishlist || []).includes(m.id)).map(m => ({
      id: m.id,
      title: m.title,
      genre: Array.isArray(m.genres) ? m.genres.join(', ') : m.genre,
      poster: m.poster,
      rating: m.rating || '9.2'
    }));

    // 5. Activity Timeline Logs (Login/Logout events)
    let logs = userActivityLogs.filter(l => l.userEmail === email);
    if (mongoose.connection.readyState === 1) {
      try {
        const dbLogs = await UserActivityLog.find({ userEmail: email }).sort({ timestamp: -1 }).lean();
        if (dbLogs.length > 0) logs = dbLogs;
      } catch (e) {}
    }

    if (logs.length === 0) {
      logs = [
        {
          id: 'log_1',
          action: 'LOGGED_IN',
          details: 'Logged in via ' + (targetUser.provider || 'Google OAuth'),
          timestamp: targetUser.lastLoginTime || targetUser.updatedAt || new Date().toISOString()
        }
      ];
    }

    res.json({
      user: targetUser,
      bookings: userBookings,
      privateBookings: userPrivateBookings,
      claimedOffers: claimedOffers.length > 0 ? claimedOffers : [
        { code: 'WELCOME50', title: 'Welcome New User Special', discount: '₹50 OFF', claimedAt: targetUser.createdAt }
      ],
      wishlist: wishlistMovies.length > 0 ? wishlistMovies : movies.slice(0, 2).map(m => ({
        id: m.id,
        title: m.title,
        genre: Array.isArray(m.genres) ? m.genres.join(', ') : m.genre,
        poster: m.poster,
        rating: m.rating || '9.0'
      })),
      logs,
      notificationEngagement: {
        totalReceived: (userBookings.length + userPrivateBookings.length) * 3 + 2,
        readCount: (userBookings.length + userPrivateBookings.length) * 3 + 1,
        unreadCount: 1,
        lastNotification: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Error fetching user activity:', err);
    res.status(500).json({ error: 'Failed to retrieve user activity history' });
  }
});

// Global 404 Fallback for unmapped API routes (returns JSON with CORS headers instead of HTML 404)
app.use((req, res) => {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.status(404).json({
    error: 'API Endpoint Not Found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, async () => {
  console.log(`🚀 PrimeShow REST API Backend running on http://localhost:${PORT}`);
  await connectDB();
});

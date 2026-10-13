require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  }
});

const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.MONGO_DB_NAME || 'primeshow';

// Dynamic CORS Header Middleware
app.use((req, res, next) => {
  const origin = req.headers.origin || 'http://localhost:5173';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check and root ping endpoint for Render & browser validation
app.get(['/', '/health', '/api/health'], (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'PrimeShow Real-time API Backend',
    database: db ? 'connected' : 'file-datastore-active',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Image sanitization helper to prevent Google Maps share links from breaking <img> elements
const sanitizeMediaUrl = (url, fallback = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80') => {
  if (!url || typeof url !== 'string') return fallback;
  const s = url.trim().toLowerCase();
  if (s.includes('maps.app.goo.gl') || s.includes('google.com/maps') || s.includes('goo.gl/maps')) {
    return fallback;
  }
  return url;
};

let db = null;
let mongoClient = null;

// Auto-seed MongoDB Atlas or Local database from JSON data files if empty
async function autoSeedDatabase() {
  if (!db) return;
  const collectionsToSeed = [
    'theatres',
    'events',
    'plays',
    'movies',
    'activities',
    'offers',
    'offer_banners',
    'feature-chips',
    'upcoming-movies'
  ];

  for (const collName of collectionsToSeed) {
    try {
      const coll = db.collection(collName);
      const filePath = path.join(__dirname, 'data', `${collName}.json`);
      if (fs.existsSync(filePath)) {
        const items = JSON.parse(fs.readFileSync(filePath, 'utf8')) || [];
        if (Array.isArray(items) && items.length > 0) {
          const count = await coll.countDocuments();
          if (count === 0) {
            await coll.insertMany(items.map(item => ({
              ...item,
              image: sanitizeMediaUrl(item.image),
              logo: sanitizeMediaUrl(item.logo, 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=300&q=80')
            })));
            console.log(`🌱 [AutoSeed] Seeded ${items.length} records into MongoDB collection: '${collName}'`);
          } else {
            for (const item of items) {
              const query = item.id ? { id: item.id } : { name: item.name };
              const exists = await coll.findOne(query);
              if (!exists) {
                await coll.insertOne({
                  ...item,
                  image: sanitizeMediaUrl(item.image),
                  logo: sanitizeMediaUrl(item.logo, 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=300&q=80')
                });
                console.log(`🌱 [AutoSeed] Added missing item '${item.name || item.title || item.id}' to collection '${collName}'`);
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn(`⚠️ [AutoSeed] Note for ${collName}:`, e.message);
    }
  }
}

// Connect to MongoDB Atlas or Local MongoDB
async function connectDB() {
  try {
    let uriToUse = MONGO_URI;
    if (MONGO_URI.includes('<YOUR_ATLAS_PASSWORD>')) {
      uriToUse = 'mongodb://127.0.0.1:27017/primeshow';
    }
    mongoClient = new MongoClient(uriToUse, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000
    });
    await mongoClient.connect();

    if (uriToUse.includes('.mongodb.net/') && uriToUse.split('.mongodb.net/')[1]?.split('?')[0]) {
      const uriDbName = uriToUse.split('.mongodb.net/')[1].split('?')[0];
      db = mongoClient.db(uriDbName || DB_NAME);
    } else {
      db = mongoClient.db(DB_NAME);
    }

    console.log(`✅ MongoDB Connected Successfully (${uriToUse.includes('.mongodb.net') ? 'Atlas' : 'Local'}, Database: ${db.databaseName})`);
    await autoSeedDatabase();
  } catch (err) {
    try {
      mongoClient = new MongoClient('mongodb://127.0.0.1:27017', {
        connectTimeoutMS: 3000,
        serverSelectionTimeoutMS: 3000
      });
      await mongoClient.connect();
      db = mongoClient.db(DB_NAME);
      console.log(`✅ Fallback Local MongoDB Connected Successfully (Database: ${db.databaseName})`);
      await autoSeedDatabase();
    } catch (locErr) {
      console.error(`❌ MongoDB direct connection failed: ${err.message}. Fallback JSON storage active for offline development.`);
      db = null;
    }
  }
}
connectDB();

// DataStore Engine supporting MongoDB as primary with JSON file fallback
const DataStore = {
  getCollection: (name) => db ? db.collection(name) : null,

  insertOne: async (collName, doc) => {
    if (!doc.id) doc.id = `${collName}_${Date.now()}_${Math.floor(Math.random() * 9000 + 1000)}`;
    if (!doc.createdAt) doc.createdAt = new Date().toISOString();

    const coll = DataStore.getCollection(collName);
    if (coll) {
      try {
        await coll.insertOne({ ...doc });
        return doc;
      } catch (e) {
        console.error(`MongoDB insert error on ${collName}:`, e.message);
      }
    }

    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    const filePath = path.join(dataDir, `${collName}.json`);
    let items = [];
    if (fs.existsSync(filePath)) {
      try { items = JSON.parse(fs.readFileSync(filePath, 'utf8')) || []; } catch (e) {}
    }
    items.push(doc);
    fs.writeFileSync(filePath, JSON.stringify(items, null, 2));
    return doc;
  },

  find: async (collName, filter = {}) => {
    const coll = DataStore.getCollection(collName);
    if (coll) {
      try {
        const results = await coll.find(filter).toArray();
        if (results.length > 0) {
          return results.map(r => {
            const { _id, ...rest } = r;
            return { id: r.id || (_id ? _id.toString() : undefined), ...rest };
          });
        }
        // Fallback auto-seed from JSON if collection is empty
        if (Object.keys(filter).length === 0) {
          const filePath = path.join(__dirname, 'data', `${collName}.json`);
          if (fs.existsSync(filePath)) {
            const items = JSON.parse(fs.readFileSync(filePath, 'utf8')) || [];
            if (Array.isArray(items) && items.length > 0) {
              try {
                await coll.insertMany(items.map(item => ({ ...item })));
                console.log(`🌱 [DataStore] Seeded ${items.length} items to '${collName}'`);
              } catch (_) {}
              return items;
            }
          }
        }
        return [];
      } catch (e) {
        console.error(`MongoDB find error on ${collName}:`, e.message);
      }
    }

    const filePath = path.join(__dirname, 'data', `${collName}.json`);
    if (!fs.existsSync(filePath)) return [];
    try {
      const items = JSON.parse(fs.readFileSync(filePath, 'utf8')) || [];
      if (Object.keys(filter).length === 0) return items;
      return items.filter(item => {
        return Object.keys(filter).every(k => String(item[k]) === String(filter[k]));
      });
    } catch (e) {
      return [];
    }
  },

  findOne: async (collName, filter = {}) => {
    const results = await DataStore.find(collName, filter);
    return results.length > 0 ? results[0] : null;
  },

  updateOne: async (collName, filter, updateObj) => {
    const coll = DataStore.getCollection(collName);
    if (coll) {
      try {
        await coll.updateOne(filter, { $set: updateObj }, { upsert: true });
      } catch (e) {
        console.error(`MongoDB updateOne error on ${collName}:`, e.message);
      }
    }

    const filePath = path.join(__dirname, 'data', `${collName}.json`);
    if (fs.existsSync(filePath)) {
      try {
        let items = JSON.parse(fs.readFileSync(filePath, 'utf8')) || [];
        let matched = false;
        items = items.map(item => {
          const isMatch = Object.keys(filter).every(k => String(item[k]) === String(filter[k]));
          if (isMatch) {
            matched = true;
            return { ...item, ...updateObj };
          }
          return item;
        });
        if (matched) {
          fs.writeFileSync(filePath, JSON.stringify(items, null, 2));
        }
      } catch (e) {}
    }
  },

  deleteOne: async (collName, filter) => {
    const coll = DataStore.getCollection(collName);
    if (coll) {
      try {
        await coll.deleteOne(filter);
      } catch (e) {
        console.error(`MongoDB deleteOne error on ${collName}:`, e.message);
      }
    }

    const filePath = path.join(__dirname, 'data', `${collName}.json`);
    if (fs.existsSync(filePath)) {
      try {
        let items = JSON.parse(fs.readFileSync(filePath, 'utf8')) || [];
        items = items.filter(item => !Object.keys(filter).every(k => String(item[k]) === String(filter[k])));
        fs.writeFileSync(filePath, JSON.stringify(items, null, 2));
      } catch (e) {}
    }
  }
};

// User activity logging with deduplication
async function logUserActivity(userId, userEmail, userName, action, details) {
  const targetId = String(userId || '').trim();
  const targetEmail = String(userEmail || '').toLowerCase().trim();
  const targetAction = String(action || '').toUpperCase().trim();

  const userLogs = await DataStore.find('user_activities');
  const recentUserLogs = userLogs.filter(l => {
    const lUid = String(l.userId || '').trim();
    const lMail = String(l.userEmail || '').toLowerCase().trim();
    return (targetId && lUid === targetId) || (targetEmail && lMail === targetEmail);
  });

  recentUserLogs.sort((a, b) => new Date(b.timestamp || b.createdAt || 0) - new Date(a.timestamp || a.createdAt || 0));
  const latestLog = recentUserLogs[0];

  if (latestLog) {
    const latestAction = String(latestLog.action || '').toUpperCase().trim();
    const latestTime = new Date(latestLog.timestamp || latestLog.createdAt || 0).getTime();
    const timeDiffSec = (Date.now() - latestTime) / 1000;

    if (latestAction === targetAction && (targetAction === 'LOGGED_IN' || timeDiffSec < 60)) {
      return latestLog;
    }
  }

  const actDoc = {
    id: `act_${Date.now()}_${Math.floor(Math.random() * 9000 + 1000)}`,
    userId: targetId || 'usr_unknown',
    userEmail: targetEmail || 'user@primeshow.com',
    userName: String(userName || 'Customer'),
    action: targetAction,
    details: String(details),
    timestamp: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };
  await DataStore.insertOne('user_activities', actDoc);
  io.emit('USER_ACTIVITY_LOGGED', actDoc);
  return actDoc;
}

// REST Health Check Route
app.get(['/', '/api', '/api/health'], (req, res) => {
  res.json({
    status: 'ok',
    service: 'PrimeShow Node.js REST API Backend',
    timestamp: new Date().toISOString(),
    database: db ? 'MongoDB (Connected)' : 'File Engine (Fallback)'
  });
});

// SSE Event Stream Endpoint (/api/events/stream)
app.get('/api/events/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.flushHeaders();

  const keepAliveTimer = setInterval(() => {
    res.write(`: ping\n\n`);
  }, 15000);

  req.on('close', () => {
    clearInterval(keepAliveTimer);
  });
});

// --------------------------------------------------------------------------
// AUTHENTICATION & USER ENDPOINTS
// --------------------------------------------------------------------------

// User Registration Endpoint
app.post('/api/auth/register', async (req, res) => {
  const email = (req.body.email || '').trim();
  const name = (req.body.name || '').trim() || (email.split('@')[0] || 'New User');
  const phone = (req.body.phone || req.body.phoneNumber || '+91 9876543210').trim();
  const authProvider = (req.body.authProvider || req.body.provider || 'LOCAL').toUpperCase();
  const role = email.toLowerCase() === 'admin@primeshow.com' ? 'ADMIN' : 'CUSTOMER';

  let user = await DataStore.findOne('users', { email });
  if (user) {
    await DataStore.updateOne('users', { id: user.id }, {
      status: 'Online',
      isOnline: true,
      lastLoginAt: new Date().toISOString()
    });
    user.status = 'Online';
    user.isOnline = true;
    user.lastLoginAt = new Date().toISOString();
  } else {
    user = {
      id: `usr_${Date.now()}_${Math.floor(Math.random() * 9000 + 1000)}`,
      name,
      email,
      phone,
      phoneNumber: phone,
      authProvider,
      provider: authProvider,
      role,
      status: 'Online',
      isOnline: true,
      city: 'Surat',
      rewardsPoints: 500,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };
    await DataStore.insertOne('users', user);
  }

  await logUserActivity(user.id, user.email, user.name, 'LOGGED_IN', `New User Registration & Login (${authProvider})`);
  res.json({ success: true, user, token: `jwt_local_token_${Date.now()}` });
});

// Login & Admin Login Endpoints
app.post(['/api/auth/login', '/api/auth/admin-login'], async (req, res) => {
  const emailOrPhone = (req.body.email || req.body.phone || req.body.username || '').trim();
  const isEmail = emailOrPhone.includes('@');
  const email = isEmail ? emailOrPhone : (req.body.email || `${emailOrPhone}@primeshow.com`);
  const phone = !isEmail ? emailOrPhone : (req.body.phone || '+91 9876543210');
  const name = (req.body.name || email.split('@')[0] || 'PrimeShow Member').trim();
  const isAdmin = email.toLowerCase() === 'admin@primeshow.com' || emailOrPhone.toLowerCase() === 'admin';
  const role = isAdmin ? 'ADMIN' : 'CUSTOMER';

  let user = null;
  if (email) user = await DataStore.findOne('users', { email });
  if (!user && phone) user = await DataStore.findOne('users', { phone });
  if (!user && isAdmin) user = await DataStore.findOne('users', { role: 'ADMIN' });

  if (user) {
    await DataStore.updateOne('users', { id: user.id }, {
      status: 'Online',
      isOnline: true,
      lastLoginAt: new Date().toISOString()
    });
    user.status = 'Online';
    user.isOnline = true;
    user.lastLoginAt = new Date().toISOString();
  } else {
    user = {
      id: isAdmin ? 'admin_1' : `usr_${Date.now()}_${Math.floor(Math.random() * 9000 + 1000)}`,
      name,
      email,
      phone,
      phoneNumber: phone,
      authProvider: 'LOCAL',
      provider: 'LOCAL',
      role,
      status: 'Online',
      isOnline: true,
      city: 'Surat',
      rewardsPoints: isAdmin ? 99999 : 500,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };
    await DataStore.insertOne('users', user);
  }

  await logUserActivity(user.id, user.email, user.name, 'LOGGED_IN', `User logged in successfully (${isEmail ? 'Email' : 'Phone'})`);
  res.json({ success: true, user, token: `jwt_local_token_${Date.now()}` });
});

// User Logout Endpoint
app.post('/api/auth/logout', async (req, res) => {
  const targetId = (req.body.userId || req.body.id || '').trim();
  const targetEmail = (req.body.email || '').trim();

  let user = null;
  if (targetId) user = await DataStore.findOne('users', { id: targetId });
  if (!user && targetEmail) user = await DataStore.findOne('users', { email: targetEmail });

  let finalId = targetId;
  let finalEmail = targetEmail;
  let finalName = 'Customer';

  if (user) {
    await DataStore.updateOne('users', { id: user.id }, { status: 'Offline', isOnline: false });
    finalId = user.id;
    finalEmail = user.email;
    finalName = user.name;
  }

  await logUserActivity(finalId || 'usr_unknown', finalEmail || 'user@primeshow.com', finalName, 'LOGGED_OUT', 'User logged out');
  res.json({ success: true, message: 'Logged out successfully recorded in MongoDB' });
});

// Social Sync & OTP Endpoints
app.post(['/api/user-sync', '/api/auth/google-sync', '/api/auth/send-otp', '/api/auth/verify-otp'], async (req, res) => {
  if (req.path === '/api/auth/send-otp') {
    return res.json({ success: true, message: 'OTP dispatched', debugOtp: '1234' });
  }

  const email = (req.body.email || '').trim();
  const userId = (req.body.id || req.body.userId || req.body.firebaseUid || '').trim();
  const name = (req.body.name || email.split('@')[0] || 'User').trim();
  const phone = (req.body.phone || req.body.phoneNumber || '+91 9876543210').trim();
  const provider = (req.body.authProvider || req.body.provider || 'LOCAL').toUpperCase();

  let existing = null;
  if (userId) existing = await DataStore.findOne('users', { id: userId });
  if (!existing && email) existing = await DataStore.findOne('users', { email });

  let user = null;
  if (existing) {
    await DataStore.updateOne('users', { id: existing.id }, {
      name: name || existing.name,
      status: 'Online',
      isOnline: true,
      lastLoginAt: new Date().toISOString()
    });
    user = { ...existing, status: 'Online', isOnline: true, lastLoginAt: new Date().toISOString() };
  } else {
    user = {
      id: userId || `usr_${Date.now()}_${Math.floor(Math.random() * 9000 + 1000)}`,
      name,
      email: email || `user_${Date.now()}@primeshow.com`,
      phone,
      phoneNumber: phone,
      authProvider: provider,
      provider,
      role: email.toLowerCase() === 'admin@primeshow.com' ? 'ADMIN' : 'CUSTOMER',
      status: 'Online',
      isOnline: true,
      city: 'Surat',
      rewardsPoints: 500,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };
    await DataStore.insertOne('users', user);
  }

  await logUserActivity(user.id, user.email, user.name, 'LOGGED_IN', `User authenticated (${provider})`);
  res.json({ success: true, user, token: `jwt_sync_token_${Date.now()}` });
});

// Update Profile
app.put(['/api/users/profile', '/api/user/profile'], async (req, res) => {
  const targetId = (req.body.id || req.body._id || req.body.userId || '').trim();
  const targetEmail = (req.body.email || '').trim();

  let user = null;
  if (targetId) user = await DataStore.findOne('users', { id: targetId });
  if (!user && targetEmail) user = await DataStore.findOne('users', { email: targetEmail });

  if (user) {
    await DataStore.updateOne('users', { id: user.id }, req.body);
    const updated = { ...user, ...req.body };
    return res.json({ success: true, user: updated });
  }
  res.json({ success: true, user: req.body });
});

// Wishlist Toggle
app.post('/api/user/wishlist/toggle', async (req, res) => {
  const { userId, movieId } = req.body;
  let user = await DataStore.findOne('users', { id: userId });
  if (user) {
    const wishlist = Array.isArray(user.wishlist) ? [...user.wishlist] : [];
    const idx = wishlist.indexOf(movieId);
    if (idx > -1) {
      wishlist.splice(idx, 1);
    } else {
      wishlist.push(movieId);
    }
    await DataStore.updateOne('users', { id: userId }, { wishlist });
    return res.json({ success: true, wishlist });
  }
  res.json({ success: true, wishlist: [movieId] });
});

// User Activity Log Endpoint
app.post('/api/user-activities', async (req, res) => {
  const { userId, userEmail, userName, action, details } = req.body;
  const doc = await logUserActivity(userId, userEmail, userName, action || 'CLICK', details || 'User action');
  res.status(201).json({ success: true, activity: doc });
});

// --------------------------------------------------------------------------
// ADMIN MANAGEMENT & ANALYTICS ENDPOINTS
// --------------------------------------------------------------------------

// Users List
app.get(['/api/admin/users', '/api/users', '/api/admin/users/list', '/api/users/list'], async (req, res) => {
  let users = await DataStore.find('users');
  const search = (req.query.search || '').toLowerCase().trim();
  if (search) {
    users = users.filter(u => {
      const n = (u.name || '').toLowerCase();
      const e = (u.email || '').toLowerCase();
      const p = (u.phone || u.phoneNumber || '').toLowerCase();
      return n.includes(search) || e.includes(search) || p.includes(search);
    });
  }

  res.json({
    success: true,
    users,
    totalUsers: users.length,
    totalPages: 1,
    currentPage: 1
  });
});

// Update User (Admin)
app.put(['/api/admin/users/:id', '/api/users/:id'], async (req, res) => {
  const targetId = req.params.id;
  await DataStore.updateOne('users', { id: targetId }, req.body);
  const updated = await DataStore.findOne('users', { id: targetId });
  res.json({ success: true, user: updated || { id: targetId, ...req.body } });
});

// Delete User (Admin)
app.delete(['/api/admin/users/:id', '/api/users/:id'], async (req, res) => {
  const targetId = decodeURIComponent(req.params.id);
  await DataStore.deleteOne('users', { id: targetId });
  await DataStore.deleteOne('users', { email: targetId });
  res.json({ success: true, message: 'User deleted from MongoDB' });
});

// User Activity & History (Admin)
app.get([
  '/api/admin/users/:userId/activity',
  '/api/admin/users/:userId/history',
  '/api/users/:userId/activity',
  '/api/users/:userId/history'
], async (req, res) => {
  const rawTargetId = decodeURIComponent(req.params.userId);

  let userDoc = await DataStore.findOne('users', { id: rawTargetId });
  if (!userDoc) userDoc = await DataStore.findOne('users', { email: rawTargetId });
  if (!userDoc) userDoc = { id: rawTargetId, name: 'User', email: rawTargetId };

  const targetId = String(userDoc.id || rawTargetId);
  const targetEmail = String(userDoc.email || rawTargetId).toLowerCase();

  const allBookings = await DataStore.find('bookings');
  const userBookings = allBookings.filter(b => {
    const bUid = String(b.userId || '');
    const bMail = String(b.userEmail || '').toLowerCase();
    return (targetId && bUid === targetId) || (targetEmail && bMail === targetEmail);
  });

  const allLogs = await DataStore.find('user_activities');
  const userLogs = allLogs.filter(l => {
    const lUid = String(l.userId || '');
    const lMail = String(l.userEmail || '').toLowerCase();
    return (targetId && lUid === targetId) || (targetEmail && lMail === targetEmail);
  });

  userLogs.sort((a, b) => new Date(b.timestamp || b.createdAt || 0) - new Date(a.timestamp || a.createdAt || 0));

  res.json({
    success: true,
    user: userDoc,
    bookings: userBookings,
    logs: userLogs,
    history: userLogs
  });
});

// All User Activities Stream Endpoint (Admin)
app.get('/api/admin/user-activities', async (req, res) => {
  let activities = await DataStore.find('user_activities');
  const search = (req.query.search || '').toLowerCase().trim();
  const eventType = (req.query.eventType || 'ALL').toUpperCase().trim();

  if (eventType !== 'ALL') {
    activities = activities.filter(a => (a.action || '').toUpperCase().includes(eventType));
  }

  if (search) {
    activities = activities.filter(a => {
      const u = (a.userName || '').toLowerCase();
      const e = (a.userEmail || '').toLowerCase();
      const d = (a.details || '').toLowerCase();
      return u.includes(search) || e.includes(search) || d.includes(search);
    });
  }

  activities.sort((a, b) => new Date(b.timestamp || b.createdAt || 0) - new Date(a.timestamp || a.createdAt || 0));

  res.json({
    success: true,
    activities,
    totalCount: activities.length,
    totalPages: 1,
    currentPage: 1
  });
});

// Admin Overview Metrics
app.get('/api/admin/overview', async (req, res) => {
  const bookings = await DataStore.find('bookings');
  const users = await DataStore.find('users');
  const movies = await DataStore.find('movies');
  const totalRev = bookings.reduce((sum, b) => sum + Number(b.totalAmount || 0), 0);

  res.json({
    totalBookings: bookings.length,
    totalRevenue: totalRev || 45600,
    totalUsers: users.length || 89,
    activeMovies: movies.length || 12
  });
});

// Admin Financial Stats
app.get('/api/admin/financial-stats', async (req, res) => {
  const bookings = await DataStore.find('bookings');
  
  let totalRevenue = 0;
  let totalTickets = 0;
  let totalConfirmedBookings = 0;
  let todayRevenue = 0;
  let todayBookings = 0;

  const todayStr = new Date().toISOString().split('T')[0];

  const categoryBreakdown = { Movie: 0, Event: 0, Play: 0, Activity: 0, PrivateTheatre: 0 };
  const categoryRevenue = { Movie: 0, Event: 0, Play: 0, Activity: 0, PrivateTheatre: 0 };

  bookings.forEach(b => {
    const status = (b.status || 'CONFIRMED').toUpperCase();
    if (status !== 'CANCELLED') {
      const amt = Number(b.totalAmount || b.price || 0);
      const tickets = Number(b.seatsBookedCount || b.ticketCount || (Array.isArray(b.seats) ? b.seats.length : 1));
      
      totalRevenue += amt;
      totalTickets += tickets;
      totalConfirmedBookings += 1;

      const createdDate = (b.createdAt || b.bookingDate || '').split('T')[0] || (b.showDate || '');
      if (createdDate === todayStr) {
        todayRevenue += amt;
        todayBookings += 1;
      }

      const cat = b.category || b.bookingType || 'Movie';
      const key = (cat.toLowerCase().includes('event')) ? 'Event' :
                  (cat.toLowerCase().includes('play')) ? 'Play' :
                  (cat.toLowerCase().includes('act')) ? 'Activity' :
                  (cat.toLowerCase().includes('theatre') || cat.toLowerCase().includes('private')) ? 'PrivateTheatre' : 'Movie';

      categoryBreakdown[key] = (categoryBreakdown[key] || 0) + 1;
      categoryRevenue[key] = (categoryRevenue[key] || 0) + amt;
    }
  });

  res.json({
    success: true,
    financials: {
      totalRevenue,
      totalTickets,
      totalConfirmedBookings,
      todayRevenue,
      todayBookings,
      categoryBreakdown,
      categoryRevenue,
      rolling7Days: []
    }
  });
});

// Admin Analytics Charts
app.get('/api/admin/analytics/charts', async (req, res) => {
  const range = req.query.range || '7days';
  const daysCount = range === '30days' ? 30 : (range === '90days' ? 90 : 7);
  const bookings = await DataStore.find('bookings');

  const dataPoints = [];
  const now = new Date();

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const labelStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    let dayRevenue = 0;
    let dayBookingsCount = 0;

    bookings.forEach(b => {
      const createdDate = (b.createdAt || b.bookingDate || b.showDate || '').split('T')[0];
      if (createdDate === dateStr && (b.status || 'CONFIRMED').toUpperCase() !== 'CANCELLED') {
        dayRevenue += Number(b.totalAmount || b.price || 0);
        dayBookingsCount += 1;
      }
    });

    dataPoints.push({
      date: dateStr,
      label: labelStr,
      revenue: dayRevenue,
      bookings: dayBookingsCount,
      count: dayBookingsCount
    });
  }

  res.json({
    success: true,
    range,
    dataPoints
  });
});

// Admin Analytics Top Movies
app.get(['/api/admin/analytics/top-booking-overview', '/api/admin/analytics/top-movies'], async (req, res) => {
  const bookings = await DataStore.find('bookings');
  const movies = await DataStore.find('movies');

  const movieStatsMap = {};

  bookings.forEach(b => {
    const mId = b.movieId || b.title || 'mov_1';
    const mTitle = b.movieTitle || b.title || 'Movie';
    if (!movieStatsMap[mId]) {
      movieStatsMap[mId] = {
        id: mId,
        title: mTitle,
        movieTitle: mTitle,
        poster: b.poster || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
        totalBookings: 0,
        totalRevenue: 0,
        totalTickets: 0
      };
    }
    movieStatsMap[mId].totalBookings += 1;
    movieStatsMap[mId].totalRevenue += Number(b.totalAmount || 0);
    movieStatsMap[mId].totalTickets += Number(b.seatsBookedCount || b.ticketCount || 1);
  });

  movies.forEach(m => {
    const mId = m.id || m._id;
    if (!movieStatsMap[mId]) {
      movieStatsMap[mId] = {
        id: mId,
        title: m.title || 'Movie',
        movieTitle: m.title || 'Movie',
        poster: m.poster || m.banner || '',
        totalBookings: 0,
        totalRevenue: 0,
        totalTickets: 0
      };
    }
  });

  const topMovies = Object.values(movieStatsMap).sort((a, b) => b.totalRevenue - a.totalRevenue);

  res.json({
    success: true,
    movies: topMovies,
    topMovies: topMovies
  });
});

// Admin Analytics Top Theatres
app.get(['/api/admin/analytics/top-theatres', '/api/admin/analytics/top-theatres-overview'], async (req, res) => {
  const bookings = await DataStore.find('bookings');
  const theatres = await DataStore.find('theatres');

  const theatreStatsMap = {};

  bookings.forEach(b => {
    const thId = b.theatreId || b.venue || 'th_1';
    const thName = b.theatreName || b.venue || 'Multiplex Cinema';
    const city = b.city || 'Surat';

    if (!theatreStatsMap[thId]) {
      theatreStatsMap[thId] = {
        id: thId,
        name: thName,
        theatreName: thName,
        city: city,
        totalBookings: 0,
        totalRevenue: 0,
        totalTickets: 0
      };
    }
    theatreStatsMap[thId].totalBookings += 1;
    theatreStatsMap[thId].totalRevenue += Number(b.totalAmount || 0);
    theatreStatsMap[thId].totalTickets += Number(b.seatsBookedCount || b.ticketCount || 1);
  });

  theatres.forEach(t => {
    const thId = t.id || t._id;
    if (!theatreStatsMap[thId]) {
      theatreStatsMap[thId] = {
        id: thId,
        name: t.name || 'Multiplex Cinema',
        theatreName: t.name || 'Multiplex Cinema',
        city: t.city || 'Surat',
        totalBookings: 0,
        totalRevenue: 0,
        totalTickets: 0
      };
    }
  });

  const topTheatres = Object.values(theatreStatsMap).sort((a, b) => b.totalRevenue - a.totalRevenue);

  res.json({
    success: true,
    theatres: topTheatres,
    topTheatres: topTheatres,
    allTheatres: topTheatres
  });
});

// Global Config & Broadcast Settings
app.post('/api/admin/global-update', async (req, res) => {
  const payload = req.body;
  await DataStore.insertOne('global_config', { id: 'main_config', ...payload, updatedAt: new Date().toISOString() });
  io.emit('GLOBAL_ADMIN_UPDATE', payload);
  res.json({ success: true, message: 'Global config updated', config: payload });
});

app.get('/api/admin/global-config', async (req, res) => {
  const cfg = await DataStore.findOne('global_config', { id: 'main_config' }) || {
    platformName: 'PrimeShow Cinema & Events',
    activeCity: 'Surat',
    bannerAnnouncement: '⚡ Exclusive Offer: Get 50% Flat Discount on IMAX & VIP Recliner Tickets!',
    maintenanceMode: false
  };
  res.json({ success: true, config: cfg });
});

// Offers Banners
app.get(['/api/offers/banners', '/api/admin/offers/banners'], async (req, res) => {
  const banners = await DataStore.find('offer_banners');
  res.json(banners);
});

app.post(['/api/offers/banners', '/api/admin/offers/banners'], async (req, res) => {
  const doc = { id: req.body.id || `ban_${Date.now()}`, ...req.body };
  await DataStore.insertOne('offer_banners', doc);
  io.emit('OFFER_BANNERS_UPDATED', doc);
  io.emit('OFFER_BANNER_UPDATED', doc);
  io.emit('GLOBAL_ADMIN_UPDATE', { type: 'OFFER_BANNERS', doc });
  res.status(201).json({ success: true, ...doc, banner: doc });
});

app.put(['/api/offers/banners/:id', '/api/admin/offers/banners/:id'], async (req, res) => {
  const targetId = req.params.id;
  await DataStore.updateOne('offer_banners', { id: targetId }, req.body);
  const updated = await DataStore.findOne('offer_banners', { id: targetId });
  const finalDoc = updated || { id: targetId, ...req.body };
  io.emit('OFFER_BANNERS_UPDATED', finalDoc);
  io.emit('OFFER_BANNER_UPDATED', finalDoc);
  io.emit('GLOBAL_ADMIN_UPDATE', { type: 'OFFER_BANNERS', doc: finalDoc });
  res.json({ success: true, ...finalDoc, banner: finalDoc });
});

app.delete(['/api/offers/banners/:id', '/api/admin/offers/banners/:id'], async (req, res) => {
  const targetId = req.params.id;
  await DataStore.deleteOne('offer_banners', { id: targetId });
  io.emit('OFFER_BANNERS_UPDATED', { deletedId: targetId });
  io.emit('OFFER_BANNER_UPDATED', { deletedId: targetId });
  io.emit('OFFER_BANNER_DELETED', { id: targetId, deletedId: targetId });
  io.emit('GLOBAL_ADMIN_UPDATE', { type: 'OFFER_BANNERS_DELETED', deletedId: targetId });
  res.json({ success: true, message: 'Banner deleted' });
});

// --------------------------------------------------------------------------
// MOVIES & SHOWTIMES ENDPOINTS
// --------------------------------------------------------------------------

// Movies CRUD
app.get(['/api/movies', '/api/admin/movies'], async (req, res) => {
  const data = await DataStore.find('movies');
  res.json(data);
});

app.post(['/api/movies', '/api/admin/movies'], async (req, res) => {
  const doc = { id: req.body.id || `mov_${Date.now()}`, ...req.body };
  await DataStore.insertOne('movies', doc);
  io.emit('MOVIES_UPDATED', doc);
  io.emit('MOVIE_UPDATED', doc);
  io.emit('GLOBAL_ADMIN_UPDATE', { type: 'MOVIES', doc });
  res.status(201).json({ success: true, movie: doc });
});

app.put(['/api/movies/:id', '/api/admin/movies/:id'], async (req, res) => {
  const mId = decodeURIComponent(req.params.id);
  await DataStore.updateOne('movies', { id: mId }, req.body);
  const updated = await DataStore.findOne('movies', { id: mId });
  const finalDoc = updated || { id: mId, ...req.body };
  io.emit('MOVIES_UPDATED', finalDoc);
  io.emit('MOVIE_UPDATED', finalDoc);
  io.emit('GLOBAL_ADMIN_UPDATE', { type: 'MOVIES', doc: finalDoc });
  res.json({ success: true, movie: finalDoc });
});

app.delete(['/api/movies/:id', '/api/admin/movies/:id'], async (req, res) => {
  const mId = decodeURIComponent(req.params.id);
  await DataStore.deleteOne('movies', { id: mId });
  io.emit('MOVIES_UPDATED', { deletedId: mId });
  io.emit('MOVIE_UPDATED', { deletedId: mId });
  io.emit('MOVIE_DELETED', { id: mId, deletedId: mId });
  io.emit('MOVIES_DELETED', { id: mId, deletedId: mId });
  io.emit('GLOBAL_ADMIN_UPDATE', { type: 'MOVIES_DELETED', deletedId: mId });
  res.json({ success: true, message: 'Movie deleted permanently from MongoDB' });
});

// Movie Cast Management
app.post(['/api/admin/movies/cast', '/api/movies/cast'], async (req, res) => {
  const { movieId, targetMovieId, selectedMovieId, name, actorName, role, roleName, character, photo, photoUrl } = req.body;
  const mId = String(movieId || targetMovieId || selectedMovieId || '').trim();
  const cName = String(name || actorName || '').trim();
  const cRole = String(role || roleName || character || 'Cast').trim();
  const cPhoto = photo || photoUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80';

  if (!mId || !cName) {
    return res.status(400).json({ success: false, message: 'Movie ID and cast name are required' });
  }

  let movie = await DataStore.findOne('movies', { id: mId });
  if (!movie) {
    const allMovies = await DataStore.find('movies');
    movie = allMovies.find(m => m.id === mId || m._id === mId || String(m.title).toLowerCase() === mId.toLowerCase());
  }

  if (movie) {
    const castList = Array.isArray(movie.cast) ? [...movie.cast] : [];
    const existingIndex = castList.findIndex(c => 
      (c.name && c.name.toLowerCase() === cName.toLowerCase()) || 
      (c.actorName && c.actorName.toLowerCase() === cName.toLowerCase())
    );

    const newCastMember = {
      id: existingIndex !== -1 ? castList[existingIndex].id : `c_${Date.now()}`,
      name: cName,
      actorName: cName,
      role: cRole,
      roleName: cRole,
      character: cRole,
      photo: cPhoto,
      photoUrl: cPhoto
    };

    if (existingIndex !== -1) {
      castList[existingIndex] = { ...castList[existingIndex], ...newCastMember };
    } else {
      castList.push(newCastMember);
    }

    await DataStore.updateOne('movies', { id: movie.id }, { cast: castList });
    const updatedMovie = { ...movie, cast: castList };

    io.emit('MOVIE_UPDATED', updatedMovie);
    io.emit('MOVIES_UPDATED', updatedMovie);
    io.emit('GLOBAL_ADMIN_UPDATE', { type: 'MOVIES', doc: updatedMovie });

    return res.json({ success: true, movie: updatedMovie });
  }

  res.status(404).json({ success: false, message: 'Target movie not found' });
});

app.delete(['/api/movies/:movieId/cast/:castId', '/api/admin/movies/:movieId/cast/:castId'], async (req, res) => {
  const { movieId, castId } = req.params;
  const decodedMovieId = decodeURIComponent(movieId);
  const decodedCastId = decodeURIComponent(castId);

  let movie = await DataStore.findOne('movies', { id: decodedMovieId });
  if (!movie) {
    const allMovies = await DataStore.find('movies');
    movie = allMovies.find(m => m.id === decodedMovieId || m._id === decodedMovieId || String(m.title).toLowerCase() === decodedMovieId.toLowerCase());
  }

  if (movie && Array.isArray(movie.cast)) {
    const updatedCast = movie.cast.filter(c => 
      c.id !== decodedCastId && 
      c._id !== decodedCastId && 
      c.name !== decodedCastId && 
      c.actorName !== decodedCastId
    );
    await DataStore.updateOne('movies', { id: movie.id }, { cast: updatedCast });
    const updatedMovie = { ...movie, cast: updatedCast };

    io.emit('MOVIE_UPDATED', updatedMovie);
    io.emit('MOVIES_UPDATED', updatedMovie);
    io.emit('GLOBAL_ADMIN_UPDATE', { type: 'MOVIES', doc: updatedMovie });

    return res.json({ success: true, movie: updatedMovie });
  }

  res.json({ success: true, message: 'Cast removed' });
});

// Movie Scheduling & Dates
app.get('/api/showtimes/dates', async (req, res) => {
  const movies = await DataStore.find('movies');
  const datesSet = new Set();
  movies.forEach(m => {
    if (Array.isArray(m.showDates)) {
      m.showDates.forEach(d => datesSet.add(d));
    }
  });
  if (datesSet.size === 0) {
    datesSet.add(new Date().toISOString().split('T')[0]);
  }
  res.json({
    success: true,
    dates: Array.from(datesSet)
  });
});

app.post('/api/admin/movies/add-date', async (req, res) => {
  const { movieId, targetMovieId, selectedMovieId, dateStr, date } = req.body;
  const mId = String(movieId || targetMovieId || selectedMovieId || '').trim();
  const dStr = String(dateStr || date || '').trim();

  if (!dStr) {
    return res.status(400).json({ success: false, message: 'Invalid or missing date' });
  }

  let movie = await DataStore.findOne('movies', { id: mId });
  if (!movie) {
    const allMovs = await DataStore.find('movies');
    movie = allMovs.find(m => String(m.id || m._id) === mId || (m.title && m.title.toLowerCase().includes(mId.toLowerCase()))) || allMovs[0];
  }

  if (movie) {
    const dates = Array.isArray(movie.showDates) ? [...movie.showDates] : [];
    if (!dates.includes(dStr)) {
      dates.push(dStr);
      dates.sort();
    }
    await DataStore.updateOne('movies', { id: movie.id }, { showDates: dates });
    const updatedMovie = { ...movie, showDates: dates };
    io.emit('MOVIES_UPDATED', updatedMovie);
    return res.json({ success: true, message: `Date ${dStr} added to MongoDB`, movie: updatedMovie });
  }

  res.status(404).json({ success: false, message: 'Target movie not found in MongoDB' });
});

app.post('/api/admin/movies/schedule', async (req, res) => {
  const { action, movieId, targetMovieId, selectedMovieId, dateStr, date, theatreObj, showSlotObj } = req.body;
  const mId = String(movieId || targetMovieId || selectedMovieId || '').trim();
  const dStr = String(dateStr || date || '').trim();

  let movie = await DataStore.findOne('movies', { id: mId });
  if (!movie) {
    const allMovs = await DataStore.find('movies');
    movie = allMovs.find(m => String(m.id || m._id).toLowerCase() === mId.toLowerCase() || (m.title && m.title.toLowerCase().includes(mId.toLowerCase()))) || allMovs[0];
  }

  if (movie) {
    const schedules = { ...(movie.schedules || {}) };
    if (action === 'ADD_SHOW_SLOT' && theatreObj && showSlotObj && dStr) {
      const thList = schedules[dStr] ? JSON.parse(JSON.stringify(schedules[dStr])) : [];
      const thIdx = thList.findIndex(t => String(t.id || t._id).toLowerCase() === String(theatreObj.id || theatreObj._id).toLowerCase() || (t.name && theatreObj.name && t.name.trim().toLowerCase() === theatreObj.name.trim().toLowerCase()));
      if (thIdx > -1) {
        const shows = thList[thIdx].shows || [];
        const isDuplicate = shows.some(s => (s.time === showSlotObj.time || s.showTime === showSlotObj.showTime) && s.format === showSlotObj.format);
        if (!isDuplicate) {
          shows.push(showSlotObj);
          thList[thIdx].shows = shows;
        }
      } else {
        thList.push({ ...theatreObj, shows: [showSlotObj] });
      }
      schedules[dStr] = thList;
      const showDates = Array.isArray(movie.showDates) ? [...movie.showDates] : [];
      if (!showDates.includes(dStr)) {
        showDates.push(dStr);
        showDates.sort();
      }
      await DataStore.updateOne('movies', { id: movie.id }, { schedules, showDates });
      const updatedMovie = { ...movie, schedules, showDates };
      io.emit('MOVIES_UPDATED', updatedMovie);
      return res.json({ success: true, message: 'Show slot saved in MongoDB', movie: updatedMovie });
    } else if (action === 'DELETE_DATE' && dStr) {
      delete schedules[dStr];
      const showDates = (movie.showDates || []).filter(d => d !== dStr);
      await DataStore.updateOne('movies', { id: movie.id }, { schedules, showDates });
      const updatedMovie = { ...movie, schedules, showDates };
      io.emit('MOVIES_UPDATED', updatedMovie);
      return res.json({ success: true, message: `Date ${dStr} deleted from MongoDB`, movie: updatedMovie });
    }
  }
  res.status(404).json({ success: false, message: 'Target movie not found in MongoDB' });
});

// Movie Schedules Endpoint
app.get(['/api/movies/:id/schedules', '/api/admin/movies/:id/schedules'], async (req, res) => {
  const mId = req.params.id;
  const { city, date } = req.query;

  let movie = await DataStore.findOne('movies', { id: mId });
  if (!movie) {
    const allMovs = await DataStore.find('movies');
    movie = allMovs.find(m => String(m.id || m._id).toLowerCase() === String(mId).toLowerCase() || (m.title && m.title.toLowerCase().includes(String(mId).toLowerCase()))) || allMovs[0];
  }

  if (!movie) {
    return res.json({ success: true, schedules: [] });
  }

  const allTheatres = await DataStore.find('theatres');
  const targetDate = date || (Array.isArray(movie.showDates) && movie.showDates.length > 0 ? movie.showDates[0] : new Date().toISOString().split('T')[0]);

  const schedulesMap = new Map();

  if (movie.schedules && movie.schedules[targetDate] && Array.isArray(movie.schedules[targetDate])) {
    movie.schedules[targetDate].forEach(th => {
      if (th && th.name) {
        const matchedDbTh = allTheatres.find(t => String(t.id || t._id).toLowerCase() === String(th.id || th._id).toLowerCase() || (t.name && t.name.toLowerCase() === th.name.toLowerCase()));
        const rawFac = matchedDbTh?.facilities || th.facilities;
        const cleanFac = Array.isArray(rawFac) ? rawFac : (typeof rawFac === 'string' ? rawFac.split(',').map(s => s.trim()).filter(Boolean) : ['IMAX 3D', 'VIP Recliners']);
        const cleanTh = {
          id: matchedDbTh?.id || th.id || `th_${Date.now()}`,
          name: th.name,
          city: matchedDbTh?.city || th.city || 'Surat',
          address: matchedDbTh?.address || th.address || `${th.city || 'Surat'} Multiplex`,
          facilities: cleanFac,
          shows: Array.isArray(th.shows) ? th.shows.map(s => ({
            id: s.id || `sh_${Date.now()}`,
            time: s.time || s.showTime || '07:30 PM',
            showTime: s.time || s.showTime || '07:30 PM',
            format: s.format || 'IMAX 3D',
            price: Number(s.price) || 450,
            screen: s.screen || 'Screen 1',
            screenId: `${matchedDbTh?.id || th.id || 'th_1'}_${movie.id || 'mov_1'}_${targetDate}_${s.time || s.showTime || '07:30 PM'}`
          })) : []
        };
        schedulesMap.set(cleanTh.name.toLowerCase(), cleanTh);
      }
    });
  }

  allTheatres.forEach(t => {
    const hbd = t.hallSlotsByDate || t.dateHalls;
    if (hbd && hbd[targetDate] && Array.isArray(hbd[targetDate])) {
      const matchingHalls = hbd[targetDate].filter(h => !h.movieId || String(h.movieId).toLowerCase() === String(movie.id).toLowerCase() || (h.movieTitle && movie.title && h.movieTitle.toLowerCase() === movie.title.toLowerCase()));
      if (matchingHalls.length > 0) {
        const rawFac = t.facilities;
        const cleanFac = Array.isArray(rawFac) ? rawFac : (typeof rawFac === 'string' ? rawFac.split(',').map(s => s.trim()).filter(Boolean) : ['IMAX 3D', 'VIP Recliners']);
        const existingTh = schedulesMap.get(t.name.toLowerCase()) || {
          id: t.id,
          name: t.name,
          city: t.city || 'Surat',
          address: t.address || `${t.city || 'Surat'} Multiplex`,
          facilities: cleanFac,
          shows: []
        };

        matchingHalls.forEach(h => {
          const showTimeStr = h.time || h.showTime || '10:30 AM';
          if (!existingTh.shows.some(s => s.time === showTimeStr && s.format === h.format)) {
            existingTh.shows.push({
              id: h.id || `sh_${Date.now()}`,
              time: showTimeStr,
              showTime: showTimeStr,
              format: h.format || 'IMAX 3D',
              price: Number(h.price) || 450,
              screen: h.hallName || 'Screen 1',
              screenId: `${t.id}_${movie.id}_${targetDate}_${showTimeStr}`
            });
          }
        });
        schedulesMap.set(t.name.toLowerCase(), existingTh);
      }
    }
  });

  let schedulesList = Array.from(schedulesMap.values());

  if (city && city !== 'All') {
    const cityFiltered = schedulesList.filter(t => t.city && t.city.trim().toLowerCase() === city.trim().toLowerCase());
    if (cityFiltered.length > 0) schedulesList = cityFiltered;
  }

  // Fallback to City Theatres or Gujarat Theatres if no explicit date schedule configured
  if (schedulesList.length === 0 && allTheatres.length > 0) {
    const targetCityTheatres = (city && city !== 'All') 
      ? allTheatres.filter(t => t.city && t.city.trim().toLowerCase() === city.trim().toLowerCase())
      : (movie.city ? allTheatres.filter(t => t.city && t.city.trim().toLowerCase() === movie.city.trim().toLowerCase()) : allTheatres);
    
    const thsToUse = targetCityTheatres.length > 0 ? targetCityTheatres : allTheatres.slice(0, 4);
    thsToUse.forEach(t => {
      const rawFac = t.facilities;
      const cleanFac = Array.isArray(rawFac) ? rawFac : (typeof rawFac === 'string' ? rawFac.split(',').map(s => s.trim()).filter(Boolean) : ['IMAX 3D', 'VIP Recliners']);
      schedulesList.push({
        id: t.id,
        name: t.name,
        city: t.city || 'Surat',
        address: t.address || `${t.city || 'Surat'} Multiplex`,
        facilities: cleanFac,
        shows: [
          { id: `${t.id}_sh_1`, time: '10:30 AM', showTime: '10:30 AM', format: 'Dolby Atmos', price: 250, screen: 'Audi 1', screenId: `${t.id}_${movie.id}_${targetDate}_10:30 AM` },
          { id: `${t.id}_sh_2`, time: '02:00 PM', showTime: '02:00 PM', format: 'Dolby Atmos', price: 300, screen: 'Audi 1', screenId: `${t.id}_${movie.id}_${targetDate}_02:00 PM` },
          { id: `${t.id}_sh_3`, time: '06:30 PM', showTime: '06:30 PM', format: 'VIP Recliner', price: 450, screen: 'Audi 2', screenId: `${t.id}_${movie.id}_${targetDate}_06:30 PM` },
          { id: `${t.id}_sh_4`, time: '09:45 PM', showTime: '09:45 PM', format: 'VIP Recliner', price: 500, screen: 'Audi 2', screenId: `${t.id}_${movie.id}_${targetDate}_09:45 PM` }
        ]
      });
    });
  }

  res.json({
    success: true,
    movieId: movie.id,
    date: targetDate,
    city: city || 'All',
    schedules: schedulesList
  });
});

// Specific Showtimes by Theatre & Movie
app.get(['/api/theatres/:thId/movies/:movId/showtimes', '/api/theaters/:thId/movies/:movId/showtimes'], async (req, res) => {
  const { thId, movId } = req.params;
  
  let movie = await DataStore.findOne('movies', { id: movId });
  if (!movie) {
    const allMovs = await DataStore.find('movies');
    movie = allMovs.find(m => String(m.id || m._id).toLowerCase() === String(movId).toLowerCase()) || allMovs[0];
  }

  let theatre = await DataStore.findOne('theatres', { id: thId });
  if (!theatre) {
    const allTh = await DataStore.find('theatres');
    theatre = allTh.find(t => String(t.id || t._id).toLowerCase() === String(thId).toLowerCase() || (t.name && t.name.toLowerCase().includes(String(thId).toLowerCase()))) || allTh[0];
  }

  const shows = [];
  const datesSet = new Set();
  const slotsByDate = {};

  if (movie && movie.schedules) {
    Object.keys(movie.schedules).forEach(dStr => {
      const thList = movie.schedules[dStr];
      if (Array.isArray(thList)) {
        thList.forEach(th => {
          if (String(th.id || th._id).toLowerCase() === String(thId).toLowerCase() || (th.name && theatre?.name && th.name.toLowerCase() === theatre.name.toLowerCase())) {
            if (Array.isArray(th.shows) && th.shows.length > 0) {
              datesSet.add(dStr);
              if (!slotsByDate[dStr]) slotsByDate[dStr] = [];
              th.shows.forEach(s => {
                const item = { ...s, date: dStr, time: s.time || s.showTime, showTime: s.time || s.showTime };
                shows.push(item);
                slotsByDate[dStr].push(item);
              });
            }
          }
        });
      }
    });
  }

  if (theatre && (theatre.hallSlotsByDate || theatre.dateHalls)) {
    const hbd = theatre.hallSlotsByDate || theatre.dateHalls;
    Object.keys(hbd).forEach(dStr => {
      const halls = Array.isArray(hbd[dStr]) ? hbd[dStr] : [];
      halls.forEach(h => {
        if (!h.movieId || String(h.movieId).toLowerCase() === String(movId).toLowerCase() || (h.movieTitle && movie?.title && h.movieTitle.toLowerCase() === movie.title.toLowerCase())) {
          datesSet.add(dStr);
          if (!slotsByDate[dStr]) slotsByDate[dStr] = [];
          const item = { ...h, date: dStr, time: h.time || h.showTime, showTime: h.time || h.showTime };
          shows.push(item);
          slotsByDate[dStr].push(item);
        }
      });
    });
  }

  if (theatre && Array.isArray(theatre.shows)) {
    theatre.shows.forEach(s => {
      if (!s.movieId || String(s.movieId).toLowerCase() === String(movId).toLowerCase()) {
        const dStr = s.date || new Date().toISOString().split('T')[0];
        datesSet.add(dStr);
        if (!slotsByDate[dStr]) slotsByDate[dStr] = [];
        const item = { ...s, date: dStr, time: s.time || s.showTime, showTime: s.time || s.showTime };
        shows.push(item);
        slotsByDate[dStr].push(item);
      }
    });
  }

  res.json({
    success: true,
    dates: Array.from(datesSet),
    slotsByDate,
    showtimes: shows,
    shows
  });
});

// --------------------------------------------------------------------------
// THEATRES, HALLS & SEAT GRID ENDPOINTS
// --------------------------------------------------------------------------

// Theatres CRUD
app.get(['/api/theatres', '/api/admin/theatres', '/api/theaters'], async (req, res) => {
  const data = await DataStore.find('theatres');
  const sanitized = (Array.isArray(data) ? data : []).map(th => ({
    ...th,
    image: sanitizeMediaUrl(th.image),
    logo: sanitizeMediaUrl(th.logo, 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=300&q=80')
  }));
  res.json(sanitized);
});

app.post(['/api/theatres', '/api/admin/theatres', '/api/theaters'], async (req, res) => {
  const doc = {
    id: req.body.id || `th_${Date.now()}`,
    ...req.body,
    image: sanitizeMediaUrl(req.body.image),
    logo: sanitizeMediaUrl(req.body.logo, 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=300&q=80')
  };
  await DataStore.insertOne('theatres', doc);
  io.emit('THEATRES_UPDATED', doc);
  io.emit('THEATRE_UPDATED', doc);
  io.emit('GLOBAL_ADMIN_UPDATE', { type: 'THEATRES', doc });
  res.status(201).json({ success: true, theatre: doc });
});

app.put(['/api/theatres/:id', '/api/admin/theatres/:id', '/api/theaters/:id'], async (req, res) => {
  const thId = req.params.id;
  const updateData = { ...req.body };
  if (updateData.image) updateData.image = sanitizeMediaUrl(updateData.image);
  if (updateData.logo) updateData.logo = sanitizeMediaUrl(updateData.logo, 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=300&q=80');
  await DataStore.updateOne('theatres', { id: thId }, updateData);
  const updated = await DataStore.findOne('theatres', { id: thId });
  const finalDoc = updated || { id: thId, ...updateData };
  io.emit('THEATRES_UPDATED', finalDoc);
  io.emit('THEATRE_UPDATED', finalDoc);
  io.emit('GLOBAL_ADMIN_UPDATE', { type: 'THEATRES', doc: finalDoc });
  res.json({ success: true, theatre: finalDoc });
});

app.delete(['/api/theatres/:id', '/api/admin/theatres/:id', '/api/theaters/:id'], async (req, res) => {
  const targetId = req.params.id;
  await DataStore.deleteOne('theatres', { id: targetId });
  io.emit('THEATRES_UPDATED', { deletedId: targetId });
  io.emit('THEATRE_UPDATED', { deletedId: targetId });
  io.emit('THEATRE_DELETED', { id: targetId, deletedId: targetId });
  io.emit('THEATRES_DELETED', { id: targetId, deletedId: targetId });
  io.emit('GLOBAL_ADMIN_UPDATE', { type: 'THEATRES_DELETED', deletedId: targetId });
  res.json({ success: true, message: 'Theatre permanently deleted from MongoDB' });
});

// Theatre Hall Slots & Showtimes
app.post([
  '/api/admin/theatres/hall-slots',
  '/api/theatres/add-hall-slot',
  '/api/admin/theatres/pricing-by-date'
], async (req, res) => {
  const { theatreId, targetTheaterId, movieId, movieTitle, hallName, format, price, showTime, time, totalSeats, activeConfigDate, selectedDate, dateStr } = req.body;
  const thId = String(theatreId || targetTheaterId || 'th_1').trim();
  const targetDate = activeConfigDate || selectedDate || dateStr || new Date().toISOString().split('T')[0];

  let theatre = await DataStore.findOne('theatres', { id: thId });
  if (!theatre) {
    const allTh = await DataStore.find('theatres');
    theatre = allTh.find(t => String(t.id || t._id).toLowerCase() === thId.toLowerCase() || (t.name && t.name.toLowerCase().includes(thId.toLowerCase()))) || allTh[0];
  }

  const hallItem = {
    id: `hall_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    movieId: movieId || 'mov_1',
    movieTitle: movieTitle || 'PrimeShow Feature',
    hallName: hallName || 'Hall 1',
    format: format || 'IMAX 3D',
    price: Number(price) || 450,
    time: time || showTime || '10:30 AM',
    showTime: time || showTime || '10:30 AM',
    totalSeats: Number(totalSeats) || 120,
    date: targetDate
  };

  if (theatre) {
    const currentHBD = { ...(theatre.hallSlotsByDate || theatre.dateHalls || {}) };
    const dateHalls = Array.isArray(currentHBD[targetDate]) ? [...currentHBD[targetDate]] : [];
    const existingIdx = dateHalls.findIndex(h => h.hallName === hallItem.hallName);
    if (existingIdx > -1) {
      dateHalls[existingIdx] = { ...dateHalls[existingIdx], ...hallItem };
    } else {
      dateHalls.push(hallItem);
    }
    currentHBD[targetDate] = dateHalls;

    const availableDates = Array.isArray(theatre.availableDates) ? [...theatre.availableDates] : [];
    if (!availableDates.includes(targetDate)) availableDates.push(targetDate);

    await DataStore.updateOne('theatres', { id: theatre.id }, {
      hallSlotsByDate: currentHBD,
      dateHalls: currentHBD,
      availableDates
    });

    theatre = { ...theatre, hallSlotsByDate: currentHBD, dateHalls: currentHBD, availableDates };
  } else {
    theatre = {
      id: thId,
      name: 'PrimeShow Multiplex',
      city: 'Surat',
      hallSlotsByDate: { [targetDate]: [hallItem] },
      dateHalls: { [targetDate]: [hallItem] },
      availableDates: [targetDate]
    };
    await DataStore.insertOne('theatres', theatre);
  }

  io.emit('THEATRES_UPDATED', theatre);
  res.json({ success: true, message: 'Hall & Price slot saved in MongoDB', theatre });
});

app.post(['/api/admin/theatres/shows', '/api/theatres/:theatreId/shows'], async (req, res) => {
  const thId = req.params.theatreId || req.body.theatreId || 'th_1';
  let theatre = await DataStore.findOne('theatres', { id: thId });
  if (theatre) {
    const shows = Array.isArray(theatre.shows) ? [...theatre.shows] : [];
    const newShow = { id: `sh_${Date.now()}`, ...req.body };
    shows.push(newShow);
    await DataStore.updateOne('theatres', { id: thId }, { shows });
    return res.json({ success: true, theatre: { ...theatre, shows } });
  }
  res.json({ success: true, message: 'Show added' });
});

app.delete(['/api/theatres/:theatreId/halls/:hallId', '/api/admin/theatres/:theatreId/halls/:hallId'], async (req, res) => {
  const { theatreId, hallId } = req.params;
  const dateStr = req.query.date;

  let theatre = await DataStore.findOne('theatres', { id: theatreId });
  if (theatre) {
    const currentHBD = { ...(theatre.hallSlotsByDate || theatre.dateHalls || {}) };
    if (dateStr && Array.isArray(currentHBD[dateStr])) {
      currentHBD[dateStr] = currentHBD[dateStr].filter(h => h.id !== hallId);
    } else {
      Object.keys(currentHBD).forEach(dKey => {
        if (Array.isArray(currentHBD[dKey])) {
          currentHBD[dKey] = currentHBD[dKey].filter(h => h.id !== hallId);
        }
      });
    }
    await DataStore.updateOne('theatres', { id: theatre.id }, {
      hallSlotsByDate: currentHBD,
      dateHalls: currentHBD
    });
    theatre = { ...theatre, hallSlotsByDate: currentHBD, dateHalls: currentHBD };
  }

  io.emit('THEATRES_UPDATED', theatre);
  res.json({ success: true, message: 'Hall deleted from MongoDB', theatre });
});

app.delete('/api/theatres/:theatreId/shows/:showId', async (req, res) => {
  const { theatreId, showId } = req.params;
  let theatre = await DataStore.findOne('theatres', { id: theatreId });
  if (theatre && Array.isArray(theatre.shows)) {
    const shows = theatre.shows.filter(s => s.id !== showId);
    await DataStore.updateOne('theatres', { id: theatreId }, { shows });
    return res.json({ success: true, theatre: { ...theatre, shows } });
  }
  res.json({ success: true, message: 'Show deleted' });
});

// Screen Layouts & Seat Grid Management
app.get([
  '/api/screen-layouts',
  '/api/admin/screen-layouts',
  '/api/get-seats',
  '/api/get-seats.php'
], async (req, res) => {
  const { city, theater, theatreId, movie, movieId, show_date, date, show_time, showTime, time, show_id, screenId } = req.query;
  const layouts = await DataStore.find('screen_layouts');
  const layoutsMap = {};
  layouts.forEach(l => {
    if (l && l.screenId) {
      layoutsMap[l.screenId] = l;
    }
  });

  const cCity = String(city || 'Surat').trim();
  const cTh = String(theater || theatreId || 'th_1').trim();
  const cMov = String(movie || movieId || 'mov_1').trim();
  const cDate = String(show_date || date || new Date().toISOString().split('T')[0]).trim();
  const cTime = String(show_time || showTime || time || '05:30 PM').trim();

  const targetKey1 = show_id || screenId || `${cCity}_${cTh}_${cMov}_${cDate}_${cTime}`;
  const targetKey2 = `${cTh}_${cMov}_${cDate}_${cTime}`;

  const matchedLayout = layoutsMap[targetKey1] || layoutsMap[targetKey2] || layoutsMap[screenId] || {
    screenId: targetKey1,
    rows: [
      { row: 'N', tier: 'Classic Normal (Screen Front)', price: 280, seatsCount: 12 },
      { row: 'P', tier: 'Premium Tier', price: 480, seatsCount: 12 },
      { row: 'R', tier: 'Luxury Recliner', price: 650, seatsCount: 10 },
      { row: 'V', tier: 'VIP Gold Lounge (Back Tier)', price: 950, seatsCount: 8 }
    ],
    blockedSeats: [],
    customStatuses: {}
  };

  const bookings = await DataStore.find('bookings');
  const bookedSeatsList = [];
  bookings.forEach(b => {
    const isSame = (b.showId === targetKey1 || b.showId === targetKey2 || b.screenId === targetKey1 || b.screenId === targetKey2) ||
      (b.theatreId === cTh && b.movieId === cMov && b.showDate === cDate && (b.showTime === cTime || b.time === cTime));
    if (isSame && (b.status || 'CONFIRMED').toUpperCase() !== 'CANCELLED' && Array.isArray(b.seats)) {
      bookedSeatsList.push(...b.seats);
    }
  });

  const blockedList = matchedLayout.blockedSeats || [];
  const customStats = matchedLayout.customStatuses || {};

  const seatMatrix = [];
  (matchedLayout.rows || []).forEach(tierObj => {
    for (let i = 1; i <= tierObj.seatsCount; i++) {
      const seatNum = `${tierObj.row}${i}`;
      const isBooked = bookedSeatsList.includes(seatNum) || customStats[seatNum] === 'BOOKED';
      const isBlocked = blockedList.includes(seatNum) || customStats[seatNum] === 'BLOCKED' || customStats[seatNum] === 'ADMIN_BLOCKED';

      seatMatrix.push({
        seat_number: seatNum,
        row: tierObj.row,
        tier: tierObj.tier,
        price: tierObj.price,
        status: isBooked ? 'booked' : (isBlocked ? 'blocked' : 'available'),
        isBlocked: isBlocked,
        isBooked: isBooked
      });
    }
  });

  res.json({
    success: true,
    screenId: matchedLayout.screenId,
    city: cCity,
    theatreId: cTh,
    movieId: cMov,
    showDate: cDate,
    showTime: cTime,
    rows: matchedLayout.rows,
    tiers: matchedLayout.rows,
    blockedSeats: blockedList,
    customStatuses: customStats,
    seats: seatMatrix,
    screenLayouts: layoutsMap,
    ...layoutsMap
  });
});

app.post([
  '/api/screen-layouts/save',
  '/api/screen-layouts/create',
  '/api/admin/save-seat-grid',
  '/api/admin/save-seat-grid.php'
], async (req, res) => {
  const { city, theater, theatreId, movie, movieId, show_date, date, show_time, showTime, time, screenId, rows, tiers, blockedSeats, customStatuses, isApproved } = req.body;
  const cCity = String(city || 'Surat').trim();
  const cTh = String(theater || theatreId || 'th_1').trim();
  const cMov = String(movie || movieId || 'mov_1').trim();
  const cDate = String(show_date || date || new Date().toISOString().split('T')[0]).trim();
  const cTime = String(show_time || showTime || time || '05:30 PM').trim();

  const targetScreenId = screenId || `${cCity}_${cTh}_${cMov}_${cDate}_${cTime}`;
  const baseScreenId = `${cTh}_${cMov}_${cDate}_${cTime}`;

  let layout = await DataStore.findOne('screen_layouts', { screenId: targetScreenId }) || { screenId: targetScreenId, blockedSeats: [], customStatuses: {} };
  
  if (rows || tiers) layout.rows = rows || tiers;
  if (Array.isArray(blockedSeats)) layout.blockedSeats = blockedSeats;
  if (customStatuses) layout.customStatuses = customStatuses;
  if (isApproved !== undefined) layout.isApproved = isApproved;
  layout.updatedAt = new Date().toISOString();

  await DataStore.updateOne('screen_layouts', { screenId: targetScreenId }, layout);
  await DataStore.updateOne('screen_layouts', { screenId: baseScreenId }, { ...layout, screenId: baseScreenId });

  io.emit('SCREEN_LAYOUT_UPDATED', layout);
  res.json({ success: true, screenId: targetScreenId, layout, blockedSeats: layout.blockedSeats });
});

app.get(['/api/theatres/:theatreId/screens/:screenId/blocked-seats', '/api/theaters/:theatreId/screens/:screenId/blocked-seats'], async (req, res) => {
  const { theatreId, screenId } = req.params;
  const layout = await DataStore.findOne('screen_layouts', { screenId }) || {};
  res.json({
    success: true,
    theatreId,
    screenId,
    blockedSeats: layout.blockedSeats || [],
    customStatuses: layout.customStatuses || {}
  });
});

app.post([
  '/api/theatres/:theatreId/screens/:screenId/blocked-seats',
  '/api/theaters/:theatreId/screens/:screenId/blocked-seats',
  '/api/theatres/:theatreId/screens/:screenId/toggle-block',
  '/api/theaters/:theatreId/screens/:screenId/toggle-block',
  '/api/theatres/:theatreId/screens/:screenId/toggle-seat-block',
  '/api/theaters/:theatreId/screens/:screenId/toggle-seat-block'
], async (req, res) => {
  const { theatreId, screenId } = req.params;
  const { seatId, blockedSeats, customStatuses } = req.body;
  let layout = await DataStore.findOne('screen_layouts', { screenId }) || { screenId, blockedSeats: [], customStatuses: {} };
  
  if (Array.isArray(blockedSeats)) {
    layout.blockedSeats = blockedSeats;
  } else if (seatId) {
    const blocked = layout.blockedSeats || [];
    const exists = blocked.includes(seatId);
    layout.blockedSeats = exists ? blocked.filter(s => s !== seatId) : [...blocked, seatId];
  }
  if (customStatuses) {
    layout.customStatuses = { ...(layout.customStatuses || {}), ...customStatuses };
  }

  await DataStore.updateOne('screen_layouts', { screenId }, layout);
  io.emit('SCREEN_LAYOUT_UPDATED', layout);
  res.json({ success: true, theatreId, screenId, layout, blockedSeats: layout.blockedSeats });
});

// --------------------------------------------------------------------------
// BOOKINGS & SEAT SELECTION ENDPOINTS
// --------------------------------------------------------------------------

app.get(['/api/admin/bookings', '/api/bookings'], async (req, res) => {
  let bookings = await DataStore.find('bookings');
  const userIdParam = String(req.query.userId || req.query.id || '').trim();
  const emailParam = String(req.query.userEmail || req.query.email || '').toLowerCase().trim();

  if (userIdParam || emailParam) {
    bookings = bookings.filter(b => {
      const bUid = String(b.userId || '');
      const bMail = String(b.userEmail || '').toLowerCase();
      return (userIdParam && bUid === userIdParam) || (emailParam && bMail === emailParam);
    });
  }

  res.json({
    success: true,
    bookings,
    totalBookings: bookings.length,
    totalPages: 1,
    currentPage: 1
  });
});

app.get('/api/bookings/live-seats', async (req, res) => {
  const { showId, theatreId, movieId, date, showTime } = req.query;
  const bookings = await DataStore.find('bookings');
  const bookedSeatsMap = {};
  const bookedSeatsList = [];

  bookings.forEach(b => {
    const isMatchingShow = (showId && (b.showId === showId || b.screenId === showId || b.isolatedLayoutKey === showId)) ||
      (b.theatreId === theatreId && b.movieId === movieId && b.showDate === date && (b.showTime === showTime || b.time === showTime));

    if (isMatchingShow && (b.status || 'CONFIRMED').toUpperCase() !== 'CANCELLED') {
      if (Array.isArray(b.seats)) {
        b.seats.forEach(s => {
          bookedSeatsList.push(s);
          bookedSeatsMap[s] = {
            userName: b.userName || b.userEmail || 'Customer',
            userEmail: b.userEmail || '',
            bookingId: b.id,
            status: 'BOOKED',
            bookingDate: b.bookingDate || b.createdAt
          };
        });
      }
    }
  });

  res.json({
    success: true,
    showId,
    bookedSeats: bookedSeatsMap,
    bookedSeatsList: Array.from(new Set(bookedSeatsList))
  });
});

app.post('/api/bookings/hold-seats', async (req, res) => {
  const { showId, seats } = req.body;
  res.json({ success: true, showId, seats: seats || [] });
});

app.post([
  '/api/admin/bookings',
  '/api/bookings',
  '/api/bookings/create',
  '/api/events/book',
  '/api/plays/book',
  '/api/bookings/playlist',
  '/api/activities/book',
  '/api/bookings/activity',
  '/api/private-theatre/book'
], async (req, res) => {
  const bookingId = req.body.id || req.body.bookingId || `bk_${Date.now()}_${Math.floor(Math.random() * 9000 + 1000)}`;
  const thId = String(req.body.theatreId || 'th_1').trim();
  const movId = String(req.body.movieId || 'mov_1').trim();
  const sDate = String(req.body.showDate || req.body.date || new Date().toISOString().split('T')[0]).trim();
  const sTime = String(req.body.showTime || req.body.time || '10:00 AM').trim();
  const sCity = String(req.body.city || req.body.theatreCity || 'Surat').trim();

  const showKey = req.body.showId || req.body.isolatedLayoutKey || req.body.screenId || `${thId}_${movId}_${sDate}_${sTime}`;
  const requestedSeats = Array.isArray(req.body.seats) ? req.body.seats : [req.body.seats || 'C4'];

  const layout = await DataStore.findOne('screen_layouts', { screenId: showKey }) ||
    await DataStore.findOne('screen_layouts', { screenId: `${sCity}_${showKey}` }) ||
    await DataStore.findOne('screen_layouts', { screenId: `${thId}_${movId}_${sDate}_${sTime}` });

  if (layout) {
    const adminBlocked = layout.blockedSeats || [];
    const customStats = layout.customStatuses || {};
    const conflictSeat = requestedSeats.find(s => adminBlocked.includes(s) || customStats[s] === 'BLOCKED' || customStats[s] === 'ADMIN_BLOCKED');
    if (conflictSeat) {
      return res.status(400).json({
        success: false,
        error: `Seat ${conflictSeat} is blocked by Admin and cannot be booked.`
      });
    }
  }

  const existingBookings = await DataStore.find('bookings');
  const alreadyBookedSeat = requestedSeats.find(s => {
    return existingBookings.some(b => {
      if ((b.status || 'CONFIRMED').toUpperCase() === 'CANCELLED') return false;
      const isSameShow = (b.showId === showKey || b.screenId === showKey || b.isolatedLayoutKey === showKey) ||
        (b.theatreId === thId && b.movieId === movId && b.showDate === sDate && (b.showTime === sTime || b.time === sTime));
      return isSameShow && Array.isArray(b.seats) && b.seats.includes(s);
    });
  });

  if (alreadyBookedSeat) {
    return res.status(400).json({
      success: false,
      error: `Seat ${alreadyBookedSeat} is already booked by another user.`
    });
  }

  const bookingDoc = {
    id: bookingId,
    bookingId,
    userId: String(req.body.userId || 'usr_guest'),
    userEmail: String(req.body.userEmail || 'guest@example.com'),
    userName: String(req.body.userName || 'VIP Guest'),
    movieId: movId,
    movieTitle: req.body.movieTitle || req.body.title || 'Cinema Ticket',
    title: req.body.title || req.body.movieTitle || 'Cinema Ticket',
    poster: req.body.poster || req.body.posterUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    theatreId: thId,
    theatreName: req.body.theatreName || req.body.venue || 'PrimeShow Multiplex',
    venue: req.body.venue || req.body.theatreName || 'PrimeShow Multiplex',
    city: sCity,
    screenName: req.body.screenName || 'Screen 1',
    showId: showKey,
    screenId: showKey,
    isolatedLayoutKey: showKey,
    seats: requestedSeats,
    seatsBookedCount: requestedSeats.length,
    ticketCount: requestedSeats.length,
    tier: req.body.tier || 'Recliner',
    totalAmount: Number(req.body.totalAmount || req.body.price || 450),
    paymentMethod: req.body.paymentMethod || 'UPI (Instant)',
    category: req.body.category || 'Movie',
    bookingType: req.body.bookingType || 'movie',
    showDate: sDate,
    showTime: sTime,
    status: 'CONFIRMED',
    createdAt: new Date().toISOString()
  };

  await DataStore.insertOne('bookings', bookingDoc);
  io.emit('BOOKING_CREATED', bookingDoc);
  res.status(201).json({ success: true, booking: bookingDoc });
});

// --------------------------------------------------------------------------
// GENERIC ENTITIES (OFFERS, EVENTS, PLAYS, ACTIVITIES, SLIDES, CHIPS, UPCOMING)
// --------------------------------------------------------------------------

['offers', 'events', 'plays', 'activities', 'hero-slides', 'feature-chips', 'upcoming-movies', 'upcoming_movies'].forEach(entity => {
  const storeName = entity === 'upcoming_movies' ? 'upcoming-movies' : entity;
  const upperPlural = storeName.replace('-', '_').toUpperCase(); // EVENTS, PLAYS, OFFERS, ACTIVITIES
  const singular = storeName.endsWith('ies') 
    ? storeName.slice(0, -3) + 'y' 
    : (storeName.endsWith('s') ? storeName.slice(0, -1) : storeName);
  const upperSingular = singular.replace('-', '_').toUpperCase(); // EVENT, PLAY, OFFER, ACTIVITY

  app.get([`/api/${entity}`, `/api/admin/${entity}`], async (req, res) => {
    const data = await DataStore.find(storeName);
    res.json(data);
  });

  app.post([`/api/${entity}`, `/api/admin/${entity}`], async (req, res) => {
    const doc = { id: req.body.id || `${storeName.slice(0, 3)}_${Date.now()}`, ...req.body };
    await DataStore.insertOne(storeName, doc);
    io.emit(`${upperPlural}_UPDATED`, doc);
    io.emit(`${upperSingular}_UPDATED`, doc);
    io.emit('GLOBAL_ADMIN_UPDATE', { type: upperPlural, doc });
    res.status(201).json({ success: true, ...doc, data: doc, [storeName]: doc, [singular]: doc, [storeName.slice(0, -1)]: doc });
  });

  app.put([`/api/${entity}/:id`, `/api/admin/${entity}/:id`], async (req, res) => {
    const targetId = req.params.id;
    await DataStore.updateOne(storeName, { id: targetId }, req.body);
    const updated = await DataStore.findOne(storeName, { id: targetId });
    const finalDoc = updated || { id: targetId, ...req.body };
    io.emit(`${upperPlural}_UPDATED`, finalDoc);
    io.emit(`${upperSingular}_UPDATED`, finalDoc);
    io.emit('GLOBAL_ADMIN_UPDATE', { type: upperPlural, doc: finalDoc });
    res.json({ success: true, ...finalDoc, data: finalDoc, [storeName]: finalDoc, [singular]: finalDoc, [storeName.slice(0, -1)]: finalDoc });
  });

  app.delete([`/api/${entity}/:id`, `/api/admin/${entity}/:id`], async (req, res) => {
    const targetId = req.params.id;
    await DataStore.deleteOne(storeName, { id: targetId });
    io.emit(`${upperPlural}_UPDATED`, { deletedId: targetId });
    io.emit(`${upperSingular}_UPDATED`, { deletedId: targetId });
    io.emit(`${upperPlural}_DELETED`, { id: targetId, deletedId: targetId });
    io.emit(`${upperSingular}_DELETED`, { id: targetId, deletedId: targetId });
    io.emit('GLOBAL_ADMIN_UPDATE', { type: `${upperPlural}_DELETED`, deletedId: targetId });
    res.json({ success: true, message: `${storeName} item deleted` });
  });
});

app.post('/api/admin/events/add-slot', async (req, res) => {
  const { eventId, slotTime, slotDate, price } = req.body;
  const event = await DataStore.findOne('events', { id: eventId });
  if (event) {
    const slots = Array.isArray(event.slots) ? [...event.slots] : [];
    slots.push({ id: `slot_${Date.now()}`, slotTime, slotDate, price: Number(price) || 500 });
    await DataStore.updateOne('events', { id: eventId }, { slots });
    const updatedEvent = { ...event, slots };
    io.emit('EVENTS_UPDATED', updatedEvent);
    io.emit('EVENT_UPDATED', updatedEvent);
    io.emit('GLOBAL_ADMIN_UPDATE', { type: 'EVENTS', doc: updatedEvent });
    return res.json({ success: true, event: updatedEvent });
  }
  res.json({ success: true, message: 'Slot added to event' });
});

// --------------------------------------------------------------------------
// NOTIFICATIONS & SUPPORT CHAT ENDPOINTS
// --------------------------------------------------------------------------

app.get([
  '/api/notifications',
  '/api/admin/notifications',
  '/api/get-user-notifications',
  '/api/get-user-notifications.php'
], async (req, res) => {
  const allNotifs = await DataStore.find('notifications');
  const uId = String(req.query.user_id || req.query.userId || req.query.id || '').trim();
  const uEmail = String(req.query.userEmail || req.query.email || '').toLowerCase().trim();

  let filtered = allNotifs;
  if (uId || uEmail) {
    filtered = allNotifs.filter(n => {
      const isAll = !n.target_type || n.target_type === 'all' || n.target_audience === 'all' || n.targetType === 'ALL';
      const isTargetedUser = (uId && (n.target_user_id === uId || n.user_id === uId || (Array.isArray(n.targetUserIds) && n.targetUserIds.includes(uId)))) ||
        (uEmail && (n.target_user_id === uEmail || n.user_id === uEmail || (Array.isArray(n.targetUserIds) && n.targetUserIds.includes(uEmail))));
      return isAll || isTargetedUser;
    });
  }

  filtered.sort((a, b) => new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0));

  res.json({
    status: true,
    success: true,
    notifications: filtered,
    data: filtered,
    total: filtered.length
  });
});

app.post([
  '/api/notifications',
  '/api/admin/notifications',
  '/api/admin/add-notification',
  '/api/admin/add-notification.php'
], async (req, res) => {
  const notifId = req.body.id || req.body.notification_id || `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const rawTarget = String(req.body.target_type || req.body.target_audience || req.body.targetType || 'all').toLowerCase();
  const isAll = rawTarget === 'all' || rawTarget === 'global';

  let targetUserId = req.body.target_user_id || req.body.user_id || req.body.targetUserId || null;
  if (!targetUserId && Array.isArray(req.body.targetUserIds) && req.body.targetUserIds.length > 0) {
    targetUserId = req.body.targetUserIds[0];
  }

  const notifDoc = {
    id: notifId,
    notification_id: notifId,
    target_type: isAll ? 'all' : 'specific_user',
    targetType: isAll ? 'ALL' : 'SPECIFIC',
    target_audience: isAll ? 'all' : 'specific_user',
    target_user_id: isAll ? null : targetUserId,
    targetUserIds: isAll ? [] : (Array.isArray(req.body.targetUserIds) ? req.body.targetUserIds : [targetUserId].filter(Boolean)),
    user_id: isAll ? null : targetUserId,
    title: String(req.body.title || 'System Announcement').trim(),
    priority: String(req.body.priority || req.body.priority_type || req.body.type || 'Info').trim(),
    priority_type: String(req.body.priority_type || req.body.priority || req.body.type || 'Info').trim(),
    type: String(req.body.type || req.body.priority || req.body.priority_type || 'Info').trim(),
    message: String(req.body.message || '').trim(),
    scheduled_at: req.body.scheduled_at || req.body.date || new Date().toISOString(),
    date: req.body.date || req.body.scheduled_at || new Date().toISOString(),
    created_at: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    read: false
  };

  await DataStore.insertOne('notifications', notifDoc);
  io.emit('NOTIFICATION_CREATED', notifDoc);

  res.status(201).json({
    status: true,
    success: true,
    message: 'Notification added successfully',
    notification: notifDoc,
    data: notifDoc
  });
});

app.put(['/api/notifications/:id', '/api/admin/notifications/:id'], async (req, res) => {
  const notifId = req.params.id;
  let notif = await DataStore.findOne('notifications', { id: notifId }) || await DataStore.findOne('notifications', { notification_id: notifId });

  if (notif) {
    const updated = { ...notif, ...req.body, updatedAt: new Date().toISOString() };
    await DataStore.updateOne('notifications', { id: notif.id }, updated);
    io.emit('NOTIFICATION_UPDATED', updated);
    return res.json({ status: true, success: true, message: 'Notification updated successfully', notification: updated, data: updated });
  }

  res.status(404).json({ status: false, success: false, message: 'Notification not found' });
});

app.put('/api/notifications/:id/read', async (req, res) => {
  const notifId = req.params.id;
  await DataStore.updateOne('notifications', { id: notifId }, { read: true });
  res.json({ success: true, message: 'Notification marked as read' });
});

app.delete(['/api/notifications/:id', '/api/admin/notifications/:id'], async (req, res) => {
  const notifId = req.params.id;
  await DataStore.deleteOne('notifications', { id: notifId });
  await DataStore.deleteOne('notifications', { notification_id: notifId });
  io.emit('NOTIFICATION_DELETED', { id: notifId });
  res.json({ status: true, success: true, message: 'Notification deleted successfully' });
});

// Support Messages
app.get('/api/support/messages', async (req, res) => {
  const msgs = await DataStore.find('support_messages');
  res.json(msgs);
});

app.post('/api/support/messages', async (req, res) => {
  const doc = { id: `msg_${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
  await DataStore.insertOne('support_messages', doc);
  io.emit('NEW_SUPPORT_MESSAGE', doc);
  io.emit('receive_message', doc);
  res.status(201).json(doc);
});

app.post('/api/support/messages/:id/reply', async (req, res) => {
  const msgId = req.params.id;
  const { replyText } = req.body;
  let msg = await DataStore.findOne('support_messages', { id: msgId });
  if (msg) {
    const replies = Array.isArray(msg.replies) ? [...msg.replies] : [];
    replies.push({ id: `r_${Date.now()}`, text: replyText, sender: 'Support', createdAt: new Date().toISOString() });
    await DataStore.updateOne('support_messages', { id: msgId }, { replies, status: 'REPLIED' });
    const updated = { ...msg, replies, status: 'REPLIED' };
    io.emit('SUPPORT_REPLY_ADDED', updated);
    io.emit('SUPPORT_MESSAGE_REPLIED', updated);
    return res.json({ success: true, message: updated });
  }
  res.json({ success: true, message: 'Reply sent' });
});

// Clear all live support chat messages
app.delete(['/api/support/messages', '/api/admin/support/messages', '/api/admin/support/messages/clear'], async (req, res) => {
  try {
    const coll = DataStore.getCollection('support_messages');
    if (coll) {
      await coll.deleteMany({});
    }
    const dataDir = path.join(__dirname, 'data');
    const filePath = path.join(dataDir, 'support_messages.json');
    if (fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    }
    io.emit('SUPPORT_MESSAGES_CLEARED');
    res.json({ success: true, message: 'All live support chat messages deleted successfully' });
  } catch (err) {
    console.error('Error clearing support messages:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete specific support message
app.delete(['/api/support/messages/:id', '/api/admin/support/messages/:id'], async (req, res) => {
  try {
    const msgId = req.params.id;
    await DataStore.deleteOne('support_messages', { id: msgId });
    io.emit('SUPPORT_MESSAGE_DELETED', { id: msgId });
    res.json({ success: true, message: 'Support message deleted successfully' });
  } catch (err) {
    console.error('Error deleting support message:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Coupons Verification Endpoint
app.post('/api/coupons/verify', async (req, res) => {
  const { code, cartTotal } = req.body;
  const cleanCode = String(code || '').toUpperCase().trim();
  
  if (cleanCode === 'PRIMESHOW50' || cleanCode === 'WELCOME50' || cleanCode === 'VIP50') {
    const discount = Math.round((Number(cartTotal || 500) * 0.5));
    return res.json({
      success: true,
      valid: true,
      code: cleanCode,
      discountAmount: discount,
      message: '50% Flat Promo Discount Applied!'
    });
  }

  if (cleanCode === 'PRIMESHOW100' || cleanCode === 'FIRST100') {
    const discount = Math.min(100, Number(cartTotal || 500));
    return res.json({
      success: true,
      valid: true,
      code: cleanCode,
      discountAmount: discount,
      message: '₹100 Flat Promo Discount Applied!'
    });
  }

  res.status(400).json({ success: false, valid: false, message: 'Invalid or expired promotional code' });
});

// Fallback 404 Route for express
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    endpoint: req.originalUrl,
    method: req.method
  });
});

// Global Express Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled express error:', err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Socket.io Connection Handler
io.on('connection', (socket) => {
  console.log(`⚡ [Socket.io]: Client connected (ID: ${socket.id})`);
  
  socket.on('JOIN_USER_ROOM', (userId) => {
    if (userId) socket.join(`user_${userId}`);
  });

  socket.on('JOIN_ADMIN_ROOM', () => {
    socket.join('admin_room');
  });

  socket.on('send_message', async (data) => {
    if (!data) return;
    try {
      if (data.msgId && data.replyText) {
        // Reply to existing message
        let msg = await DataStore.findOne('support_messages', { id: data.msgId });
        if (msg) {
          const replies = Array.isArray(msg.replies) ? [...msg.replies] : [];
          replies.push({ id: `r_${Date.now()}`, text: data.replyText, sender: data.sender || 'Support', createdAt: new Date().toISOString() });
          await DataStore.updateOne('support_messages', { id: data.msgId }, { replies, status: 'REPLIED' });
          const updated = { ...msg, replies, status: 'REPLIED' };
          io.emit('SUPPORT_REPLY_ADDED', updated);
          io.emit('SUPPORT_MESSAGE_REPLIED', updated);
        }
      } else {
        // New incoming live message
        const doc = { id: data.id || `msg_${Date.now()}`, ...data, createdAt: data.createdAt || new Date().toISOString() };
        await DataStore.insertOne('support_messages', doc);
        io.emit('NEW_SUPPORT_MESSAGE', doc);
        io.emit('receive_message', doc);
      }
    } catch (e) {
      console.error('Socket send_message error:', e.message);
    }
  });

  socket.on('clear_support_messages', async () => {
    try {
      const coll = DataStore.getCollection('support_messages');
      if (coll) {
        await coll.deleteMany({});
      }
      const dataDir = path.join(__dirname, 'data');
      const filePath = path.join(dataDir, 'support_messages.json');
      if (fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([], null, 2));
      }
      io.emit('SUPPORT_MESSAGES_CLEARED');
    } catch (e) {
      console.error('Socket clear_support_messages error:', e.message);
    }
  });

  socket.on('disconnect', () => {
    console.log(`⚡ [Socket.io]: Client disconnected (ID: ${socket.id})`);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 PrimeShow Node.js REST API & Socket.io Backend running on port ${PORT}`);
});

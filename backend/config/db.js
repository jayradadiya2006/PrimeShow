const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.MONGO_DB_NAME || 'primeshow';

let client = null;
let db = null;

async function connectDB() {
  if (db) return db;
  try {
    client = new MongoClient(MONGO_URI, {
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000
    });
    await client.connect();
    
    if (MONGO_URI.includes('.mongodb.net/') && MONGO_URI.split('.mongodb.net/')[1]?.split('?')[0]) {
      const uriDbName = MONGO_URI.split('.mongodb.net/')[1].split('?')[0];
      db = client.db(uriDbName || DB_NAME);
    } else {
      db = client.db(DB_NAME);
    }
    
    console.log('MongoDB Atlas Connected Successfully');
    return db;
  } catch (err) {
    console.error('❌ MongoDB Atlas connection error:', err.message);
    throw err;
  }
}

function getDB() {
  return db;
}

module.exports = { connectDB, getDB };

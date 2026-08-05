import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';

// Read API Key from Vite / Next / Process environment variables
const rawApiKey = 
  import.meta.env.VITE_FIREBASE_API_KEY || 
  import.meta.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
  (typeof process !== 'undefined' && process.env?.VITE_FIREBASE_API_KEY);

const firebaseConfig = {
  apiKey: rawApiKey || 'AIzaSyB3F-PrimeShowWebApiKey2026SecureAuth',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'primeshow-app.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'primeshow-app',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'primeshow-app.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789012:web:abcdef1234567890'
};

// Initialize Firebase App & Auth
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

export const isFirebaseConfigured = Boolean(
  rawApiKey && 
  rawApiKey !== 'your_firebase_api_key_here' && 
  !rawApiKey.includes('your_')
);

export { 
  app, 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
};

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const rawApiKey = import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.NEXT_PUBLIC_FIREBASE_API_KEY;

const firebaseConfig = {
  apiKey: rawApiKey || 'AIzaSyDemoDummyApiKeyForPrimeShow2026',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'primeshow-app.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'primeshow-app',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'primeshow-app.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789012:web:abcdef1234567890'
};

// Initialize Firebase App & Auth safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Check if valid Firebase API key is configured in environment
export const isFirebaseConfigured = Boolean(
  rawApiKey && 
  rawApiKey !== 'your_firebase_api_key_here' && 
  !rawApiKey.includes('Dummy')
);

export { app, RecaptchaVerifier, signInWithPhoneNumber };

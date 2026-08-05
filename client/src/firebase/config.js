import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBsKOJrdix1ufjlOx2RjCpd1Tn1bzGwLGY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'primeshow-89717.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'primeshow-89717',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'primeshow-89717.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '299682593375',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:299682593375:web:a53bcfb4f53cd09f6b39ea'
};

// Initialize Firebase App & Auth
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Initialize Firebase Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Native Direct Google Sign-In Helper Function
export const handleGoogleSignIn = async () => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error;
  }
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && !firebaseConfig.apiKey.includes('your_'));

export { 
  app, 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
};

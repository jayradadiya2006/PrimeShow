const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== 'your_firebase_api_key_here' &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

let app = null;
let auth = null;
let RecaptchaVerifier = null;
let signInWithPhoneNumber = null;

try {
  const firebaseApp = await import(/* @vite-ignore */ 'firebase/app').catch(() => null);
  const firebaseAuth = await import(/* @vite-ignore */ 'firebase/auth').catch(() => null);

  if (firebaseApp && firebaseAuth && isFirebaseConfigured) {
    app = !firebaseApp.getApps().length ? firebaseApp.initializeApp(firebaseConfig) : firebaseApp.getApp();
    auth = firebaseAuth.getAuth(app);
    RecaptchaVerifier = firebaseAuth.RecaptchaVerifier;
    signInWithPhoneNumber = firebaseAuth.signInWithPhoneNumber;
  }
} catch (e) {
  console.info('[PrimeShow Auth Notice] Firebase SDK setup note. Using PrimeShow REST API SMS Gateway fallback.');
}

export { app, auth, RecaptchaVerifier, signInWithPhoneNumber };

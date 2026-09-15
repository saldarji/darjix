import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDemoApiKeyForDarjixBlog12345",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "darjix-website.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "darjix-website",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "darjix-website.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789012:web:abcdef1234567890",
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { app, db, auth, storage, googleProvider };

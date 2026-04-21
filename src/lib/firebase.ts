import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB4zviPgqf_WID-3O-Ngk05pStBBBEha2k",
  authDomain: "projet-b75a0.firebaseapp.com",
  projectId: "projet-b75a0",
  storageBucket: "projet-b75a0.firebasestorage.app",
  messagingSenderId: "656035490227",
  appId: "1:656035490227:web:8efdbbae55c296354083c6",
  measurementId: "G-NBNKLM98VE"
};

console.log('🔧 Firebase initializing with config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
});

const app = initializeApp(firebaseConfig);
console.log('✅ Firebase app initialized');

export const auth = getAuth(app);
console.log('✅ Firebase Auth initialized');

// Enable persistence
setPersistence(auth, browserLocalPersistence)
  .then(() => console.log('✅ Firebase persistence enabled'))
  .catch(err => console.error('❌ Persistence error:', err));

export const db = getFirestore(app);
console.log('✅ Firestore initialized');

export const storage = getStorage(app);
console.log('✅ Storage initialized');

export const googleProvider = new GoogleAuthProvider();
console.log('✅ Google Provider configured');

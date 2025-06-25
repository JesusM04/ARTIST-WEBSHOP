import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDX6h0y8iFQXcf0K_72xlhU-Fg9HQWP2jU",
  authDomain: "artist-shop-19e8d.firebaseapp.com",
  projectId: "artist-shop-19e8d",
  storageBucket: "artist-shop-19e8d.firebasestorage.app",
  messagingSenderId: "429940897530",
  appId: "1:429940897530:web:b979876956a66f5de7fb43"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize Auth with persistence
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('✅ Persistencia de autenticación configurada');
  })
  .catch((error) => {
    console.error('❌ Error configurando persistencia de autenticación:', error);
  });

// Initialize Firestore with persistence
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db)
    .then(() => {
      console.log('✅ Persistencia de Firestore configurada');
    })
    .catch((error) => {
      if (error.code === 'failed-precondition') {
        console.warn('⚠️ Multiple pestañas abiertas, la persistencia solo puede habilitarse en una pestaña a la vez.');
      } else if (error.code === 'unimplemented') {
        console.warn('⚠️ El navegador actual no soporta persistencia.');
      }
      console.error('❌ Error configurando persistencia de Firestore:', error);
    });
}

const googleProvider = new GoogleAuthProvider();

export { app, auth, db, storage, googleProvider }; 
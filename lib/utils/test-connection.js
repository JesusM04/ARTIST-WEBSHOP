import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDX6h0y8iFQXcf0K_72xlhU-Fg9HQWP2jU",
  authDomain: "artist-shop-19e8d.firebaseapp.com",
  projectId: "artist-shop-19e8d",
  storageBucket: "artist-shop-19e8d.firebasestorage.app",
  messagingSenderId: "429940897530",
  appId: "1:429940897530:web:b979876956a66f5de7fb43"
};

async function testConnection() {
  try {
    console.log('🔄 Iniciando prueba de conexión con Firebase...');
    
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    console.log('✅ Firebase inicializado correctamente');
    
    // Probar Auth
    const auth = getAuth(app);
    await signInAnonymously(auth);
    console.log('✅ Autenticación funcionando correctamente');
    
    // Probar Firestore
    const db = getFirestore(app);
    const testCollection = collection(db, 'test');
    await getDocs(testCollection);
    console.log('✅ Firestore funcionando correctamente');
    
    console.log('🎉 ¡Todas las pruebas completadas con éxito!');
  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  }
}

testConnection(); 
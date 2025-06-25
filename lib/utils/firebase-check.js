const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyD5p-cTzJdV7l6qGQtSj4G28KvJZJWNlXk",
  authDomain: "my-first-project-react-f62c9.firebaseapp.com",
  projectId: "my-first-project-react-f62c9",
  storageBucket: "my-first-project-react-f62c9.firebasestorage.app",
  messagingSenderId: "799437345963",
  appId: "1:799437345963:web:834530c339bfae56a853ee"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Primero vamos a crear un usuario de prueba
async function verificarAutenticacion() {
  try {
    console.log('🔐 Intentando autenticar...');
    await signInWithEmailAndPassword(auth, "test@test.com", "password123");
    console.log('✅ Autenticación exitosa');
    return true;
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.log('❌ Usuario de prueba no existe. Por favor, crea primero un usuario.');
    } else {
      console.error('❌ Error en autenticación:', error.message);
    }
    return false;
  }
}

async function verificarConexionFirestore() {
  try {
    // Primero verificamos la autenticación
    const autenticado = await verificarAutenticacion();
    if (!autenticado) {
      console.log('⚠️ No se puede verificar Firestore sin autenticación');
      return false;
    }

    console.log('📚 Intentando acceder a Firestore...');
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    console.log('✅ Conectado a Firestore. Colección users accesible.');
    console.log(`📊 Número de documentos en la colección: ${snapshot.size}`);
    return true;
  } catch (error) {
    console.error('❌ Error conectando a Firestore:', error.message);
    return false;
  }
}

async function verificarConfiguracion() {
  try {
    console.log('🔍 Iniciando verificación de Firebase...');
    const resultado = await verificarConexionFirestore();
    if (resultado) {
      console.log('✅ Configuración de Firebase correcta');
    } else {
      console.log('❌ Problemas con la configuración de Firebase');
    }
  } catch (error) {
    console.error('❌ Error en la verificación:', error);
  } finally {
    // Cerrar la conexión después de la verificación
    process.exit(0);
  }
}

// Ejecutar la verificación
verificarConfiguracion(); 
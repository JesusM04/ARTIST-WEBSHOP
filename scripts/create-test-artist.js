const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');
const { getAuth, createUserWithEmailAndPassword, updateProfile } = require('firebase/auth');

const firebaseConfig = {
  // Aquí debes colocar tu configuración de Firebase
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createTestArtist() {
  try {
    // Crear usuario en Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      'artista@test.com',
      'password123'
    );

    // Actualizar el perfil del usuario
    await updateProfile(userCredential.user, {
      displayName: 'Artista Test'
    });

    // Crear documento en Firestore
    await setDoc(doc(db, 'users', 'artista@test.com'), {
      email: 'artista@test.com',
      name: 'Artista Test',
      type: 'artist',
      createdAt: serverTimestamp(),
      pedidosRealizados: 0,
      photoURL: null,
      portfolio: [],
      rating: 5.0,
      descripcion: 'Artista de prueba para el sistema'
    });

    console.log('Usuario artista creado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('Error creando usuario artista:', error);
    process.exit(1);
  }
}

createTestArtist(); 
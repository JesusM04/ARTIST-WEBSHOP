import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC1779-Wq5nFVGpFlGoubfEum3fg75nTiw",
  authDomain: "my-first-project-react-f62c9.firebaseapp.com",
  projectId: "my-first-project-react-f62c9",
  storageBucket: "my-first-project-react-f62c9.appspot.com",
  messagingSenderId: "1015911941441",
  appId: "1:1015911941441:web:b5e7a5c45641a4b3f44f96",
  measurementId: "G-RLCD9YBKXM"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const artistUser = {
  email: "artist3@test.com",
  password: "artist123",
  name: "Artista Principal",
  role: "artist"
};

async function createArtist() {
  try {
    console.log('👨‍🎨 Intentando crear usuario artista...');
    const userCredential = await createUserWithEmailAndPassword(auth, artistUser.email, artistUser.password);
    
    // Crear el documento del artista en Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email: artistUser.email,
      name: artistUser.name,
      role: artistUser.role,
      createdAt: new Date().toISOString(),
      portfolio: [],
      completedOrders: 0,
      rating: 5.0,
      earnings: 0
    });

    console.log('✅ Artista creado exitosamente en Auth y Firestore:', userCredential.user.uid);
  } catch (error) {
    console.error('❌ Error creando el artista:', error.message);
  }
}

createArtist(); 
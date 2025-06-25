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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const testUser = {
  email: "test3@test.com",
  password: "password123",
  name: "Usuario de Prueba",
  role: "client"
};

async function createTestUser() {
  try {
    console.log('👤 Intentando crear usuario de prueba...');
    const userCredential = await createUserWithEmailAndPassword(auth, testUser.email, testUser.password);
    
    // Crear el documento del usuario en Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email: testUser.email,
      name: testUser.name,
      role: testUser.role,
      createdAt: new Date().toISOString()
    });
    
    console.log('✅ Usuario creado exitosamente en Auth y Firestore:', userCredential.user.uid);
  } catch (error) {
    console.error('❌ Error creando usuario:', error.message);
  }
}

createTestUser(); 
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDLAALgd4wCKAcYtZ88lU3GQCbsMiVmUSI",
  authDomain: "kisan-mvp.firebaseapp.com",
  projectId: "kisan-mvp",
  storageBucket: "kisan-mvp.firebasestorage.app",
  messagingSenderId: "419227645965",
  appId: "1:419227645965:web:04f90fc33fb7122213bd44"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const email = "admin@kisanmall.com";
const password = "password123";

async function createAdmin() {
  try {
    console.log("Creating admin account...");
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log("Auth user created with UID:", user.uid);
    
    // Add to admins collection
    await setDoc(doc(db, 'admins', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: "Administrator",
      createdAt: serverTimestamp()
    });
    
    console.log("Admin document created in Firestore successfully!");
    console.log(`\n✅ You can now log in with:\nEmail: ${email}\nPassword: ${password}\n`);
    process.exit(0);
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log("✅ Admin account already exists! You can log in with: admin@kisanmall.com");
    } else {
      console.error("Error creating admin:", error.message);
    }
    process.exit(1);
  }
}

createAdmin();

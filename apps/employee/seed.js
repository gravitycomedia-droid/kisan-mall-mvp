import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDLAALgd4wCKAcYtZ88lU3GQCbsMiVmUSI",
  authDomain: "kisan-mvp.firebaseapp.com",
  projectId: "kisan-mvp",
  storageBucket: "kisan-mvp.firebasestorage.app",
  messagingSenderId: "419227645965",
  appId: "1:419227645965:web:04f90fc33fb7122213bd44"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
  try {
    const docRef = await addDoc(collection(db, 'employees'), {
      name: 'Test Employee',
      mobile: '9999999999',
      department: 'Sales',
      status: 'active',
      language: 'en',
      managerName: 'Manager 1',
      managerPhone: '8888888888',
      createdAt: serverTimestamp()
    });
    console.log("Success! ID:", docRef.id);
  } catch (e) {
    console.log("Error:", e.message);
  }
}
seed();

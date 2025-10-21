import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCCGvr_4FIwpjI25EnyJQ8Be6ufJ7CiYk4",
  authDomain: "jobsconnect-dafde.firebaseapp.com",
  projectId: "jobsconnect-dafde",
  storageBucket: "jobsconnect-dafde.firebasestorage.app",
  messagingSenderId: "414605931773",
  appId: "1:414605931773:web:fb038aab1bf51227bcba94",
  measurementId: "G-0KQBNCZXWL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage
export const storage = getStorage(app);

export default app;

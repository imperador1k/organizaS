
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, initializeAuth, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAG4pZc7i28Je55uT9x6zk50QChrh8FsqU",
  authDomain: "organizas.firebaseapp.com",
  projectId: "organizas",
  storageBucket: "organizas.appspot.com",
  messagingSenderId: "36811670299",
  appId: "1:36811670299:web:30fff9cd6d368477d2c9be",
  measurementId: "G-CG8T3Y3GYS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = initializeAuth(app, {
  persistence: browserLocalPersistence
});
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);

export { app, auth, db, storage, analytics };

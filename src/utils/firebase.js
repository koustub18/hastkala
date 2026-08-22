import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAe4bI9u7kEo1q_r9pcVL5Wdd_7-CbuyFY",
  authDomain: "sihh-36ecf.firebaseapp.com",
  projectId: "sihh-36ecf",
  storageBucket: "sihh-36ecf.firebasestorage.app",
  messagingSenderId: "311587460892",
  appId: "1:311587460892:web:309919f2d04f702724ccd9",
  measurementId: "G-P1BDK146RQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

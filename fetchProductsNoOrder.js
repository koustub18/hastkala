import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAe4bI9u7kEo1q_r9pcVL5Wdd_7-CbuyFY",
  authDomain: "sihh-36ecf.firebaseapp.com",
  projectId: "sihh-36ecf",
  storageBucket: "sihh-36ecf.firebasestorage.app",
  messagingSenderId: "311587460892",
  appId: "1:311587460892:web:309919f2d04f702724ccd9",
  measurementId: "G-P1BDK146RQ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const querySnapshot = await getDocs(collection(db, "products"));
  let products = [];
  querySnapshot.forEach((doc) => {
    products.push({ id: doc.id, ...doc.data() });
  });
  console.log("Found products:", products);
  process.exit(0);
}

check().catch(console.error);

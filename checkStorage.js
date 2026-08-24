import { initializeApp } from "firebase/app";
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";

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
const storage = getStorage(app);

async function checkStorage() {
  try {
    const listRef = ref(storage, '/');
    const res = await listAll(listRef);
    console.log("Storage accessible. Items found:", res.items.length, res.prefixes.length);
    if (res.items.length > 0) {
      const url = await getDownloadURL(res.items[0]);
      console.log("First item URL:", url);
    }
    process.exit(0);
  } catch (err) {
    console.error("Storage Error:", err.code, err.message);
    process.exit(1);
  }
}

checkStorage();

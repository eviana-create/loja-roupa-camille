import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB_AkHKAYLL10lgom68FarOA_-cpVCRlYU",
  authDomain: "diva-vitoria-fashion.firebaseapp.com",
  projectId: "diva-vitoria-fashion",
  storageBucket: "diva-vitoria-fashion.firebasestorage.app",
  messagingSenderId: "1094840046675",
  appId: "1:1094840046675:web:53961a6340c54ce3e162a6",
  measurementId: "G-WSL4JZ9D5B"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
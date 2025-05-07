
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration
// Replace these with your actual Firebase project config when you set up your project
const firebaseConfig = {
  apiKey: "AIzaSyD1vbxgcnQy6Yw6s_jD7E8ZFHAWdGicWVY",
  authDomain: "recomendify-app.firebaseapp.com",
  projectId: "recomendify-app",
  storageBucket: "recomendify-app.appspot.com",
  messagingSenderId: "318952007035",
  appId: "1:318952007035:web:a8fd6f3f7b90e08dea4a8c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;

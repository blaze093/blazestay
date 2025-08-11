import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getDatabase } from "firebase/database"
import { getStorage } from "firebase/storage"
import { getAnalytics } from "firebase/analytics"

const firebaseConfig = {
  apiKey: "AIzaSyBh8r_BAeNkxJI20dXte_-7wOBjrFbzGGw",
  authDomain: "tazatokri93.firebaseapp.com",
  databaseURL: "https://tazatokri93-default-rtdb.firebaseio.com",
  projectId: "tazatokri93",
  storageBucket: "tazatokri93.firebasestorage.app",
  messagingSenderId: "820403511460",
  appId: "1:820403511460:web:19eb75432386082995c631",
  measurementId: "G-06S9CCFRCC",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const realtimeDb = getDatabase(app)
export const storage = getStorage(app)

// Initialize Analytics (only in browser)
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null

export default app

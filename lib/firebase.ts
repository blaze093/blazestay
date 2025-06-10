import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getDatabase } from "firebase/database"
import { getStorage } from "firebase/storage"
import { getAnalytics } from "firebase/analytics"

const firebaseConfig = {
  apiKey: "AIzaSyD8kPnAVN577757E_S0YMGn4Jo9Zeilqno",
  authDomain: "tazatokari-4021a.firebaseapp.com",
  databaseURL: "https://tazatokari-4021a-default-rtdb.firebaseio.com",
  projectId: "tazatokari-4021a",
  storageBucket: "tazatokari-4021a.firebasestorage.app",
  messagingSenderId: "470339614392",
  appId: "1:470339614392:web:ee4f5480e194f4d733664d",
  measurementId: "G-1ZNRFV72QB",
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

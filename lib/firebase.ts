import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getDatabase } from "firebase/database"
import { getStorage } from "firebase/storage"
import { getAnalytics } from "firebase/analytics"

const firebaseConfig = {
  apiKey: "AIzaSyDcLiR7_UPzwakdqSGY5VIuta936HBEnM8",
  authDomain: "ecoeats-b7ec2.firebaseapp.com",
  databaseURL: "https://ecoeats-b7ec2-default-rtdb.firebaseio.com",
  projectId: "ecoeats-b7ec2",
  storageBucket: "ecoeats-b7ec2.firebasestorage.app",
  messagingSenderId: "132145721059",
  appId: "1:132145721059:web:c1ec95df9a19df04c4dfd6",
  measurementId: "G-0R5MMTV85J",
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

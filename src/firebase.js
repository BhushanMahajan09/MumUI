// src/firebase.js
// Firestore wiring for Coffee-to-Code Ratio.
// Uses modular Firebase v9+ API.
// Usage:
//  - Call initFirebase() early (main.jsx already does this).
//  - Use addHistoryEntry(...) to persist a day entry to 'history'.
//  - Use fetchHistory() to load history (ordered desc by createdAt).
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  serverTimestamp
} from "firebase/firestore";

let db = null;

/**
 * Initialize Firebase app (only if env vars present)
 * Returns db or null.
 */
export function initFirebase() {
  // Only initialize if not initialized already
  if (db) return db;

  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
  };

  // If projectId missing, skip init (makes Firebase optional for local dev)
  if (!firebaseConfig.projectId) {
    console.info("Firebase config not provided. Firestore disabled (localStorage only).");
    return null;
  }

  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.info("Firebase initialized.");
    return db;
  } catch (e) {
    console.warn("Firebase init failed:", e);
    db = null;
    return null;
  }
}

/**
 * Add a history entry document to 'history' collection.
 * data: { date, cups, codingMinutes, mood, notes?, meta? }
 */
export async function addHistoryEntry(data = {}) {
  if (!db) {
    console.warn("Firestore not initialized; skipping addHistoryEntry");
    return null;
  }
  try {
    const col = collection(db, "history");
    const payload = {
      ...data,
      createdAt: serverTimestamp()
    };
    const docRef = await addDoc(col, payload);
    return { id: docRef.id, ...payload };
  } catch (e) {
    console.error("addHistoryEntry error:", e);
    throw e;
  }
}

/**
 * Fetch history entries from Firestore ordered by createdAt desc.
 * Returns array of entries (may have null createdAt if serverTimestamp hasn't resolved).
 */
export async function fetchHistory() {
  if (!db) {
    console.info("Firestore not initialized; returning [] from fetchHistory");
    return [];
  }
  try {
    const col = collection(db, "history");
    const q = query(col, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error("fetchHistory error:", e);
    return [];
  }
}

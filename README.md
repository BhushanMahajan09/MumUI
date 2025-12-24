# ☕ Coffee-to-Code Ratio

A playful UI for casually tracking coffee and coding sessions.
This branch includes Firestore wiring (optional) to persist history remotely,
and a production-ready Vercel config.

## Local development

1. Install dependencies:
   npm install

2. Copy `.env.example` -> `.env` and fill Firebase values if you want remote persistence.
   If you leave env vars empty, the app will gracefully use localStorage only.

3. Run dev server:
   npm run dev
   Open http://localhost:5173

## How Firestore is used

- On "Wrap up today" (Reset Today), the app:
  - Adds the snapshot to the local history immediately (snappy UX).
  - Attempts to persist the snapshot to Firestore's `history` collection (if Firebase is configured).
- On app load, the app attempts to fetch remote `history` and merge with local history.
- Firestore is optional; localStorage remains the primary fast store.

## Vercel deployment

1. Push the branch to GitHub (e.g. feature/firestore-wiring-and-deploy).
2. In Vercel, Import Project -> select repository.
3. In Vercel Project Settings -> Environment Variables, add the following (matching values in `.env`):
   - VITE_FIREBASE_API_KEY
   - VITE_FIREBASE_AUTH_DOMAIN
   - VITE_FIREBASE_PROJECT_ID
   - VITE_FIREBASE_STORAGE_BUCKET
   - VITE_FIREBASE_MESSAGING_SENDER_ID
   - VITE_FIREBASE_APP_ID
4. Build & Output:
   - Build Command: npm run build
   - Output Directory: dist
   (The included vercel.json sets @vercel/static-build to output `dist`.)

5. Deploy.

## Notes & tips

- No authentication is included — Firestore rules should be configured appropriately if enabling writes in production.
- Using serverTimestamp ensures Firestore stores canonical timestamps; the UI uses local date for immediate display.
- If you want to restrict remote writes, consider an admin-only Cloud Function or authenticated users.

Enjoy! ☕🚀

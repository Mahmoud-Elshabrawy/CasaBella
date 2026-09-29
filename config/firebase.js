const { initializeApp, cert } = require("firebase-admin/app");

let firebaseApp = null;

if (
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY
) {
  firebaseApp = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });

  console.log("Firebase Admin initialized");
} else {
  console.warn(
    "Firebase Admin not initialized: missing Firebase configuration",
  );
}

module.exports = firebaseApp;

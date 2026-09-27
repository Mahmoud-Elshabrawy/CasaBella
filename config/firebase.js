const { initializeApp, cert } = require("firebase-admin/app");

const firebaseApp = initializeApp({
  Credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
});

console.log("Firebase Admin initialized");


module.exports = firebaseApp;

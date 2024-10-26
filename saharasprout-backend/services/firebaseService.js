const admin = require("firebase-admin");
const serviceAccount = require("../service-file/saharasprout-firebase-adminsdk-67rws-4e9489c498.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
});

module.exports = admin;

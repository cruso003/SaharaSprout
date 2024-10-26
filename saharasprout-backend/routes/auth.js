const express = require('express');
const { OAuth2Client } = require("google-auth-library");
const router = express.Router();
const admin = require("../services/firebaseService");
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// Import verifyToken middleware
const verifyToken = require('../middleware/auth');

// Route for verifying Google ID token
router.post('/google', async (req, res) => {
  const { idToken } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    
    const { sub: uid, name, email, picture } = ticket.getPayload();

    // Save user information in Firestore
    const userRef = admin.firestore().collection('users').doc(uid);
    await userRef.set({
      name,
      email,
      picture,
      lastLogin: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    // Generate a custom token for the user
    const customToken = await admin.auth().createCustomToken(uid);

    return res.status(200).json({ uid, email, customToken, name, picture });
  } catch (error) {
    console.error('Error verifying token or saving user:', error);
    return res.status(401).send('Invalid Google ID token');
  }
});

// Protected route example
router.get('/protected', verifyToken, (req, res) => {
  res.send(`Hello ${req.user.email}, welcome to the protected route!`);
});

module.exports = router;

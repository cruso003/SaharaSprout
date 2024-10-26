// Add this in your routes file (e.g., `test.js`)
const express = require('express');
const router = express.Router();
const admin = require('../services/firebaseService');

router.get('/test-firestore', async (req, res) => {
  try {
    const db = admin.firestore();
    const docRef = db.collection('testCollection').doc('testDocument');

    await docRef.set({
      message: 'Hello, Firestore!',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(200).send('Firestore is set up and working!');
  } catch (error) {
    console.error('Error testing Firestore:', error);
    res.status(500).send('Firestore setup failed.');
  }
});

module.exports = router;

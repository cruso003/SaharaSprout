// routes/moisture.js
const express = require('express');
const router = express.Router();
const admin = require("../services/firebaseService");

// Route to receive moisture data
router.post('/moisture', async (req, res) => {
  const { value } = req.body;

  try {
    // Save moisture value in Firestore
    const moistureRef = admin.firestore().collection('moisture').doc();
    await moistureRef.set({
      value: value,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({ message: 'Moisture data saved successfully!' });
  } catch (error) {
    console.error('Error saving moisture data:', error);
    res.status(500).json({ error: 'Failed to save moisture data' });
  }
});

module.exports = router;

// routes/moisture.js
const express = require('express');
const router = express.Router();
const admin = require("../services/firebaseService");

// Route to receive moisture data
router.post('/moisture', async (req, res) => {
  const { value, deviceId } = req.body;

  if (!deviceId) {
    return res.status(400).json({ error: 'Device ID is required' });
  }

  try {
    // Get device information
    const deviceRef = admin.firestore().collection('devices').doc(deviceId);
    const deviceDoc = await deviceRef.get();

    if (!deviceDoc.exists) {
      return res.status(404).json({ error: 'Device not found' });
    }

    const deviceData = deviceDoc.data();

    // Save moisture reading
    const readingsRef = admin.firestore()
      .collection('devices')
      .doc(deviceId)
      .collection('readings')
      .doc();

    await readingsRef.set({
      value,
      type: 'moisture',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Check if irrigation should be triggered based on threshold
    if (value < parseInt(deviceData.moistureThreshold)) {
      // Update device status to indicate irrigation needed
      await deviceRef.update({
        'subDevices.moistureSensor.lastReading': value,
        'subDevices.moistureSensor.lastUpdate': admin.firestore.FieldValue.serverTimestamp(),
        irrigationNeeded: true
      });
    }

    res.status(200).json({ 
      message: 'Moisture data saved successfully!',
      irrigationNeeded: value < parseInt(deviceData.moistureThreshold)
    });
  } catch (error) {
    console.error('Error saving moisture data:', error);
    res.status(500).json({ error: 'Failed to save moisture data' });
  }
});

module.exports = router;
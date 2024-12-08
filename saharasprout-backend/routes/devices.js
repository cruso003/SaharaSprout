const express = require('express');
const router = express.Router();
const admin = require('../services/firebaseService');
const verifyToken = require('../middleware/auth');

// Get all devices for a user
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const devicesSnapshot = await admin.firestore()
      .collection('devices')
      .where('userId', '==', userId)
      .get();

    if (devicesSnapshot.empty) {
      return res.status(200).json({ devices: [] });
    }

    const devices = [];
    devicesSnapshot.forEach(doc => {
      devices.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.status(200).json({ devices });
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ 
      error: 'Failed to fetch devices',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

// Get a specific device
router.get('/:userId/device/:deviceId', verifyToken, async (req, res) => {
  const { userId, deviceId } = req.params;

  try {
    const deviceDoc = await admin.firestore()
      .collection('devices')
      .doc(deviceId)
      .get();

    if (!deviceDoc.exists) {
      return res.status(404).json({ error: 'Device not found' });
    }

    const deviceData = deviceDoc.data();
    
    // Verify device belongs to user
    if (deviceData.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to access this device' });
    }

    res.status(200).json({
      id: deviceDoc.id,
      ...deviceData
    });
  } catch (error) {
    console.error('Error fetching device:', error);
    res.status(500).json({ 
      error: 'Failed to fetch device',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

// Add a new device
router.post('/:userId/device', async (req, res) => {
  const { userId } = req.params;
  const deviceData = req.body;

  try {
    // Validate required fields
    if (!deviceData.name || !deviceData.type) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['name', 'type']
      });
    }

    // Check if farm exists
    const farmDoc = await admin.firestore()
      .collection('farms')
      .doc(deviceData.farmId)
      .get();

    if (!farmDoc.exists) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    // Verify farm belongs to user
    const farmData = farmDoc.data();
    if (farmData.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to add devices to this farm' });
    }

    const deviceRef = admin.firestore().collection('devices').doc();
    
    await deviceRef.set({
      userId,
      farmId: deviceData.farmId,
      name: deviceData.name,
      type: deviceData.type,
      location: deviceData.location || '',
      status: 'active',
      model: deviceData.model || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastUpdate: admin.firestore.FieldValue.serverTimestamp(),
      moistureThreshold: deviceData.moistureThreshold || 30,
      systemStatusNotifications: deviceData.systemStatusNotifications || true,
      preferredAlertTimes: deviceData.preferredAlertTimes || 'anytime',
      subDevices: deviceData.subDevices || {}
    });

    const newDeviceDoc = await deviceRef.get();

    res.status(201).json({
      message: 'Device added successfully',
      device: {
        id: deviceRef.id,
        ...newDeviceDoc.data()
      }
    });
  } catch (error) {
    console.error('Error adding device:', error);
    res.status(500).json({ 
      error: 'Failed to add device',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

// Update device
router.put('/:userId/device/:deviceId', verifyToken, async (req, res) => {
  const { userId, deviceId } = req.params;
  const updates = req.body;

  try {
    const deviceRef = admin.firestore().collection('devices').doc(deviceId);
    const deviceDoc = await deviceRef.get();

    if (!deviceDoc.exists) {
      return res.status(404).json({ error: 'Device not found' });
    }

    const deviceData = deviceDoc.data();
    if (deviceData.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this device' });
    }

    // Remove any fields that shouldn't be updated
    delete updates.userId;
    delete updates.createdAt;
    delete updates.id;

    await deviceRef.update({
      ...updates,
      lastUpdate: admin.firestore.FieldValue.serverTimestamp()
    });

    const updatedDoc = await deviceRef.get();

    res.status(200).json({
      message: 'Device updated successfully',
      device: {
        id: deviceId,
        ...updatedDoc.data()
      }
    });
  } catch (error) {
    console.error('Error updating device:', error);
    res.status(500).json({ 
      error: 'Failed to update device',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

// Delete device
router.delete('/:userId/device/:deviceId', verifyToken, async (req, res) => {
  const { userId, deviceId } = req.params;

  try {
    const deviceRef = admin.firestore().collection('devices').doc(deviceId);
    const deviceDoc = await deviceRef.get();

    if (!deviceDoc.exists) {
      return res.status(404).json({ error: 'Device not found' });
    }

    const deviceData = deviceDoc.data();
    if (deviceData.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this device' });
    }

    await deviceRef.delete();

    res.status(200).json({
      message: 'Device deleted successfully',
      deviceId
    });
  } catch (error) {
    console.error('Error deleting device:', error);
    res.status(500).json({ 
      error: 'Failed to delete device',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

module.exports = router;

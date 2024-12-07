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

    // Check if user exists and has completed profile
    const userRef = admin.firestore().collection('users').doc(uid);
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      // Update login timestamp
      await userRef.update({
        lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      return res.status(200).json({
        uid,
        email,
        name,
        picture,
        profileComplete: Boolean(userData.phoneNumber && userData.address),
        ...userData
      });
    }

    // New user - create basic profile
    await userRef.set({
      name,
      email,
      picture,
      profileComplete: false,
      lastLogin: admin.firestore.FieldValue.serverTimestamp(),
    });

    const customToken = await admin.auth().createCustomToken(uid);
    return res.status(200).json({
      uid,
      email,
      name,
      picture,
      profileComplete: false,
      customToken
    });

  } catch (error) {
    console.error('Error verifying token or saving user:', error);
    return res.status(401).send('Invalid Google ID token');
  }
});

// Add route for completing profile
router.post('/complete-profile', verifyToken, async (req, res) => {
  const uid = req.user.uid;
  const {
    // Personal Information
    primaryPhone,
    secondaryPhone,
    preferredContactMethod,
    timeZone,
    
    // Farm Information
    farm: {
      name: farmName,
      address: farmAddress,
      size: farmSize,
      sizeUnit,
      cropTypes,
      soilType,
      climateType
    },
    
    // Device Configuration
    device: {
      id: deviceId,
      name: deviceName,
      location: deviceLocation,
      type: deviceType
    },
    
    // Alert Preferences
    alerts: {
      moistureThreshold,
      systemStatusNotifications,
      maintenanceAlerts,
      preferredAlertTimes,
      emergencyContact
    }
  } = req.body;

  try {
    const userRef = admin.firestore().collection('users').doc(uid);
    const farmRef = admin.firestore().collection('farms').doc();
    const deviceRef = admin.firestore().collection('devices').doc(deviceId);

    // Start a batch write to ensure all operations succeed or fail together
    const batch = admin.firestore().batch();

    // Update user profile
    batch.update(userRef, {
      primaryPhone,
      secondaryPhone,
      preferredContactMethod,
      timeZone,
      profileComplete: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Create farm document
    batch.set(farmRef, {
      userId: uid,
      name: farmName,
      address: farmAddress,
      size: farmSize,
      sizeUnit,
      cropTypes,
      soilType,
      climateType,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Create device document
    batch.set(deviceRef, {
      userId: uid,
      farmId: farmRef.id,
      name: deviceName,
      location: deviceLocation,
      type: deviceType,
      moistureThreshold,
      systemStatusNotifications,
      maintenanceAlerts,
      preferredAlertTimes,
      emergencyContact,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    await batch.commit();

    res.status(200).json({
      message: 'Profile completed successfully',
      farmId: farmRef.id,
      deviceId
    });
  } catch (error) {
    console.error('Error completing profile:', error);
    res.status(500).json({ error: 'Failed to complete profile' });
  }
});

// Protected route example
router.get('/protected', verifyToken, (req, res) => {
  res.send(`Hello ${req.user.email}, welcome to the protected route!`);
});

module.exports = router;

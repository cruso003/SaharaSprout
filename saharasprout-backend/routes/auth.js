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
    
    // Basic Farm Information
    farm: {
      name: farmName,
      location: farmLocation,
      country
    },
    
    // Device Configuration
    mainDevice: {
      id: mainDeviceId,
      name: mainDeviceName,
      location: deviceLocation
    },
    subDevices: {
      moistureSensor,
      pump,
      valve
    },
    
    // Alert Settings
    alerts: {
      moistureThreshold,
      systemStatusNotifications,
      preferredAlertTimes,
      emergencyContact
    }
  } = req.body;

  try {
    const userRef = admin.firestore().collection('users').doc(uid);
    const farmRef = admin.firestore().collection('farms').doc();
    const mainDeviceRef = admin.firestore().collection('devices').doc(mainDeviceId);

    const batch = admin.firestore().batch();

    // Update user profile
    batch.update(userRef, {
      primaryPhone,
      secondaryPhone,
      preferredContactMethod,
      profileComplete: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Create simplified farm document
    batch.set(farmRef, {
      userId: uid,
      name: farmName,
      location: farmLocation,
      country,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Create main device document
    batch.set(mainDeviceRef, {
      userId: uid,
      farmId: farmRef.id,
      name: mainDeviceName,
      type: 'controller',
      location: deviceLocation,
      model: 'ESP8266',
      moistureThreshold,
      systemStatusNotifications,
      preferredAlertTimes,
      emergencyContact,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      subDevices: {
        moistureSensor: {
          id: moistureSensor.id,
          name: moistureSensor.name,
          type: 'sensor',
          status: 'active'
        },
        pump: {
          id: pump.id,
          name: pump.name,
          type: 'pump',
          status: 'active'
        },
        valve: {
          id: valve.id,
          name: valve.name,
          type: 'valve',
          status: 'active'
        }
      }
    });

    await batch.commit();

    res.status(200).json({
      message: 'Profile completed successfully',
      farmId: farmRef.id,
      deviceId: mainDeviceId
    });
  } catch (error) {
    console.error('Error completing profile:', error);
    res.status(500).json({ error: 'Failed to complete profile' });
  }
});

// save expo push token to user account
router.post('/:userId/push-token', async (req, res) => {
  const {userId} = req.params;
  const {pushToken} = req.body;

  if (!userId || !pushToken) {
    return res
      .status(400)
      .json({message: "User ID and push token are required."});
  }

  try {
    // Save the push token to Firestore
    await db.collection("users").doc(userId).update({
      pushToken,
    });

    return res.status(200).json({message: "Push token saved successfully."});
  } catch (error) {
    console.error("Error saving push token:", error);
    return res.status(500).json({message: "Failed to save push token."});
  }
})

// Protected route example
router.get('/protected', verifyToken, (req, res) => {
  res.send(`Hello ${req.user.email}, welcome to the protected route!`);
});

module.exports = router;

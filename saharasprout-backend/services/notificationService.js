const admin = require("./firebaseService");
const fetch = require('node-fetch');

const sendPushNotification = async (token, title, message) => {
  try {
    if (token.startsWith('ExponentPushToken')) {
      // Send via Expo
      const messagePayload = {
        to: token,
        sound: 'default',
        title: title,
        body: message,
      };

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messagePayload),
      });

      const data = await response.json();
    } else {
      // Send via Firebase
      const messagePayload = {
        notification: {
          title: title,
          body: message,
        },
        token: token,
      };

      const response = await admin.messaging().send(messagePayload);
      console.log("Successfully sent message via Firebase:", response);
    }
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

module.exports = { sendPushNotification };

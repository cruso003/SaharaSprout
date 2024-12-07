import client from "../client";

const endpoint = "/auth";

const googleSignIn = (idToken: string) =>
  client.post(`${endpoint}/google`, { idToken });

const sendPushTokenToServer = (userId: string, pushToken: string) =>
  client.put(`${endpoint}/${userId}/push-token`, {
    notificationToken: pushToken,
  });
export default {
  googleSignIn,
  sendPushTokenToServer,
};

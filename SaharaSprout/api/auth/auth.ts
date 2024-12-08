import client from "../client";

const endpoint = "/auth";

const googleSignIn = (idToken: string) =>
  client.post(`${endpoint}/google`, { idToken });

const sendPushTokenToServer = (userId: string, pushToken: string) =>
  client.put(`${endpoint}/${userId}/push-token`, pushToken);

const completeProfile = (userId: string, data: any) =>
  client.post(`${endpoint}/${userId}/complete-profile`, data);

export default {
  googleSignIn,
  sendPushTokenToServer,
  completeProfile,
};

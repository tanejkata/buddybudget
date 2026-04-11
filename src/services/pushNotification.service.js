const { Expo } = require("expo-server-sdk");

const expo = new Expo();

async function sendPushNotification({ expoPushToken, title, body, data = {} }) {
  if (!expoPushToken || !Expo.isExpoPushToken(expoPushToken)) {
    return;
  }

  const messages = [
    {
      to: expoPushToken,
      sound: "default",
      title,
      body,
      data,
    },
  ];

  const chunks = expo.chunkPushNotifications(messages);

  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
    } catch (error) {
      console.log("Expo push send error:", error);
    }
  }
}

module.exports = {
  sendPushNotification,
};
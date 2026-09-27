const Notification = require("../models/notificationsModel");
const User = require("../models/userModel");
const { getMessaging } = require("firebase-admin/messaging");
const firebaseApp = require("../config/firebase");

exports.createNotification = async ({
  user,
  title,
  message,
  type,
  product,
  order,
  imageUrl,
}) => {
  const notification = await Notification.create({
    user,
    title,
    message,
    type,
    product,
    order,
    imageUrl,
  });

  return notification;
};

exports.sendPushNotification = async ({ token, title, message }) => {
  const pushMessage = {
    notification: {
      title: title,
      body: message,
    },
    token,
  };

  const response = await getMessaging(firebaseApp).send(pushMessage);

  return response;
};

exports.sendPushToUser = async ({ userId, title, message }) => {
  const user = await User.findById(userId).select("fcmTokens");

  if (!user || user.fcmTokens.length === 0) {
    return;
  }

  const tokens = user.fcmTokens.map((token) => token.token);

  const pushMessage = {
    notification: {
      title: title,
      body: message,
    },
    tokens,
  };

  const response =
    await getMessaging(firebaseApp).sendEachForMulticast(pushMessage);

  const invalidTokens = [];

  response.responses.forEach((result, idx) => {
    if (!result.success) {
      const errorCode = result.error?.code;
      if (
        errorCode === "messaging/invalid-registration-token" ||
        errorCode === "messaging/registration-token-not-registered"
      ) {
        invalidTokens.push(tokens[idx]);
      }
    }
  });

  if (invalidTokens.length > 0) {
    await User.findOneAndUpdate(
      { _id: userId },
      { $pull: { fcmTokens: { token: { $in: invalidTokens } } } },
    );
  }

  return response;
};

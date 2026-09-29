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

  try {
    await exports.sendPushToUser({
      userId: user,
      title,
      message,
      type: notification.type,
      order,
      product,
    });
  } catch (error) {
    console.error("Push notification failed:", error.message);
  }

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

exports.sendPushToUser = async ({
  userId,
  title,
  message,
  type,
  order,
  product,
}) => {
  if (!firebaseApp) return;
  const user = await User.findById(userId).select("fcmTokens");

  if (!user || user.fcmTokens.length === 0) {
    return;
  }

  const tokens = user.fcmTokens.map((token) => token.token);
  const data = {
    type,
  };

  if (type === "ORDER_CREATED" && order) {
    data.orderId = order.toString();
  }

  if ((type === "LOW_STOCK" || type === "OUT_OF_STOCK") && product) {
    data.productId = product.toString();
  }

  const pushMessage = {
    notification: {
      title: title,
      body: message,
    },
    data,
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

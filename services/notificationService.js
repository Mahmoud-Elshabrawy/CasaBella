const Notification = require("../models/notificationsModel");

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

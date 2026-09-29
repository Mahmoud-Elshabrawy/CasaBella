const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },

    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
    },

    order: {
      type: mongoose.Schema.ObjectId,
      ref: "Order",
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    type: {
      type: String,
      enum: ["ORDER_CREATED", "LOW_STOCK", "OUT_OF_STOCK", "PROMOTION", "SYSTEM_NOTIFICATION"],
      default: "SYSTEM_NOTIFICATION",
      required: true,
    },

    imageUrl: {
      type: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Notification", notificationSchema);

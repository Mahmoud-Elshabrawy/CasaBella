const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        name: String,
        image: String,
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    couponDiscount: {
      type: Number,
      default: 0,
    },

    couponCode: {
      type: String,
      default: null,
    },
    shippingFee: Number,
    subtotal: Number,
    totalAmount: Number,

    shippingAddress: {
      name: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },

    paymentMethod: {
      type: String,
      enum: ["cash"],
      default: "cash",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);

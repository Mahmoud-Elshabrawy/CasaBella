const Order = require("../models/orderModel");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { createOrderTransaction } = require("../services/orderService");
const { createNotification } = require("../services/notificationService");

exports.getAllOrders = catchAsync(async (req, res) => {
  const orders = await Order.find().populate({
    path: "user",
    select: "name email",
  });
  if (!orders) {
    throw new AppError("NO_ORDERS_FOUND", 404);
  }

  res.status(200).json({
    success: true,
    data: orders,
  });
});

exports.getMyOrders = catchAsync(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  if (!orders) {
    throw new AppError("NO_ORDERS_FOUND", 404);
  }

  res.status(200).json({
    success: true,
    data: orders,
  });
});

exports.getOrder = catchAsync(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) {
    throw new AppError("ORDER_NOT_FOUND", 404);
  }
  res.status(200).json({
    success: true,
    data: order,
  });
});

exports.createOrder = catchAsync(async (req, res) => {
  const {order, lowStockProducts, outOfStockProducts} = await createOrderTransaction(req.user._id, req.body);

  // create notifications
  try {
    // notification for user
    await createNotification({
      user: req.user._id,
      title: "Order Created",
      message: `Your order #${order._id} has been created successfully.`,
      order: order._id,
      type: "ORDER_CREATED",
    });

    // notification for admins
    const admin = await User.findOne({ role: "admin" }).select("_id");

    // notifications for a new order
      await createNotification({
        user: admin._id,
        title: "New Order Created",
        message: `A new order #${order._id} has been created by ${req.user.name}.`,
        type: "ORDER_CREATED",
        order: order._id,
      });
    

    // notification for admins for low stock products
    await Promise.all(
      lowStockProducts.map(product => {
        return createNotification({
          user: admin._id,
          title: "Low Stock",
          message: `Product ${product.name} has low stock. Only ${product.newStock} left.`,
          product: product._id,
          type: "LOW_STOCK",
        });
      })
    );

    // notification for admins for out of stock products
    await Promise.all(
      outOfStockProducts.map(product => {
        return createNotification({
          user: admin._id,
          title: "Out of Stock",
          message: `Product ${product.name} has been completely sold out.`,
          product: product._id,
          type: "OUT_OF_STOCK",
        });
      })
    );
  } catch (err) {
    console.log("Failed to create notification", err.message);
  }

  res.status(201).json({
    success: true,
    data: order,
  });
});

exports.getOrderByAdmin = catchAsync(async (req, res) => {
  const order = await Order.findById(req.params.id).populate({
    path: "user",
    select: "name email",
  });
  if (!order) {
    throw new AppError("ORDER_NOT_FOUND", 404);
  }
  res.status(200).json({
    success: true,
    data: order,
  });
});

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;

  const allowedStatuses = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  if (!status || !allowedStatuses.includes(status)) {
    return next(new AppError("INVALID_ORDER_STATUS", 400));
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError("ORDER_NOT_FOUND", 404));
  }

  order.status = status;

  await order.save();

  res.status(200).json({
    success: true,
    data: {
      order,
    },
  });
});

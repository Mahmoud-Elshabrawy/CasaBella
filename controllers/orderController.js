const Order = require("../models/orderModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { createOrderTransaction } = require("../services/orderService");

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
  const order = await createOrderTransaction(req.user._id, req.body);

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
})

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


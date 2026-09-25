const mongoose = require("mongoose");

const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const AppError = require("../utils/appError");

const { validateAndCalcCoupon } = require("./couponService");

exports.createOrderTransaction = async (userId, orderData) => {
  const session = await mongoose.startSession();

  let createdOrder;

  try {
    await session.withTransaction(async () => {
      const { shippingAddress, notes, couponCode } = orderData;

      if (
        !shippingAddress?.phone ||
        !shippingAddress?.name ||
        !shippingAddress?.address
      ) {
        throw new AppError("PLEASE_PROVIDE_SHIPPING_ADDRESS", 400);
      }

      const cart = await Cart.findOne({
        user: userId,
      })
        .populate({
          path: "cartItems.product",
          select: "name images price discountPrice stock isActive isAvailable",
        })
        .session(session);

      if (!cart || cart.cartItems.length === 0) {
        throw new AppError("CART_IS_EMPTY", 400);
      }

      const orderItems = [];
      let subtotal = 0;

      for (const item of cart.cartItems) {
        const product = item.product;

        if (!product) {
          throw new AppError("PRODUCT_NOT_FOUND", 404);
        }

        if (!product.isActive || !product.isAvailable) {
          throw new AppError("PRODUCT_NOT_AVAILABLE", 400);
        }

        if (item.quantity > product.stock) {
          throw new AppError("PRODUCT_QUANTITY_EXCEEDS_STOCK", 400);
        }

        const discountAmount = product.discountPrice || 0;

        const finalPrice = product.price - discountAmount;

        const itemTotal = finalPrice * item.quantity;

        subtotal += itemTotal;

        orderItems.push({
          product: product._id,
          name: product.name,
          image: product.images?.length > 0 ? product.images[0] : null,
          quantity: item.quantity,
          price: finalPrice,
        });
      }

      const shippingFee = 0;
      let couponDiscount = 0;
      let appliedCoupon;

      if (couponCode) {
        const { coupon, discountAmount } = await validateAndCalcCoupon(
          couponCode,
          subtotal,
          session,
        );
        couponDiscount = discountAmount;
        appliedCoupon = coupon;
      }

      const totalAmount = subtotal + shippingFee - couponDiscount;

      const order = new Order({
        user: userId,
        orderItems,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        shippingAddress,
        notes: notes || "",
        subtotal,
        shippingFee,
        couponDiscount,
        totalAmount,
      });

      await order.save({ session });

      if (appliedCoupon) {
        appliedCoupon.usedCount += 1
        await appliedCoupon.save({ session })
      }

      for (const item of cart.cartItems) {
        const product = item.product;

        product.stock -= item.quantity;

        await product.save({ session });
      }

      cart.cartItems = [];

      await cart.save({ session });

      createdOrder = order;
    });

    return createdOrder;
  } finally {
    await session.endSession();
  }
};

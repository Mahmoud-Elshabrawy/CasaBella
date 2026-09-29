const Coupon = require("../models/couponModel");
const AppError = require("../utils/appError");

exports.validateAndCalcCoupon = async (code, subtotal, session = null) => {
  let query = Coupon.findOne({ code: code.toUpperCase() });
  if (session) query = query.session(session);
  const coupon = await query;

  if (!coupon) throw new AppError("INVALID_COUPON");
  if (!coupon.isActive) throw new AppError("COUPON_IS_NOT_ACTIVE", 400);

  if (coupon.endDate < Date.now()) throw new AppError("COUPON_EXPIRED", 400);

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    throw new AppError("COUPON_USAGE_LIMIT_REACHED", 400);
  }

  if (subtotal < coupon.minOrderAmount) {
    throw new AppError("MIN_ORDER_AMOUNT_NOT_REACHED", 400);
  }

  let discountAmount;
  if (coupon.discountType === "fixed") discountAmount = coupon.discountValue;
  if (coupon.discountType === "percentage") {
    discountAmount = (subtotal * coupon.discountValue) / 100;
  }

  if (coupon.maxDiscountAmount !== null && discountAmount > coupon.maxDiscountAmount) {
    discountAmount = coupon.maxDiscountAmount;
  }

  discountAmount = Math.min(subtotal, discountAmount);
  return {
    coupon,
    discountAmount,
  };
};

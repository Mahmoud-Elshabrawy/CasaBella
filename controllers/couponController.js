const Coupon = require("../models/couponModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getAllCoupons = catchAsync(async (req, res, next) => {
  const coupons = await Coupon.find().sort("-createdAt");
  res.status(200).json({
    success: true,
    data: coupons,
  });
});

exports.getCoupon = catchAsync(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);
  res.json({
    success: true,
    data: coupon,
  });
});

exports.createCoupon = catchAsync(async (req, res, next) => {
  const existingCoupon = await Coupon.findOne({
    code: req.body.code?.toUpperCase(),
  });

  if (existingCoupon) {
    return next(new AppError("COUPON_ALREADY_EXISTS", 400));
  }

  const coupon = await Coupon.create(req.body);

  res.status(201).json({
    success: true,
    data: coupon,
  });
});

exports.updateCoupon = catchAsync(async (req, res, next) => {
  if ("usedCount" in req.body) {
    return next(new AppError("COUPON_USED_COUNT_CANNOT_BE_UPDATED", 400));
  }

  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) return next(new AppError("COUPON_NOT_FOUND", 404));
  Object.assign(coupon, req.body);
  await coupon.save();

  res.json({
    success: true,
    data: coupon,
  });
});

exports.deleteCoupon = catchAsync(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) return next(new AppError("COUPON_NOT_FOUND", 404));
  await coupon.deleteOne();
  res.json({
    success: true,
    data: null,
  });
});

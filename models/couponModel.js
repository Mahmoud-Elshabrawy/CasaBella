const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "COUPON_CODE_REQUIRED"],
      unique: true,
      uppercase: true,
      trim: true,
    },

    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: [true, "DISCOUNT_TYPE_REQUIRED"],
    },

    discountValue: {
      type: Number,
      required: [true, "DISCOUNT_VALUE_REQUIRED"],
      min: [1, "DISCOUNT_VALUE_MUST_BE_POSITIVE"],
      validate: {
        validator: function (val) {
          if (this.discountType === "percentage" && val >= 100) {
            return false;
          }
          return true;
        },
        message: "DISCOUNT_VALUE_CANNOT_BE_GREATER_THAN_100_FOR_PERCENTAGE",
      },
    },

    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    maxDiscountAmount: {
      type: Number,
      default: null,
      min: 0,
    },

    startDate: {
      type: Date,
      default: Date.now,
    },

    endDate: {
      type: Date,
      required: [true, "COUPON_END_DATE_REQUIRED"],
      validate: {
        validator: function (val) {
          return val > this.startDate;
        },
        message: "COUPON_END_DATE_MUST_BE_AFTER_START_DATE",
      },
    },

    usageLimit: {
      type: Number,
      default: null,
      min: 1,
    },

    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Coupon", couponSchema);

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "PRODUCT_NAME_REQUIRED"],
      trim: true,
      minlength: [3, "PRODUCT_NAME_TOO_SHORT"],
      maxlength: [255, "PRODUCT_NAME_TOO_LONG"],
    },

    description: {
      type: String,
      required: [true, "PRODUCT_DESCRIPTION_REQUIRED"],
      trim: true,
      minlength: [10, "PRODUCT_DESCRIPTION_TOO_SHORT"],
      maxlength: [1000, "PRODUCT_DESCRIPTION_TOO_LONG"],
    },

    details: {
      type: String,
      required: [true, "PRODUCT_DETAILS_REQUIRED"],
      trim: true,
      minlength: [10, "PRODUCT_DETAILS_TOO_SHORT"],
      maxlength: [3000, "PRODUCT_DETAILS_TOO_LONG"],
    },

    slug: {
      type: String,
      required: [true, "PRODUCT_SLUG_REQUIRED"],
      trim: true,
      unique: true,
      lowercase: true,
    },

    images: {
      type: [String],
      default: [],
    },

    price: {
      type: Number,
      required: [true, "PRICE_REQUIRED"],
      min: [0, "PRICE_MUST_BE_POSITIVE"],
    },

    discountPrice: {
      type: Number,
      min: [0, "DISCOUNT_PRICE_MUST_BE_POSITIVE"],
      default: null,

      validate: {
        validator: function (value) {
          if (value === null || value === undefined) return true;

          return value < this.price;
        },
        message: "DISCOUNT_PRICE_MUST_BE_LESS_THAN_PRICE",
      },
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "CATEGORY_REQUIRED"],
    },

    stock: {
      type: Number,
      required: [true, "STOCK_REQUIRED"],
      min: [0, "STOCK_MUST_BE_POSITIVE"],
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    isAvailable: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

productSchema.pre("save", function () {
  this.isAvailable = this.stock > 0;
});

module.exports = mongoose.model("Product", productSchema);

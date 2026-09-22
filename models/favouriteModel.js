const mongoose = require("mongoose");

const favouriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "USER_REQUIRED"],
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "PRODUCT_REQUIRED"],
    },
  },
  { timestamps: true },
);

favouriteSchema.index({ user: 1, product: 1 }, { unique: true });

module.exports = new mongoose.model("Favourite", favouriteSchema);

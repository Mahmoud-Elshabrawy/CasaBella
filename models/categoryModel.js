const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "CATEGORY_NAME_REQUIRED"],
      trim: true,
      unique: true,
    },
    image: String,

    mainCategory: {
      type: mongoose.Schema.ObjectId,
      ref: "MainCategory",
      required: [true, "MAIN_CATEGORY_REQUIRED"],
    },
  },
  { timestamps: true },
);

categorySchema.index(
  {
    name: 1,
    mainCategory: 1,
  },
  { unique: true },
);

module.exports = mongoose.model("Category", categorySchema);

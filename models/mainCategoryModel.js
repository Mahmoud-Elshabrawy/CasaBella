const mongoose = require("mongoose");

const mainCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "MAIN_CATEGORY_NAME_REQUIRED"],
    trim: true,
    unique: true,
  },

  image: String,
  description: String,
  slug: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },

}, {timestamps: true});

module.exports = mongoose.model("MainCategory", mainCategorySchema);

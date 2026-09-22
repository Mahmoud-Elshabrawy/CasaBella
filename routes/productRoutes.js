const express = require("express");
const { uploadMultipleImages } = require("../middlewares/uploadMiddleware");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

const {
  getAllProducts,
  setCategoryFilter,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(setCategoryFilter, getAllProducts)
  .post(
    protect,
    restrictTo("admin"),
    uploadMultipleImages("products", "images", 5),
    createProduct,
  );

router
  .route("/:id")
  .get(getProduct)
  .patch(protect, restrictTo("admin"), uploadMultipleImages("products", "images", 5), updateProduct)
  .delete(protect, restrictTo("admin"), deleteProduct);

module.exports = router;

const express = require("express");
const { uploadMultipleImages } = require("../middlewares/uploadMiddleware");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

const {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const router = express.Router();

router
  .route("/")
  .get(getAllProducts)
  .post(
    protect,
    restrictTo("admin"),
    uploadMultipleImages("products", "images", 5),
    createProduct,
  );

router
  .route("/:id")
  .get(getProduct)
  .patch(protect, restrictTo("admin"), updateProduct)
  .delete(protect, restrictTo("admin"), deleteProduct);

module.exports = router;

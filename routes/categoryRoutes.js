const express = require("express");

const { protect, restrictTo } = require("../middlewares/authMiddleware");

const {
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const productRoutes = require("./productRoutes");

const router = express.Router();

router.use("/:categoryId/products", productRoutes);

router
  .route("/")
  .get(getAllCategories)
  .post(protect, restrictTo("admin"), createCategory);

router
  .route("/:id")
  .get(getCategory)
  .patch(protect, restrictTo("admin"), updateCategory)
  .delete(protect, restrictTo("admin"), deleteCategory);

module.exports = router;
